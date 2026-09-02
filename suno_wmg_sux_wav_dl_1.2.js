(() => {
  if (window.__sunoRecBg) return console.log("[suno-rec] already on");

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = (...a) => console.log("[suno-rec]", ...a);

  const WORKLET = `
class TapProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    if (input && input.length && input[0] && input[0].length) {
      const copy = input.map((ch) => {
        const a = new Float32Array(ch.length);
        a.set(ch);
        return a;
      });
      this.port.postMessage(copy);
      for (let i = 0; i < output.length; i++) {
        if (input[i] && output[i]) output[i].set(input[i]);
      }
    }
    return true;
  }
}
registerProcessor("suno-tap", TapProcessor);
`;

  let ctx = null, workletReady = false, running = false;
  const sources = new WeakMap();
  const usedNames = new Set();

  const getTitle = () => {
    const a = document.querySelector('a[aria-label^="Playbar: Title for"]');
    let raw = (a?.textContent || "").trim();
    if (!raw) {
      const label = a?.getAttribute("aria-label") || "";
      raw = label.replace(/^Playbar:\s*Title for\s*/i, "").trim();
    }
    raw = raw.replace(/[\/\\?%*:|"<>]/g, "-").replace(/\s+/g, " ").slice(0, 120);
    return raw || "suno";
  };

  const uniqueName = (base) => {
    let name = base + ".wav";
    let n = 2;
    while (usedNames.has(name.toLowerCase())) {
      name = `${base} (${n}).wav`;
      n++;
    }
    usedNames.add(name.toLowerCase());
    return name;
  };

  const saveBlob = (blob, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    log("saved", name, blob.size);
  };

  const encodeWav32f = (channels, sampleRate) => {
    const nCh = channels.length, frames = channels[0].length;
    const dataBytes = frames * nCh * 4;
    const buf = new ArrayBuffer(44 + dataBytes);
    const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + dataBytes, true);
    w(8, "WAVEfmt ");
    v.setUint32(16, 16, true);
    v.setUint16(20, 3, true);
    v.setUint16(22, nCh, true);
    v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * nCh * 4, true);
    v.setUint16(32, nCh * 4, true);
    v.setUint16(34, 32, true);
    w(36, "data"); v.setUint32(40, dataBytes, true);
    for (let i = 0; i < frames; i++)
      for (let c = 0; c < nCh; c++)
        v.setFloat32(44 + (i * nCh + c) * 4, channels[c][i], true);
    return new Blob([buf], { type: "audio/wav" });
  };

  const ensureCtx = async () => {
    if (!ctx || ctx.state === "closed") { ctx = new AudioContext(); workletReady = false; }
    if (ctx.state === "suspended") await ctx.resume();
    if (!workletReady) {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: "text/javascript" }));
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      workletReady = true;
    }
    return ctx;
  };

  const hookElement = async (el) => {
    await ensureCtx();
    if (sources.has(el)) return sources.get(el);
    let src;
    try {
      src = ctx.createMediaElementSource(el);
    } catch (e) {
      const cap = el.captureStream();
      if (!cap.getAudioTracks().length) throw "no audio tracks";
      src = ctx.createMediaStreamSource(cap);
    }
    const mute = ctx.createGain();
    mute.gain.value = 0;
    src.connect(mute);
    mute.connect(ctx.destination);
    sources.set(el, src);
    log("silent tap on", el.currentSrc);
    return src;
  };

  const pickPlayer = () => {
    const els = [...document.querySelectorAll("audio,video")].map((el) => {
      const src = el.currentSrc || el.src || "";
      let score = 0;
      if (src.startsWith("blob:")) score += 50;
      if (el.duration > 30 && isFinite(el.duration)) score += 30;
      if (!el.paused) score += 20;
      if (el.readyState >= 3) score += 10;
      if (src.includes("sil-100")) score -= 100;
      return { el, src, score };
    }).sort((a, b) => b.score - a.score);
    return els[0]?.score > 0 ? els[0].el : null;
  };

  const trackId = (el) => (el.currentSrc || el.src || "") + "|" + (el.duration || 0).toFixed(2);

  const recordOne = async (el) => {
    const srcNode = await hookElement(el);
    const node = new AudioWorkletNode(ctx, "suno-tap", {
      numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2],
    });
    const chunks = [[], []];
    let frames = 0;
    node.port.onmessage = (ev) => {
      const chans = ev.data;
      if (!chans[0]) return;
      let peak = 0;
      for (let i = 0; i < chans[0].length; i++) peak = Math.max(peak, Math.abs(chans[0][i]));
      if (peak < 0.0001 && frames === 0) return;
      chunks[0].push(chans[0]);
      chunks[1].push(chans[1] || chans[0]);
      frames += chans[0].length;
    };
    srcNode.connect(node);

    el.muted = false;
    el.volume = 1;
    el.playbackRate = 1;
    el.currentTime = 0;
    await el.play().catch(() => {});
    const id = trackId(el);
    const titleAtStart = getTitle();
    log("track start", titleAtStart, "dur", el.duration);

    await new Promise((resolve) => {
      const tick = setInterval(() => {
        if (!running) { clearInterval(tick); resolve(); return; }
        if (trackId(el) !== id) { clearInterval(tick); resolve(); return; }
        log("frames", frames, "t", el.currentTime.toFixed(1), getTitle());
      }, 2000);
      const done = () => { clearInterval(tick); resolve(); };
      el.addEventListener("ended", done, { once: true });
    });

    await wait(120);
    try { node.port.close(); } catch (e) {}
    try { node.disconnect(); } catch (e) {}

    if (!frames) {
      log("skip empty");
      return;
    }
    const merge = (arr) => {
      const out = new Float32Array(frames);
      let o = 0;
      for (const p of arr) { out.set(p, o); o += p.length; }
      return out;
    };
    const title = getTitle() || titleAtStart || "suno";
    saveBlob(
      encodeWav32f([merge(chunks[0]), merge(chunks[1])], ctx.sampleRate),
      uniqueName(title)
    );
  };

  const loop = async () => {
    running = true;
    btn.textContent = "STOP PLAYLIST";
    btn.style.background = "#16a34a";
    log("playlist rec on");
    let last = "";
    while (running) {
      let el = pickPlayer();
      if (!el) { await wait(400); continue; }
      const id = trackId(el);
      if (id === last && !el.paused && el.currentTime > 2) {
        await wait(400);
        continue;
      }
      last = id;
      try { await recordOne(el); }
      catch (e) { console.error(e); await wait(800); }
      await wait(400);
    }
    btn.textContent = "REC PLAYLIST";
    btn.style.background = "#e11";
    log("stopped");
  };

  const btn = document.createElement("button");
  btn.textContent = "REC PLAYLIST";
  Object.assign(btn.style, {
    position: "fixed", zIndex: 2147483647, right: "16px", bottom: "16px",
    padding: "12px 16px", background: "#e11", color: "#fff", border: "0",
    font: "bold 14px sans-serif", cursor: "pointer", borderRadius: "8px",
  });
  btn.onclick = async () => {
    if (running) { running = false; return; }
    await ensureCtx();
    loop();
  };
  document.body.appendChild(btn);
  window.__sunoRecBg = true;
  log("v1.2-bg titled. REC PLAYLIST → files named from playbar title, e.g. Gabber Psy-Trance (@promofy2843 Darksynth Remix V2).wav");
})();

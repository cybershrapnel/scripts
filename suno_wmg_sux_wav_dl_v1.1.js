(() => {
  if (window.__sunoRec12) return console.log("[suno-rec] already on");

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

  let ctx = null;
  let workletReady = false;
  const sources = new WeakMap();

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
    const nCh = channels.length;
    const frames = channels[0].length;
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
    for (let i = 0; i < frames; i++) {
      for (let c = 0; c < nCh; c++) {
        v.setFloat32(44 + (i * nCh + c) * 4, channels[c][i], true);
      }
    }
    return new Blob([buf], { type: "audio/wav" });
  };

  const ensureCtx = async () => {
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext();
      workletReady = false;
    }
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
      src.connect(ctx.destination);
      log("tapped element", el.currentSrc);
    } catch (e) {
      log("createMediaElementSource failed, captureStream", e.message);
      const cap = el.captureStream();
      if (!cap.getAudioTracks().length) throw "no audio tracks";
      src = ctx.createMediaStreamSource(cap);
      src.connect(ctx.destination);
    }
    sources.set(el, src);
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
      return { el, src, score, dur: el.duration, paused: el.paused };
    }).sort((a, b) => b.score - a.score);
    log("players", els.map((s) => ({ src: s.src.slice(0, 56), score: s.score, dur: s.dur, paused: s.paused })));
    return els[0]?.score > 0 ? els[0].el : null;
  };

  const record = async (el) => {
    const srcNode = await hookElement(el);
    const node = new AudioWorkletNode(ctx, "suno-tap", {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
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
    if (el.currentTime > 1) el.currentTime = 0;
    await el.play();
    log("recording", el.currentSrc, "dur", el.duration);

    await new Promise((resolve) => {
      const t = setInterval(() => log("frames", frames, "t", el.currentTime.toFixed(1)), 2000);
      const done = () => { clearInterval(t); resolve(); };
      el.addEventListener("ended", done, { once: true });
      window.__sunoStop = done;
    });

    await wait(150);
    try { node.port.close(); } catch (e) {}
    try { node.disconnect(); } catch (e) {}
    // leave srcNode -> destination so the next song still has sound

    if (!frames) throw "recorded silence — wait until you hear it, then click SAVE";

    const merge = (arr) => {
      const out = new Float32Array(frames);
      let o = 0;
      for (const p of arr) { out.set(p, o); o += p.length; }
      return out;
    };
    const title = (document.title || "suno").replace(/[^\w\- ]+/g, "").slice(0, 60);
    saveBlob(
      encodeWav32f([merge(chunks[0]), merge(chunks[1])], ctx.sampleRate),
      `${title || "suno"}-32f.wav`
    );
    log("still hooked — play another song and click SAVE again. no reload.");
  };

  const btn = document.createElement("button");
  btn.textContent = "SAVE PLAYING";
  Object.assign(btn.style, {
    position: "fixed", zIndex: 2147483647, right: "16px", bottom: "16px",
    padding: "12px 16px", background: "#e11", color: "#fff", border: "0",
    font: "bold 14px sans-serif", cursor: "pointer", borderRadius: "8px",
  });
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "RECORDING…";
    try {
      let el = pickPlayer();
      if (!el) {
        log("click play");
        while (!el) { await wait(300); el = pickPlayer(); }
      }
      await record(el);
    } catch (e) {
      console.error(e);
      alert(String(e));
    }
    btn.disabled = false;
    btn.textContent = "SAVE PLAYING";
  };
  document.body.appendChild(btn);
  window.__sunoRec12 = true;
  log("v1.2 ready. Play → hear it → SAVE → let it end. Next song does not need a reload.");
})();

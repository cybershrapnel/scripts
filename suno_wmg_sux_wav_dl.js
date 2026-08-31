//adds a download playing song button where the mute button is on the media player bar. will restart current song and pipe the audio through a wave recorder and the saves the wav as a download when the song finishes playing. must let song play all the way through make sure volume is at 100%.
//This was built to work from a playlist page.

(() => {
  if (window.__sunoRec) return console.log("already on — click the red SAVE button");

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = (...a) => console.log("[suno-rec]", ...a);

  const saveBlob = (blob, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    log("saved", name, blob.size);
  };

  const encodeWav = (lChans, rChans, sampleRate) => {
    let len = 0;
    for (const c of lChans) len += c.length;
    const stereo = rChans.length > 0;
    const samples = stereo ? len * 2 : len;
    const buf = new ArrayBuffer(44 + samples * 2);
    const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + samples * 2, true);
    w(8, "WAVEfmt "); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, stereo ? 2 : 1, true);
    v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * (stereo ? 2 : 1) * 2, true);
    v.setUint16(32, (stereo ? 2 : 1) * 2, true);
    v.setUint16(34, 16, true);
    w(36, "data"); v.setUint32(40, samples * 2, true);
    let o = 44;
    for (let i = 0, off = 0; i < lChans.length; i++) {
      const L = lChans[i], R = rChans[i];
      for (let j = 0; j < L.length; j++) {
        const ls = Math.max(-1, Math.min(1, L[j]));
        v.setInt16(o, ls * 32767, true); o += 2;
        if (stereo) {
          const rs = Math.max(-1, Math.min(1, (R && R[j]) || 0));
          v.setInt16(o, rs * 32767, true); o += 2;
        }
      }
      off += L.length;
    }
    return new Blob([buf], { type: "audio/wav" });
  };

  const pickPlayer = () => {
    const els = [...document.querySelectorAll("audio,video")];
    const scored = els.map((el) => {
      const src = el.currentSrc || el.src || "";
      let score = 0;
      if (src.startsWith("blob:")) score += 50;
      if (el.duration > 30 && isFinite(el.duration)) score += 30;
      if (!el.paused) score += 20;
      if (el.readyState >= 3) score += 10;
      if (src.includes("sil-100")) score -= 100;
      return { el, src, score, dur: el.duration, paused: el.paused, rs: el.readyState };
    }).sort((a, b) => b.score - a.score);
    log("players", scored.map((s) => ({ src: s.src.slice(0, 60), score: s.score, dur: s.dur, paused: s.paused })));
    return scored[0]?.score > 0 ? scored[0].el : null;
  };

  const recordWav = async (el) => {
    const ctx = new AudioContext();
    await ctx.resume();
    let src;
    try {
      src = ctx.createMediaElementSource(el);
    } catch (e) {
      log("element already tapped, using captureStream", e.message);
      const cap = el.captureStream();
      if (!cap.getAudioTracks().length) throw "no audio tracks on captureStream";
      src = ctx.createMediaStreamSource(cap);
    }
    const proc = ctx.createScriptProcessor(4096, 2, 2);
    const L = [], R = [];
    let got = 0;
    proc.onaudioprocess = (ev) => {
      const l = ev.inputBuffer.getChannelData(0);
      const r = ev.inputBuffer.numberOfChannels > 1 ? ev.inputBuffer.getChannelData(1) : l;
      let peak = 0;
      for (let i = 0; i < l.length; i++) peak = Math.max(peak, Math.abs(l[i]));
      if (peak > 0.0001) {
        L.push(new Float32Array(l));
        R.push(new Float32Array(r));
        got += l.length;
      }
    };
    src.connect(proc);
    proc.connect(ctx.destination);

    el.currentTime = 0;
    el.muted = false;
    el.volume = 1;
    el.playbackRate = 1;
    await el.play();
    log("recording wav from", el.currentSrc, "dur", el.duration);

    await new Promise((resolve) => {
      const t = setInterval(() => log("samples", got, "t", el.currentTime.toFixed(1)), 2000);
      el.addEventListener("ended", () => { clearInterval(t); resolve(); }, { once: true });
    });

    proc.disconnect();
    src.disconnect();
    await wait(100);
    if (!got) throw "recorded silence — wrong element or muted";
    saveBlob(encodeWav(L, R, ctx.sampleRate), "suno-player.wav");
  };

  const btn = document.createElement("button");
  btn.textContent = "SAVE PLAYING";
  Object.assign(btn.style, {
    position: "fixed", zIndex: 2147483647, right: "16px", bottom: "16px",
    padding: "12px 16px", background: "#e11", color: "#fff", border: "0",
    font: "bold 14px sans-serif", cursor: "pointer", borderRadius: "8px"
  });
  btn.onclick = async () => {
    btn.disabled = true;
    try {
      let el = pickPlayer();
      if (!el) {
        log("no player yet — click play");
        while (!el) { await wait(300); el = pickPlayer(); }
      }
      await recordWav(el);
    } catch (e) {
      console.error(e);
      alert(String(e));
    }
    btn.disabled = false;
  };
  document.body.appendChild(btn);

  window.__sunoRec = { pickPlayer, recordWav };
  log("button added bottom-right. Play the song, wait until you HEAR it, then click SAVE PLAYING. Let it finish.");
})();

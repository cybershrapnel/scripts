(() => {
  "use strict";

  const CHECK_EVERY_MS = 500;
  const AUDIO_ID = "active-audio-play";
  const CDN_PREFIX = "https://cdn1.suno.ai/";
  const FIRST_UUID = "1f731fe0-88da-49e1-8077-6e020e8c8969";

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function randomUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async function probeUrlFetch(url) {
    try {
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      return { ok: r.ok, status: r.status };
    } catch {
      return { ok: false, status: 0 };
    }
  }

  async function downloadAsBlobOrDirect(url, filename) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (e) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      a.click();
    }
  }

  function loadIntoActiveAudio(url) {
    const el = document.getElementById(AUDIO_ID);
    if (!el) throw new Error(`Missing <audio id="${AUDIO_ID}">`);
    el.crossOrigin = el.crossOrigin || "anonymous";
    el.src = url;
    el.load();
    console.log(`Loaded into #${AUDIO_ID}: ${url}`);
    return el;
  }

  async function pressButtonSequence() {
    const playBtn = document.querySelector('button[aria-label="Playbar: Play button"]');
    const pauseBtn = document.querySelector('button[aria-label="Playbar: Pause button"]');

    if (playBtn) {
      playBtn.click();
      console.log("▶️ Clicked Play button (startup)");
    } else {
      console.warn("⚠️ Play button not found at startup.");
    }

    await sleep(500);

    if (pauseBtn) {
      pauseBtn.click();
      console.log("⏸️ Clicked Pause button (500 ms later)");
    } else {
      console.warn("⚠️ Pause button not found at startup.");
    }
  }

  async function pressPlaybackButton() {
    await sleep(1000);
    let btn =
      document.querySelector('button[aria-label="Playbar: Pause button"]') ||
      document.querySelector('button[aria-label="Playbar: Play button"]');
    if (btn) {
      btn.click();
      console.log(`✅ Clicked after load: ${btn.getAttribute("aria-label")}`);
    } else {
      console.warn("⚠️ No play/pause button found on page.");
    }
  }

  // Stop previous run
  window.__nczCdnTool__?.stop?.();
  let stopped = false;
  let attempt = 0;

  window.__nczCdnTool__ = {
    stop() {
      stopped = true;
      console.log("Stopped scanning.");
    },
  };

  (async function autoRun() {
    console.log("Auto-scanner starting...");
    await pressButtonSequence(); // 🟢 Run startup click sequence first
    console.log("Auto-scanner started. Stop with __nczCdnTool__.stop()");

    const uuids = [FIRST_UUID];

    while (!stopped) {
      const uuid = uuids.shift() || randomUuid();
      attempt++;

      const base = `${CDN_PREFIX}${uuid}`;
      const mp3 = `${base}.mp3`;

      console.log(`[Try #${attempt}] ${uuid} → checking mp3`);
      const mp3Res = await probeUrlFetch(mp3);

      if (mp3Res.ok) {
        console.log(`FOUND mp3: ${mp3}`);
        await downloadAsBlobOrDirect(mp3, `suno-${uuid}.mp3`);
        loadIntoActiveAudio(mp3);
        pressPlaybackButton(); // 🔁 after each load
      } else {
        console.log(`MP3 error (${mp3Res.status}), skipping.`);
      }

      await sleep(CHECK_EVERY_MS);
    }
  })();
})();

(() => {
  "use strict";

  const RIGHT_ID = "__dedupe_panel__";
  const LOG_PREFIX = "[AutoLike]";

  // ---- Timing knobs ----
  const LIKE_DELAY_MIN_MS = 8_000;
  const LIKE_DELAY_MAX_MS = 20_000;

  const BREAK_MIN_MS = 5 * 60_000;   // 5 min
  const BREAK_MAX_MS = 10 * 60_000;  // 10 min

  const THROTTLE_BREAK_MS = 15 * 60_000; // 15 min on 429

  // Random likes per iteration/burst
  const BURST_LIKES_MIN = 25;
  const BURST_LIKES_MAX = 60;

  // Stop an existing run if you re-paste
  if (window.__dedupeAutoLike__?.stop) {
    window.__dedupeAutoLike__.stop();
  }

  // ---- Capture originals ----
  const origConsole = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  const log = (msg) => origConsole.log(`${LOG_PREFIX} ${msg}`);
  const warn = (msg) => origConsole.warn(`${LOG_PREFIX} ${msg}`);

  // ---- Utils ----
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randMs = (minMs, maxMs) => randInt(minMs, maxMs);
  const norm = (s) => String(s || "").trim().toLowerCase();

  function fmtMs(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (m <= 0) return `${r}s`;
    return `${m}m${String(r).padStart(2, "0")}s`;
    }

  // ---- Like button detection (safe: never click if state unknown) ----
  function isLikeButton(btn) {
    if (!btn || btn.disabled) return false;
    const label = norm(btn.getAttribute("aria-label"));
    return (label === "like" || label.endsWith(": like")) && !label.includes("dislike");
  }

  function likeState(btn) {
    const cn = btn.className || "";
    const hasInactive = cn.includes("text-foreground-inactive"); // unliked
    const hasPrimary = cn.includes("text-foreground-primary");   // liked

    if (hasInactive && !hasPrimary) return "unliked";
    if (hasPrimary && !hasInactive) return "liked";
    return "unknown";
  }

  function findUnlikedLikeButtonInRow(row) {
    const buttons = Array.from(row.querySelectorAll("button[aria-label]"));
    for (const btn of buttons) {
      if (!isLikeButton(btn)) continue;

      const state = likeState(btn);
      if (state === "unliked") return btn;
      if (state === "liked") return null; // already liked
      // unknown -> ignore
    }
    return null;
  }

  // ✅ Minimal output: liked item number + break timers
  function tryLikeOneInRightPanel() {
    const right = document.getElementById(RIGHT_ID);
    if (!right) return false;

    const rows = Array.from(right.querySelectorAll('div.group[role="row"]'));
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const itemNumber = i + 1;

      if (row.dataset.autoliked === "true") continue;

      const btn = findUnlikedLikeButtonInRow(row);
      if (!btn) continue;

      row.dataset.autoliked = "true";
      btn.click();

      log(`Liked item #${itemNumber}`);
      return true;
    }
    return false;
  }

  // ---- Scheduler / iteration logic ----
  let timerId = null;
  let running = true;

  let likesThisBurst = 0;
  let likesTarget = 0;
  let inBreak = false;

  // 429 handling
  let in429Break = false;

  function schedule(ms, fn) {
    clearTimeout(timerId);
    timerId = setTimeout(fn, ms);
  }

  function startNewBurst() {
    likesThisBurst = 0;
    likesTarget = randInt(BURST_LIKES_MIN, BURST_LIKES_MAX);
    inBreak = false;
    log(`New burst: target ${likesTarget} likes`);
  }

  function takeBreak(ms, reason) {
    inBreak = true;
    log(`Break ${fmtMs(ms)}${reason ? ` (${reason})` : ""}`);
    schedule(ms, () => {
      if (!running) return;
      inBreak = false;
      startNewBurst();
      tick();
    });
  }

  function tick() {
    if (!running) return;
    if (inBreak || in429Break) return;

    if (likesThisBurst >= likesTarget) {
      takeBreak(
        randMs(BREAK_MIN_MS, BREAK_MAX_MS),
        `burst complete ${likesThisBurst}/${likesTarget}`
      );
      return;
    }

    const didLike = tryLikeOneInRightPanel();
    if (didLike) likesThisBurst += 1;

    schedule(randMs(LIKE_DELAY_MIN_MS, LIKE_DELAY_MAX_MS), tick);
  }

  // ---- 429 detection ----
  function trigger429(source) {
    if (!running) return;
    if (in429Break) return;

    in429Break = true;
    clearTimeout(timerId);

    log(`429 detected (${source}) → pause ${fmtMs(THROTTLE_BREAK_MS)} then new burst`);
    schedule(THROTTLE_BREAK_MS, () => {
      if (!running) return;
      in429Break = false;
      startNewBurst();
      tick();
    });
  }

  function consoleHas429(args) {
    try {
      const joined = args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
      return /\b429\b/.test(joined);
    } catch {
      return false;
    }
  }

  function isAutoLikeLog(args) {
    return typeof args?.[0] === "string" && args[0].startsWith(LOG_PREFIX);
  }

  // Patch console to watch for "429" (but IGNORE our own logs)
  console.log = (...args) => {
    if (!isAutoLikeLog(args) && consoleHas429(args)) trigger429("console.log");
    origConsole.log(...args);
  };
  console.warn = (...args) => {
    if (!isAutoLikeLog(args) && consoleHas429(args)) trigger429("console.warn");
    origConsole.warn(...args);
  };
  console.error = (...args) => {
    if (!isAutoLikeLog(args) && consoleHas429(args)) trigger429("console.error");
    origConsole.error(...args);
  };

  // Patch fetch to catch HTTP 429 responses
  const origFetch = window.fetch ? window.fetch.bind(window) : null;
  if (origFetch) {
    window.fetch = async (...args) => {
      const resp = await origFetch(...args);
      if (resp && resp.status === 429) trigger429("fetch");
      return resp;
    };
  }

  // Patch XHR to catch HTTP 429 responses
  const OrigXHR = window.XMLHttpRequest;
  if (OrigXHR) {
    function PatchedXHR() {
      const xhr = new OrigXHR();
      xhr.addEventListener("loadend", () => {
        try {
          if (xhr.status === 429) trigger429("xhr");
        } catch {}
      });
      return xhr;
    }
    PatchedXHR.prototype = OrigXHR.prototype;
    window.XMLHttpRequest = PatchedXHR;
  }

  // ---- Public controls ----
  window.__dedupeAutoLike__ = {
    stop() {
      running = false;
      clearTimeout(timerId);

      // restore patched globals
      console.log = origConsole.log;
      console.warn = origConsole.warn;
      console.error = origConsole.error;

      if (origFetch) window.fetch = origFetch;
      if (OrigXHR) window.XMLHttpRequest = OrigXHR;

      log("stopped");
    },
  };

  // Kick off
  startNewBurst();
  tick();
})();

(() => {
  "use strict";

  const SCAN_EVERY_MS = 600;
  const ACTION_COOLDOWN_MS = 1200;
  const AFTER_LIKE_SCROLL_MS = 1000;
  const TOGGLE_KEY = "0";

  const STATE_KEY = "__autoLike_followGate__";
  if (window[STATE_KEY]?.stop) window[STATE_KEY].stop();

  let running = true;
  let timer = null;
  let lastActionAt = 0;
  const now = () => Date.now();
  const cooledDown = () => now() - lastActionAt >= ACTION_COOLDOWN_MS;

  // === Correct scroll container (snap list) ===
  function getScrollContainer() {
    const candidates = Array.from(
      document.querySelectorAll("div.snap-y.snap-mandatory.overflow-y-auto")
    ).filter((el) => el.scrollHeight > el.clientHeight + 10);

    if (candidates.length) {
      candidates.sort((a, b) => {
        const ac = a.querySelectorAll("div[data-index]").length;
        const bc = b.querySelectorAll("div[data-index]").length;
        return bc - ac;
      });
      return candidates[0];
    }

    const all = Array.from(document.querySelectorAll("div")).filter((el) => {
      const cs = getComputedStyle(el);
      const oy = cs.overflowY;
      return (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 10;
    });
    all.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight));
    return all[0] || document.scrollingElement;
  }

  function scrollDown(trigger = "") {
    const sc = getScrollContainer();
    if (!sc) return;
    const amt = Math.floor(sc.clientHeight * 0.85);
    const before = sc.scrollTop;
    sc.scrollBy({ top: amt, left: 0, behavior: "smooth" });
    setTimeout(() => {
      const after = sc.scrollTop;
      console.log(`[scroll] ${trigger} | +${amt}px | before=${before} after=${after}`);
    }, 300);
  }

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.height > 0;
  }

  function findFollowState(root) {
    if (!root) return null;
    for (const sp of root.querySelectorAll("span")) {
      const t = (sp.textContent || "").trim();
      if (t === "Follow" || t === "Following") return t;
    }
    return null;
  }

  function findContainer(btn) {
    let cur = btn,
      fallback = btn;
    for (let i = 0; i < 10 && cur; i++) {
      cur = cur.parentElement;
      if (!cur) break;
      fallback = cur;
      const s = findFollowState(cur);
      if (s) return cur;
    }
    return fallback;
  }

  function pickNextUnliked() {
    const btns = Array.from(document.querySelectorAll('button[aria-label="Like"]'))
      .filter((b) => !b.disabled && isVisible(b))
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    return btns[0] || null;
  }

  function tick() {
    if (!running || !cooledDown()) return;

    const btn = pickNextUnliked();
    if (!btn) {
      lastActionAt = now();
      scrollDown("no-like-btn");
      return;
    }

    const container = findContainer(btn);
    const followState = findFollowState(container);

    if (followState === "Follow") {
      lastActionAt = now();
      scrollDown("not-following");
      return;
    }

    lastActionAt = now();
    btn.click();
    console.log("[like] clicked Like button");

    setTimeout(() => {
      if (running) scrollDown("after-like");
    }, AFTER_LIKE_SCROLL_MS);
  }

  function start() {
    if (timer) return;
    timer = setInterval(tick, SCAN_EVERY_MS);
    console.log("[auto-like] ON (press 0 to toggle)");
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    console.log("[auto-like] OFF (press 0 to toggle)");
  }

  function toggle() {
    running = !running;
    if (running) start();
    else stop();
  }

  // key listener for toggle
  function onKeyDown(e) {
    if (e.key === TOGGLE_KEY && !e.repeat) toggle();
  }
  window.addEventListener("keydown", onKeyDown, true);

  window[STATE_KEY] = {
    stop: () => {
      running = false;
      stop();
      window.removeEventListener("keydown", onKeyDown, true);
      delete window[STATE_KEY];
    },
    start: () => {
      running = true;
      start();
    },
    toggle,
  };

  start(); // auto-run immediately
})();

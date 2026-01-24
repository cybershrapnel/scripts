(function () {
  const ROW_SELECTOR = 'div.group[role="row"]';
  const WRAPPER_ID = '__split_wrapper__';

  // Left panel (moved rows / your “clone column”)
  const RIGHT_ID = '__dedupe_panel__';

  // Right panel (original list container lives here)
  const ORIGINAL_ID = '__original_panel__';
  const STYLE_ID = '__split_styles__';

  let lastRun = 0;
  const COOLDOWN_MS = 300;

  // ✅ how tiny to make the ORIGINAL column (right side)
  const ORIGINAL_ZOOM = 0.900; // super tiny now and on right

  // ─────────────────────────────────────────────────────────────
  // ✅ PERSISTENT "MOVED" MEMORY (3-hour window)
  // ─────────────────────────────────────────────────────────────
  const STORAGE_KEY = '__ncz_moved_authors_ts_v2__';
  const IGNORE_WINDOW_MS = 96 * 60 * 60 * 1000; // 3 hours

  function loadMovedMap() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed;
    } catch {
      return {};
    }
  }

  function saveMovedMap(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore quota / blocked storage
    }
  }

  function pruneMovedMap(map, now) {
    let changed = false;
    for (const [k, ts] of Object.entries(map)) {
      const t = Number(ts);
      if (!Number.isFinite(t) || now - t > IGNORE_WINDOW_MS) {
        delete map[k];
        changed = true;
      }
    }
    return changed;
  }

  // Load + prune on boot
  const movedMap = loadMovedMap();
  const bootNow = Date.now();
  if (pruneMovedMap(movedMap, bootNow)) saveMovedMap(movedMap);

  // 🔒 PERSISTENT STATE (within last 3 hours)
  const promotedAuthors = new Set(Object.keys(movedMap));
  // ─────────────────────────────────────────────────────────────

  // ✅ running counter for moved items
  let movedCounter = 0;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Only affects the ORIGINAL column (right). Moved rows in the left panel won't be affected. */
      #${ORIGINAL_ID} {
        transform-origin: top left;
      }
    `;
    document.head.appendChild(style);
  }

  function getAuthor(row) {
    const a = row.querySelector('a[href^="/@"]');
    return a ? a.textContent.trim() : null;
  }

  // ✅ stable key for persistence (prefer /@handle from href)
  function getAuthorKey(row) {
    const a = row.querySelector('a[href^="/@"]');
    if (!a) return null;

    const href = (a.getAttribute('href') || '').trim();
    const m = href.match(/^\/@[^/?#]+/); // "/@name"
    if (m && m[0]) return m[0].toLowerCase();

    const txt = (a.textContent || '').trim();
    return txt ? txt.toLowerCase() : null;
  }

  // Detect "already liked" using the class difference you showed:
  // unliked Like button => text-foreground-inactive
  // liked Like button   => text-foreground-primary
  function isAlreadyLiked(row) {
    const buttons = Array.from(row.querySelectorAll('button[aria-label]'));
    for (const btn of buttons) {
      const label = (btn.getAttribute('aria-label') || '').trim().toLowerCase();
      const isLike = (label === 'like' || label.endsWith(': like')) && !label.includes('dislike');
      if (!isLike) continue;

      const cn = btn.className || '';
      const hasPrimary = cn.includes('text-foreground-primary');
      const hasInactive = cn.includes('text-foreground-inactive');

      if (hasPrimary && !hasInactive) return true;
      if (hasInactive && !hasPrimary) return false;

      // Unknown state: play it safe and treat as already liked (do not move)
      return true;
    }

    // If there's no like button found, don't move it (safer)
    return true;
  }

  function setupSplit(container) {
    if (document.getElementById(WRAPPER_ID)) return;

    ensureStyles();

    const wrapper = document.createElement('div');
    wrapper.id = WRAPPER_ID;
    wrapper.style.display = 'flex';
    wrapper.style.width = '100%';
    wrapper.style.gap = '12px';

    // ✅ LEFT = moved items panel
    const left = document.createElement('div');
    left.id = RIGHT_ID;
    left.style.flex = '1 1 75%';
    left.style.minWidth = '0';
    left.style.paddingRight = '12px';
    left.style.borderRight = '1px solid rgba(0,0,0,0.15)';

    // ✅ RIGHT = original list (tiny)
    const right = document.createElement('div');
    right.id = ORIGINAL_ID;
    right.style.flex = '1 1 25%';
    right.style.minWidth = '0';

    // Make ORIGINAL column tiny WITHOUT affecting moved rows:
    // Prefer zoom (Chrome) because it shrinks layout too; fallback to transform scale.
    if ('zoom' in right.style) {
      right.style.zoom = String(ORIGINAL_ZOOM);
    } else {
      right.style.transform = `scale(${ORIGINAL_ZOOM})`;
    }

    const parent = container.parentNode;
    parent.insertBefore(wrapper, container);

    // IMPORTANT: original container goes into the RIGHT column now
    right.appendChild(container);

    // Order: moved panel LEFT, original RIGHT
    wrapper.appendChild(left);
    wrapper.appendChild(right);
  }

  function makePlaceholder(fromRow) {
    const ph = document.createElement(fromRow.tagName);
    ph.className = fromRow.className;
    ph.style.height = fromRow.getBoundingClientRect().height + 'px';
    ph.style.visibility = 'hidden';
    ph.dataset.placeholder = 'true';
    return ph;
  }

  // replace the "picture" spot with an item number badge
  function injectItemNumber(row, num) {
    if (row.querySelector('[data-ncz-index-badge="true"]')) return;

    const badge = document.createElement('span');
    badge.dataset.nczIndexBadge = 'true';
    badge.textContent = String(num);

    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.fontWeight = '700';
    badge.style.borderRadius = '9999px';
    badge.style.userSelect = 'none';
    badge.style.flex = '0 0 auto';
    badge.style.lineHeight = '1';
    badge.style.background = 'rgba(0,0,0,0.08)';
    badge.style.border = '1px solid rgba(0,0,0,0.15)';
    badge.style.padding = '0';
    badge.style.minWidth = '28px';
    badge.style.height = '28px';

    const img =
      row.querySelector('img[alt*="avatar" i]') ||
      row.querySelector('img[class*="rounded" i]') ||
      row.querySelector('img');

    if (img && img.parentElement) {
      const r = img.getBoundingClientRect();
      const size = Math.max(24, Math.round(Math.max(r.width, r.height)) || 28);
      badge.style.width = size + 'px';
      badge.style.height = size + 'px';
      img.replaceWith(badge);
      return;
    }

    const firstCell =
      row.querySelector('[role="gridcell"], [role="cell"]') ||
      row.firstElementChild ||
      row;

    badge.style.marginRight = '10px';
    firstCell.insertBefore(badge, firstCell.firstChild);
  }

  function rebuildRightPanel() {
    const leftPanel = document.getElementById(RIGHT_ID);
    if (!leftPanel) return;

    const rows = Array.from(document.querySelectorAll(ROW_SELECTOR));
    const now = Date.now();

    // prune again (in case script stays open a long time)
    const pruned = pruneMovedMap(movedMap, now);
    if (pruned) {
      // keep Set in sync
      promotedAuthors.clear();
      for (const k of Object.keys(movedMap)) promotedAuthors.add(k);
      saveMovedMap(movedMap);
    }

    let changed = false;

    rows.forEach(row => {
      if (row.dataset.placeholder === 'true') return;
      if (row.dataset.moved === 'true') return;

      // only move if NOT already liked
      if (isAlreadyLiked(row)) return;

      const authorKey = getAuthorKey(row);
      if (!authorKey) return;

      // ✅ ignore if we already moved this author within last 3 hours
      if (promotedAuthors.has(authorKey)) return;

      promotedAuthors.add(authorKey);
      movedMap[authorKey] = now;
      changed = true;

      movedCounter += 1;
      row.dataset.itemNumber = String(movedCounter);
      injectItemNumber(row, movedCounter);

      const placeholder = makePlaceholder(row);
      row.parentNode.insertBefore(placeholder, row);

      row.dataset.moved = 'true';
      // ✅ moved rows go to LEFT panel now
      leftPanel.appendChild(row);
    });

    if (changed) {
      // prune before save to keep storage tight
      pruneMovedMap(movedMap, Date.now());
      saveMovedMap(movedMap);
    }
  }

  document.addEventListener('keydown', e => {
    if (e.code !== 'KeyA') return;

    const now = Date.now();
    if (now - lastRun < COOLDOWN_MS) return;
    lastRun = now;

    const firstRow = document.querySelector(ROW_SELECTOR);
    if (!firstRow) return;

    const container = firstRow.parentElement;
    setupSplit(container);
    rebuildRightPanel();
  });
})();


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




(() => {
  "use strict";

  const EVERY_MS = 5 * 60 * 1000; // 5 minutes
  const TAG = "[AutoKeyA]";

  // If you re-paste, stop the old one first
  if (window.__ncz_autoKeyA__?.stop) {
    window.__ncz_autoKeyA__.stop();
  }

  function fireKeyA() {
    const ev = new KeyboardEvent("keydown", {
      key: "a",
      code: "KeyA",
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(ev);
    console.log(`${TAG} dispatched KeyA @ ${new Date().toLocaleTimeString()}`);
  }

  const id = setInterval(() => {
    // optional: only run when tab is visible
    if (document.visibilityState !== "visible") return;
    fireKeyA();
  }, EVERY_MS);

  window.__ncz_autoKeyA__ = {
    stop() {
      clearInterval(id);
      console.log(`${TAG} stopped`);
    },
    fireNow: fireKeyA,
  };

  console.log(`${TAG} running every ${Math.round(EVERY_MS / 60000)} minutes. stop via __ncz_autoKeyA__.stop()`);
  // If you want it to run immediately once, uncomment:
   fireKeyA();
})();








(() => {
  "use strict";

  const TAG = "[NCZ TagHop]";
  const RIGHT_ID = "__dedupe_panel__";
  const ROW_SEL = 'div.group[role="row"]';

  // how often to check if we're "out of likes"
  const CHECK_EVERY_MS = 20_000;

  // after clicking a tag button, wait a bit then trigger your A-key handler
  const PRESS_A_DELAY_MS = 1200;

  // If you re-paste, stop the old one first
  if (window.__ncz_tagHop__?.stop) window.__ncz_tagHop__.stop();

  // ---- A-key trigger ----
  function fireA() {
    // if your auto-keyA helper exists, use it
    if (window.__ncz_autoKeyA__?.fireNow) {
      window.__ncz_autoKeyA__.fireNow();
      return;
    }
    // otherwise dispatch KeyA ourselves
    const ev = new KeyboardEvent("keydown", {
      key: "a",
      code: "KeyA",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(ev);
  }

  // ---- Like detection (match your autolike logic) ----
  function isLikeButton(btn) {
    if (!btn || btn.disabled) return false;
    const label = String(btn.getAttribute("aria-label") || "").trim().toLowerCase();
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

  function rowHasUnlikedLike(row) {
    if (!row) return false;
    if (row.dataset.autoliked === "true") return false; // already attempted by your autolike runner

    const buttons = Array.from(row.querySelectorAll("button[aria-label]"));
    for (const btn of buttons) {
      if (!isLikeButton(btn)) continue;
      const state = likeState(btn);
      if (state === "unliked") return true;
      if (state === "liked") return false;
      return false; // unknown -> treat as not-likeable (safe)
    }
    return false;
  }

  function hasAnyUnlikedLikeInRightPanel() {
    const right = document.getElementById(RIGHT_ID);
    if (!right) return null; // can't tell (panel not present)
    const rows = Array.from(right.querySelectorAll(ROW_SEL));
    for (const row of rows) {
      if (rowHasUnlikedLike(row)) return true;
    }
    return false;
  }

  // ---- Find + click a random tag button bar ----
  function findTagBar() {
    // robust-ish: any horizontal scroll bar with lots of buttons
    const candidates = Array.from(document.querySelectorAll("div.overflow-x-scroll"));
    candidates.sort((a, b) => b.querySelectorAll("button").length - a.querySelectorAll("button").length);

    for (const div of candidates) {
      const btns = Array.from(div.querySelectorAll("button"));
      if (btns.length < 4) continue;

      // prefer bars whose buttons look like chips
      const chipLikeCount = btns.filter(b => (b.className || "").includes("rounded-full")).length;
      if (chipLikeCount >= 3) return div;
    }
    return null;
  }

  function clickRandomButton(div) {
    const btns = Array.from(div.querySelectorAll("button")).filter(b => {
      if (!b) return false;
      if (b.disabled) return false;
      const ariaDisabled = String(b.getAttribute("aria-disabled") || "").toLowerCase();
      if (ariaDisabled === "true") return false;

      const txt = String(b.textContent || "").trim();
      if (!txt) return false;

      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;

      return true;
    });

    if (!btns.length) return null;

    const pick = btns[Math.floor(Math.random() * btns.length)];
    try {
      pick.scrollIntoView({ block: "nearest", inline: "center" });
    } catch {}
    pick.click();
    return pick;
  }

  // ---- Main loop ----
  function tick() {
    try {
      const hasUnliked = hasAnyUnlikedLikeInRightPanel();

      // If there ARE likeable items, do nothing.
      if (hasUnliked === true) return;

      // If right panel doesn't exist yet, try firing A once to initialize.
      if (hasUnliked === null) {
        console.log(`${TAG} right panel not found → pressing A once`);
        fireA();
        return;
      }

      // No items left to like → click a random tag button, then press A again.
      const bar = findTagBar();
      if (!bar) {
        console.warn(`${TAG} couldn't find the tag button bar`);
        return;
      }

      const btn = clickRandomButton(bar);
      if (!btn) {
        console.warn(`${TAG} no enabled tag buttons found`);
        return;
      }

      const label = String(btn.textContent || "").trim();
      console.log(`${TAG} no likes left → clicked tag: "${label}"`);

      setTimeout(() => {
        console.log(`${TAG} pressing A to refresh/move rows`);
        fireA();
      }, PRESS_A_DELAY_MS);
    } catch (err) {
      console.error(`${TAG} error`, err);
    }
  }

  const id = setInterval(tick, CHECK_EVERY_MS);

  window.__ncz_tagHop__ = {
    stop() {
      clearInterval(id);
      console.log(`${TAG} stopped`);
    },
    tick,
  };

  console.log(`${TAG} running (checks every ${Math.round(CHECK_EVERY_MS / 1000)}s). Stop: __ncz_tagHop__.stop()`);
  tick(); // run once immediately
})();



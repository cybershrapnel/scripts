// ==UserScript==
// @name         Suno Chat Mirror (movable + resizable + rooms + blocklist)
// @namespace    ncz-mequavis
// @version      1.1.2
// @description  Draggable/resizable overlay that live-mirrors Suno chat with filters, room selector, and blocklist UI.
// @match        https://suno.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  if (document.getElementById("ncz-chat-mirror-host")) return;

  const LS_KEY = "ncz_chatMirror_state_v2";

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function loadState() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveState(patch) {
    const cur = loadState();
    const next = { ...cur, ...patch };
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    return next;
  }

  const norm = (s) => String(s || "").trim().toLowerCase();

  function getBlockedList(state) {
    const arr = Array.isArray(state.blocked) ? state.blocked : [];
    const seen = new Set();
    const out = [];
    for (const u of arr) {
      const k = norm(u);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(String(u).trim());
    }
    out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return out;
  }
  function setBlockedList(list) { saveState({ blocked: list }); }
  function addBlocked(user) {
    const st = loadState();
    const list = getBlockedList(st);
    const k = norm(user);
    if (!k) return;
    if (list.some((u) => norm(u) === k)) return;
    list.push(String(user).trim());
    list.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    setBlockedList(list);
  }
  function removeBlocked(user) {
    const st = loadState();
    const list = getBlockedList(st);
    const k = norm(user);
    setBlockedList(list.filter((u) => norm(u) !== k));
  }

  function isVisible(el) {
    if (!el) return false;
    const r = el.getClientRects();
    if (!r || r.length === 0) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    if (Number(cs.opacity) === 0) return false;
    return true;
  }

  function scoreList(el) {
    if (!el) return 0;
    const reply = el.querySelectorAll('button[aria-label^="Reply to"]').length;
    const handles = el.querySelectorAll('a[href^="/@"]').length;
    const groups = el.querySelectorAll("div.group").length;
    const kids = el.children ? el.children.length : 0;
    return reply * 10 + handles * 4 + groups * 2 + kids;
  }

  function findMessagesList() {
    const input = document.querySelector("input.live-radio-chat-input");
    const scopes = [];

    if (input) {
      let p = input.parentElement;
      for (let i = 0; i < 10 && p; i++) {
        scopes.push(p);
        p = p.parentElement;
      }
    }
    scopes.push(document);

    const selector =
      [
        "div.overflow-y-auto",
        "div[class*='overflow-y-auto']",
        "div[style*='overflow-y']",
        "div[style*='scrollbar-width']",
        "div[style*='scrollbar-color']",
      ].join(",");

    let best = null;
    let bestScore = 0;

    for (const scope of scopes) {
      const candidates = Array.from(scope.querySelectorAll(selector));
      for (const el of candidates) {
        const hasChatMarkers =
          el.querySelector('button[aria-label^="Reply to"]') ||
          el.querySelector('a[href^="/@"]') ||
          el.querySelector("span.font-medium");
        if (!hasChatMarkers) continue;
        if (!isVisible(el)) continue;

        const s = scoreList(el);
        if (s > bestScore) {
          best = el;
          bestScore = s;
        }
      }
      if (best) return best;
    }

    const all = Array.from(document.querySelectorAll(selector)).filter(isVisible);
    for (const el of all) {
      const hasChatMarkers =
        el.querySelector('button[aria-label^="Reply to"]') ||
        el.querySelector('a[href^="/@"]') ||
        el.querySelector("span.font-medium");
      if (!hasChatMarkers) continue;

      const s = scoreList(el);
      if (s > bestScore) {
        best = el;
        bestScore = s;
      }
    }

    return best;
  }

  function extractUsername(msgEl) {
    if (!msgEl) return "";
    const a = msgEl.querySelector('a[href^="/@"]');
    if (a?.textContent) return a.textContent.trim();
    const s = msgEl.querySelector("span.font-medium");
    if (s?.textContent) return s.textContent.trim();
    return "";
  }

  // ✅ FIXED: no invalid CSS selector for "text-white/60"
  function extractContent(msgEl, username) {
    if (!msgEl) return "";

    const bw = msgEl.querySelector("span.break-words");
    if (bw?.textContent) return bw.textContent.trim();

    // Find exact class token "text-white/60" safely
    let t = null;
    for (const span of msgEl.querySelectorAll("span")) {
      if (span.classList && span.classList.contains("text-white/60")) {
        t = span;
        break;
      }
    }
    if (t?.textContent) return t.textContent.replace(/\s+/g, " ").trim();

    // Fallback: any span that looks like the content (Tailwind "text-white/xx") but not the username
    for (const span of msgEl.querySelectorAll("span")) {
      const cls = typeof span.className === "string" ? span.className : "";
      if (cls.includes("text-white/") && !cls.includes("font-medium")) {
        const txt = (span.textContent || "").replace(/\s+/g, " ").trim();
        if (txt) return txt;
      }
    }

    const full = (msgEl.innerText || msgEl.textContent || "").replace(/\u200B/g, "").trim();
    if (username && full.toLowerCase().startsWith(username.toLowerCase())) {
      return full.slice(username.length).trimStart();
    }
    return full;
  }

  function getMessageNodesFromList(listEl) {
    if (!listEl) return [];

    const btns = Array.from(listEl.querySelectorAll('button[aria-label^="Reply to"]'));
    if (btns.length) {
      const seen = new WeakSet();
      const out = [];
      for (const b of btns) {
        const item =
          b.closest("div.group.relative") ||
          b.closest("div.group") ||
          b.closest("div[class*='group']") ||
          b.parentElement;
        if (item && !seen.has(item)) {
          seen.add(item);
          out.push(item);
        }
      }
      if (out.length >= 3) return out;
    }

    const kids = Array.from(listEl.children || []);
    if (kids.length) return kids;

    return Array.from(listEl.querySelectorAll("div.group")).slice(0, 200);
  }

  const style = document.createElement("style");
  style.textContent = `
    #ncz-chat-mirror-host * { box-sizing: border-box; }
    #ncz-chat-mirror-host select,
    #ncz-chat-mirror-host input[type="checkbox"]{ accent-color: rgba(255,255,255,0.85); }
    #ncz-chat-mirror-host .ncz-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    #ncz-chat-mirror-host .ncz-ctrl {
      display:flex; align-items:center; gap:6px;
      padding:2px 6px; border-radius:999px;
      border:1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.20);
      font-size:12px; line-height:16px; white-space:nowrap;
    }
    #ncz-chat-mirror-host .ncz-ctrl label { cursor:pointer; user-select:none; opacity:.95; }
    #ncz-chat-mirror-host .ncz-ctrl input { cursor:pointer; }
    #ncz-chat-mirror-host .ncz-select {
      padding:4px 8px; border-radius:999px;
      border:1px solid rgba(255,255,255,0.14);
      background: rgba(0,0,0,0.20);
      color:#fff; font-size:12px;
      outline:none;
    }
    #ncz-chat-mirror-host .ncz-miniBtn {
      appearance:none;
      border:1px solid rgba(255,255,255,0.16);
      background:rgba(0,0,0,0.25);
      color:#fff;
      padding:4px 8px;
      border-radius:999px;
      font-size:12px;
      cursor:pointer;
      line-height:16px;
    }
    #ncz-chat-mirror-host .ncz-miniBtn:hover { background:rgba(255,255,255,0.10); }
    #ncz-chat-mirror-host .ncz-blockBtn {
      appearance:none;
      border:1px solid rgba(255,255,255,0.16);
      background: rgba(255, 0, 0, 0.12);
      color:#fff;
      width:18px; height:18px;
      border-radius:999px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      margin-right:6px;
      cursor:pointer;
      font-size:12px;
      line-height:12px;
      vertical-align:middle;
      opacity: .9;
    }
    #ncz-chat-mirror-host .ncz-blockBtn:hover { opacity: 1; background: rgba(255, 0, 0, 0.18); }
    #ncz-chat-mirror-host .ncz-hint { opacity:.72; font-size:12px; padding:6px 2px; }
  `;
  document.documentElement.appendChild(style);

  const st0 = loadState();

  let paused = !!st0.paused;
  let autoscroll = st0.autoscroll !== false;
  let hideVotes = !!st0.hideVotes;
  let room = Number.isFinite(st0.room) ? st0.room : 0;
  let hidden = false;

  const host = document.createElement("div");
  host.id = "ncz-chat-mirror-host";
  host.style.cssText = [
    "position:fixed",
    `left:${Number.isFinite(st0.left) ? st0.left : 20}px`,
    `top:${Number.isFinite(st0.top) ? st0.top : 120}px`,
    `width:${Number.isFinite(st0.width) ? st0.width : 520}px`,
    `height:${Number.isFinite(st0.height) ? st0.height : 360}px`,
    "z-index:2147483647",
    "background:rgba(0,0,0,0.72)",
    "border:1px solid rgba(255,255,255,0.18)",
    "border-radius:14px",
    "box-shadow:0 10px 30px rgba(0,0,0,0.45)",
    "backdrop-filter:blur(10px)",
    "-webkit-backdrop-filter:blur(10px)",
    "color:#fff",
    "font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial",
    "display:flex",
    "flex-direction:column",
    "overflow:hidden",
    "resize:both",
    "min-width:320px",
    "min-height:220px",
  ].join(";");

  const header = document.createElement("div");
  header.style.cssText = [
    "padding:10px 10px 8px 12px",
    "user-select:none",
    "border-bottom:1px solid rgba(255,255,255,0.10)",
    "background:rgba(255,255,255,0.06)",
  ].join(";");

  const topRow = document.createElement("div");
  topRow.className = "ncz-row";
  topRow.style.cssText = "justify-content:space-between; gap:10px;";

  const title = document.createElement("div");
  title.style.cssText = "font-weight:800;font-size:13px;letter-spacing:.2px;opacity:.95;";

  function roomLabel() {
    return room === 0 ? "Base chat" : `Chat ${room} (ROOM${room}:)`;
  }
  title.textContent = `Chat Mirror — ${roomLabel()}`;

  const rightBtns = document.createElement("div");
  rightBtns.className = "ncz-row";
  rightBtns.style.cssText = "gap:8px;";

  const btnRescan = document.createElement("button");
  btnRescan.className = "ncz-miniBtn";
  btnRescan.textContent = "Rescan";
  btnRescan.title = "Force re-detect chat container";

  const btnClose = document.createElement("button");
  btnClose.className = "ncz-miniBtn";
  btnClose.textContent = "✕";
  btnClose.setAttribute("aria-label", "Close mirror");

  rightBtns.append(btnRescan, btnClose);
  topRow.append(title, rightBtns);

  const ctrlRow = document.createElement("div");
  ctrlRow.className = "ncz-row";
  ctrlRow.style.cssText = "margin-top:8px;";

  const ctrlPause = document.createElement("div");
  ctrlPause.className = "ncz-ctrl";
  const cbPause = document.createElement("input");
  cbPause.type = "checkbox";
  cbPause.checked = paused;
  const lbPause = document.createElement("label");
  lbPause.textContent = "Pause";
  lbPause.addEventListener("click", () => cbPause.click());
  ctrlPause.append(cbPause, lbPause);

  const ctrlAuto = document.createElement("div");
  ctrlAuto.className = "ncz-ctrl";
  const cbAuto = document.createElement("input");
  cbAuto.type = "checkbox";
  cbAuto.checked = autoscroll;
  const lbAuto = document.createElement("label");
  lbAuto.textContent = "Auto-scroll";
  lbAuto.addEventListener("click", () => cbAuto.click());
  ctrlAuto.append(cbAuto, lbAuto);

  const ctrlVotes = document.createElement("div");
  ctrlVotes.className = "ncz-ctrl";
  const cbVotes = document.createElement("input");
  cbVotes.type = "checkbox";
  cbVotes.checked = hideVotes;
  const lbVotes = document.createElement("label");
  lbVotes.textContent = 'Hide "voted for"';
  lbVotes.addEventListener("click", () => cbVotes.click());
  ctrlVotes.append(cbVotes, lbVotes);

  const roomSelect = document.createElement("select");
  roomSelect.className = "ncz-select";
  {
    const optBase = document.createElement("option");
    optBase.value = "0";
    optBase.textContent = "Base chat";
    roomSelect.appendChild(optBase);
    for (let i = 1; i <= 99; i++) {
      const o = document.createElement("option");
      o.value = String(i);
      o.textContent = `Chat ${i}`;
      roomSelect.appendChild(o);
    }
    roomSelect.value = String(room);
  }

  const unblockSelect = document.createElement("select");
  unblockSelect.className = "ncz-select";
  function rebuildUnblockSelect() {
    const st = loadState();
    const list = getBlockedList(st);

    unblockSelect.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = list.length ? `Blocked: ${list.length} (pick to unblock)` : "Blocked: (none)";
    unblockSelect.appendChild(ph);

    for (const u of list) {
      const o = document.createElement("option");
      o.value = u;
      o.textContent = u;
      unblockSelect.appendChild(o);
    }
    unblockSelect.value = "";
  }
  rebuildUnblockSelect();

  ctrlRow.append(ctrlPause, ctrlAuto, ctrlVotes, roomSelect, unblockSelect);
  header.append(topRow, ctrlRow);
  host.appendChild(header);

  const body = document.createElement("div");
  body.style.cssText = "flex:1;overflow:auto;padding:10px;font-size:12px;";
  const hint = document.createElement("div");
  hint.className = "ncz-hint";
  hint.textContent = "Waiting for chat container…";
  body.appendChild(hint);
  host.appendChild(body);
  document.documentElement.appendChild(host);

  // drag (never stuck)
  let dragging = false;
  let dragStartX = 0, dragStartY = 0;
  let startLeft = 0, startTop = 0;

  function isControlTarget(t) {
    if (!t) return false;
    return !!(t.closest("button") || t.closest("select") || t.closest("input") || t.closest("label"));
  }

  function onDragMove(e) {
    if (!dragging) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = host.getBoundingClientRect();
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    const left = clamp(startLeft + dx, 0, vw - rect.width);
    const top = clamp(startTop + dy, 0, vh - rect.height);
    host.style.left = `${left}px`;
    host.style.top = `${top}px`;
    saveState({ left, top });
  }

  function endDrag() {
    dragging = false;
    window.removeEventListener("pointermove", onDragMove, true);
    window.removeEventListener("pointerup", endDrag, true);
    window.removeEventListener("pointercancel", endDrag, true);
    window.removeEventListener("blur", endDrag, true);
  }

  header.addEventListener("pointerdown", (e) => {
    if (isControlTarget(e.target)) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = host.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    window.addEventListener("pointermove", onDragMove, true);
    window.addEventListener("pointerup", endDrag, true);
    window.addEventListener("pointercancel", endDrag, true);
    window.addEventListener("blur", endDrag, true);

    e.preventDefault();
    e.stopPropagation();
  }, true);

  const resizeObserver = new ResizeObserver(() => {
    const rect = host.getBoundingClientRect();
    saveState({ width: Math.round(rect.width), height: Math.round(rect.height) });
  });
  resizeObserver.observe(host);

  // controls
  cbPause.addEventListener("change", () => {
    paused = cbPause.checked;
    saveState({ paused });
    if (!paused) renderNow();
  });

  cbAuto.addEventListener("change", () => {
    autoscroll = cbAuto.checked;
    saveState({ autoscroll });
  });

  cbVotes.addEventListener("change", () => {
    hideVotes = cbVotes.checked;
    saveState({ hideVotes });
    renderNow();
  });

  roomSelect.addEventListener("change", () => {
    room = parseInt(roomSelect.value, 10) || 0;
    saveState({ room });
    title.textContent = `Chat Mirror — ${roomLabel()}`;
    renderNow();
  });

  unblockSelect.addEventListener("change", () => {
    const val = unblockSelect.value;
    if (!val) return;
    removeBlocked(val);
    rebuildUnblockSelect();
    renderNow();
  });

  btnClose.addEventListener("click", () => {
    hidden = true;
    host.style.display = "none";
  });

  btnRescan.addEventListener("click", () => {
    sourceEl = null;
    attachToSource(findMessagesList());
  });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "M" || e.key === "m")) {
      hidden = !hidden;
      host.style.display = hidden ? "none" : "flex";
      if (!hidden && !paused) renderNow();
    }
  });

  // mirroring
  let sourceEl = null;
  let sourceObserver = null;
  let rafPending = false;

  function scheduleRender() {
    if (paused || hidden) return;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      renderNow();
    });
  }

  function cleanupSourceObserver() {
    if (sourceObserver) {
      try { sourceObserver.disconnect(); } catch {}
      sourceObserver = null;
    }
  }

  function attachToSource(el) {
    if (!el) {
      cleanupSourceObserver();
      sourceEl = null;
      body.replaceChildren(hint);
      hint.textContent = "Waiting for chat container…";
      return;
    }
    if (sourceEl === el && sourceObserver) return;

    sourceEl = el;
    cleanupSourceObserver();

    sourceObserver = new MutationObserver(scheduleRender);
    sourceObserver.observe(sourceEl, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });

    renderNow();
  }

  function renderNow() {
    const el = sourceEl || findMessagesList();
    if (!el) {
      body.replaceChildren(hint);
      hint.textContent = "Waiting for chat container…";
      return;
    }
    if (el !== sourceEl) attachToSource(el);

    const st = loadState();
    const blocked = getBlockedList(st);
    const blockedSet = new Set(blocked.map(norm));
    const activeRoom = Number.isFinite(st.room) ? st.room : room;
    const prefix = activeRoom > 0 ? `ROOM${activeRoom}:` : "";

    const nearBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 12;

    const mirrorWrap = document.createElement("div");
    mirrorWrap.style.cssText = "display:flex;flex-direction:column;gap:8px;";

    const msgNodes = getMessageNodesFromList(el);

    let kept = 0;
    for (const msg of msgNodes) {
      const username = extractUsername(msg);
      const uKey = norm(username);

      if (uKey && blockedSet.has(uKey)) continue;

      const fullText = (msg.innerText || msg.textContent || "").replace(/\u200B/g, "").trim();
      const content = extractContent(msg, username);

      if (hideVotes) {
  const ft = fullText.toLowerCase();
  if (ft.includes("voted for") || ft.includes("switched from")) continue;
}


      if (activeRoom > 0) {
        const c = String(content || "").trimStart();
        if (!c.startsWith(prefix)) continue;
      }

      const c = msg.cloneNode(true);

      c.querySelectorAll('button[aria-label^="Reply"], button[aria-label*="Reply"]').forEach((b) => b.remove());

      const nameEl =
        c.querySelector('a[href^="/@"]') ||
        c.querySelector("span.font-medium");

      if (nameEl && username) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ncz-blockBtn";
        btn.textContent = "⛔";
        btn.title = `Block ${username}`;
        btn.setAttribute("aria-label", `Block ${username}`);
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          addBlocked(username);
          rebuildUnblockSelect();
          renderNow();
        });

        nameEl.parentNode.insertBefore(btn, nameEl);
      }

      mirrorWrap.appendChild(c);
      kept++;
    }

    if (!kept) {
      const none = document.createElement("div");
      none.className = "ncz-hint";
      none.textContent =
        activeRoom > 0
          ? `No messages matched ${prefix} (or they're blocked).`
          : "No messages (or they're blocked).";
      mirrorWrap.appendChild(none);
    }

    body.replaceChildren(mirrorWrap);

    if (autoscroll && nearBottom) {
      requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
    }
  }

  const globalObserver = new MutationObserver(() => {
    const el = findMessagesList();
    if (el && el !== sourceEl) attachToSource(el);
  });
  globalObserver.observe(document.documentElement, { subtree: true, childList: true });

  (function bootTry() {
    const el = findMessagesList();
    if (el) attachToSource(el);
    else setTimeout(bootTry, 700);
  })();
})();

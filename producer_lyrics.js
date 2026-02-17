(async () => {
  const CFG = {
    TEST_LIMIT: Infinity,          // set to 5 to test
    START_AT_INDEX: 0,             // resume by index if needed

    CLICK_DELAY_MS: 80,
    PANEL_TIMEOUT_MS: 20000,
    BETWEEN_SONGS_MS: 120,

    AUTO_SCROLL: true,
    AUTO_SCROLL_EVERY: 25,
    SCROLL_WAIT_MS: 1200,

    DOWNLOAD_TEXT_EACH: true,      // per-song .txt
    DOWNLOAD_IMAGE_EACH: true,     // per-song image (slow). Set false if needed.
    KEEP_ORIGINAL_IMAGE_EXT: false,

    REQUIRE_LYRICS: false,         // true = only export when lyrics exist
    RETRY_ON_TIMEOUT: 2            // re-click a couple times before skipping
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const sanitizeFileName = (s) => {
    const clean = (s || "untitled")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ")
      .trim();
    return clean.length ? clean.slice(0, 140) : "untitled";
  };

  const downloadBlob = (blob, filename) => {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const downloadText = (text, filename) => {
    downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
  };

  const extFromUrl = (url) => {
    try {
      const p = new URL(url, location.origin).pathname.toLowerCase();
      const m = p.match(/\.(jpg|jpeg|png|webp|gif)(?:$|\?)/);
      return m ? (m[1] === "jpeg" ? "jpg" : m[1]) : "jpg";
    } catch { return "jpg"; }
  };

  const downloadImage = async (imgUrl, filenameBase) => {
    if (!imgUrl) return { ok: false, reason: "no image url" };
    const ext = CFG.KEEP_ORIGINAL_IMAGE_EXT ? extFromUrl(imgUrl) : "jpg";
    const filename = `${filenameBase}.${ext}`;

    try {
      const res = await fetch(imgUrl, { credentials: "omit", cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      downloadBlob(blob, filename);
      return { ok: true };
    } catch (e) {
      // fallback: direct link
      try {
        const a = document.createElement("a");
        a.href = imgUrl;
        a.download = filename;
        a.rel = "noopener";
        a.target = "_blank";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
        return { ok: true, fallback: true, error: String(e) };
      } catch (e2) {
        return { ok: false, reason: `${e} | ${e2}` };
      }
    }
  };

  // ---------- list discovery ----------
  const getCardEls = () =>
    [...document.querySelectorAll('div[aria-label^="Open details for"]')]
      .filter(el => el instanceof HTMLElement);

  const parseCard = (cardEl) => {
    const a = cardEl.querySelector('a[href^="/song/"]');
    const href = a?.getAttribute("href") || "";
    const list_uuid = (href.match(/\/song\/([0-9a-fA-F-]{20,})/) || [])[1] || "";
    const list_title =
      a?.querySelector("h4")?.textContent?.trim() ||
      cardEl.getAttribute("aria-label")?.replace(/^Open details for\s*/i, "").trim() ||
      "untitled";
    const list_prompt =
      cardEl.querySelector('button.group\\/prompt span.text-fg-2')?.textContent?.trim() ||
      cardEl.querySelector('button[class*="prompt"] span[class*="text-fg-2"]')?.textContent?.trim() ||
      "";
    const list_img = cardEl.querySelector("img[src]")?.src || "";
    return { cardEl, href, list_uuid, list_title, list_prompt, list_img };
  };

  const findScrollableAncestor = (el) => {
    let cur = el;
    while (cur && cur !== document.body) {
      const st = getComputedStyle(cur);
      if ((st.overflowY === "auto" || st.overflowY === "scroll") &&
          cur.scrollHeight > cur.clientHeight + 20) return cur;
      cur = cur.parentElement;
    }
    return document.querySelector("div.h-full.flex-1.overflow-y-auto") ||
           document.scrollingElement ||
           document.documentElement;
  };

  // ---------- panel discovery (works even when panel isn't open yet) ----------
  const getPanelRoot = () => {
    const detailsSpan = [...document.querySelectorAll("span")]
      .find(s => (s.textContent || "").trim() === "Details");
    if (!detailsSpan) return null;
    return detailsSpan.closest('div.flex.h-full.w-full.min-w-0.flex-col.overflow-hidden')
      || detailsSpan.closest("div");
  };

  const panelSongHref = (panelRoot) => panelRoot?.querySelector('a[href^="/song/"]')?.getAttribute("href") || "";
  const panelUuid = (panelRoot) => (panelSongHref(panelRoot).match(/\/song\/([0-9a-fA-F-]{20,})/) || [])[1] || "";
  const panelTitle = (panelRoot) =>
    panelRoot?.querySelector('a[href^="/song/"] h4')?.textContent?.trim() ||
    panelRoot?.querySelector("h4")?.textContent?.trim() ||
    "";

  const panelImageUrl = (panelRoot) =>
    panelRoot?.querySelector('button.group\\/image img[src]')?.src ||
    panelRoot?.querySelector('img[src*="/image/"]')?.src ||
    panelRoot?.querySelector("img[src]")?.src ||
    "";

  const sectionValue = (panelRoot, sectionName) => {
    if (!panelRoot) return "";
    const groups = [...panelRoot.querySelectorAll(".group")];
    for (const g of groups) {
      const header = g.querySelector("div.font-semibold");
      if (!header) continue;
      const label = (header.textContent || "").trim();
      if (label !== sectionName) continue;

      if (sectionName === "Lyrics") {
        return g.querySelector(".whitespace-pre-wrap")?.textContent?.trim() || "";
      }
      const candidates = [...g.querySelectorAll(".text-fg-1")]
        .filter(el => !header.contains(el))
        .map(el => (el.textContent || "").trim())
        .filter(Boolean)
        .sort((a,b) => b.length - a.length);
      return candidates[0] || "";
    }
    return "";
  };

  const extractPanel = (panelRoot) => {
    const href = panelSongHref(panelRoot);
    const uuid = panelUuid(panelRoot);
    const title = panelTitle(panelRoot);
    const url = href ? new URL(href, location.origin).href : "";

    const sound = sectionValue(panelRoot, "Sound");   // style prompt
    const model = sectionValue(panelRoot, "Model");
    const lyrics = sectionValue(panelRoot, "Lyrics");
    const imageUrl = panelImageUrl(panelRoot);

    return { url, title, uuid, sound, model, lyrics, imageUrl };
  };

  const panelKey = (p) => [
    p.url || "",
    p.uuid || "",
    (p.title || "").trim(),
    String((p.sound || "").trim().length),
    String((p.lyrics || "").trim().length)
  ].join("|");

  // Wait for panel to exist (first click) + content to change/stabilize
  const waitForPanelReady = async (prevKey, timeoutMs) => {
    const t0 = Date.now();
    let panelRoot = null;

    // 1) Wait for the panel DOM to appear
    while (Date.now() - t0 < timeoutMs) {
      panelRoot = getPanelRoot();
      if (panelRoot) break;
      await sleep(100);
    }
    if (!panelRoot) return { ok: false, reason: "panel never appeared" };

    // 2) Observe changes inside it
    let resolved = false;
    let obs;
    const done = (ok, reason) => {
      if (resolved) return;
      resolved = true;
      try { obs?.disconnect?.(); } catch {}
      return { ok, reason, panelRoot };
    };

    const isGood = (p) => {
      const hasCore = !!(p.url && p.uuid && p.title);
      const hasLyrics = !!(p.lyrics && p.lyrics.trim().length);
      const hasSound = !!(p.sound && p.sound.trim().length);
      const contentOk = CFG.REQUIRE_LYRICS ? hasLyrics : (hasLyrics || hasSound);
      return hasCore && contentOk;
    };

    return await new Promise((resolve) => {
      const check = () => {
        const p = extractPanel(panelRoot);
        const k = panelKey(p);
        if (isGood(p) && (!prevKey || k !== prevKey)) {
          resolve(done(true, "changed"));
        }
      };

      obs = new MutationObserver(check);
      obs.observe(panelRoot, { subtree: true, childList: true, characterData: true, attributes: true });

      const poll = setInterval(check, 150);

      setTimeout(() => {
        clearInterval(poll);
        const p = extractPanel(panelRoot);
        const k = panelKey(p);
        if (isGood(p) && (!prevKey || k !== prevKey)) resolve(done(true, "timeout-but-good"));
        else resolve(done(false, "timeout-no-change-or-bad"));
      }, timeoutMs);

      // initial check
      check();
    });
  };

  // Clicking can be finicky: click the item, and also try its nearest role=button parent
  const clickSmart = (el) => {
    const parentButton = el.closest('div[role="button"]') || el.parentElement?.closest('div[role="button"]');
    try { el.scrollIntoView({ block: "center" }); } catch {}
    try { el.focus?.(); } catch {}

    // preferred: native click (works best on React handlers)
    try { el.click(); return; } catch {}

    // fallback: parent role button click
    try { parentButton?.click?.(); return; } catch {}

    // last resort: dispatch
    try {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    } catch {}
  };

  // ---------- state + controls ----------
  const STATE = {
    running: true,
    stop: false,
    processedListUuids: new Set(),
    processedPanelUuids: new Set(),
    lastPanelKey: null,
    scroller: null
  };

  window.NCZ_BACKUP = {
    pause: () => (STATE.running = false, console.log("NCZ_BACKUP paused")),
    resume: () => (STATE.running = true, console.log("NCZ_BACKUP resumed")),
    stop: () => (STATE.running = false, STATE.stop = true, console.log("NCZ_BACKUP stopped")),
    status: () => ({
      running: STATE.running,
      processedList: STATE.processedListUuids.size,
      processedPanel: STATE.processedPanelUuids.size
    })
  };

  // ---------- run ----------
  let cards = getCardEls().map(parseCard);
  if (!cards.length) {
    console.error('No cards found. Expected: div[aria-label^="Open details for"]');
    return;
  }

  STATE.scroller = findScrollableAncestor(cards[0].cardEl);
  console.log("NCZ_BACKUP v3 ready.", { foundCardsNow: cards.length, scroller: STATE.scroller });

  let cursor = CFG.START_AT_INDEX;
  let processedThisRun = 0;

  while (!STATE.stop && processedThisRun < CFG.TEST_LIMIT) {
    if (!STATE.running) { await sleep(250); continue; }

    cards = getCardEls().map(parseCard);

    let next = null;
    for (let i = cursor; i < cards.length; i++) {
      const c = cards[i];
      // list_uuid can be missing on some rows; still process by title+href fallback
      const id = c.list_uuid || `${c.list_title}|${c.href}`;
      if (STATE.processedListUuids.has(id)) continue;
      next = { i, c, id };
      break;
    }

    if (!next) {
      if (!CFG.AUTO_SCROLL) break;
      const before = cards.length;
      STATE.scroller.scrollTop = STATE.scroller.scrollHeight;
      await sleep(CFG.SCROLL_WAIT_MS);
      cards = getCardEls().map(parseCard);
      const after = cards.length;
      if (after <= before) break;
      continue;
    }

    cursor = next.i;
    const { c, id } = next;

    // baseline key: if panel exists, use it; else null (panel not open yet)
    const existingPanel = getPanelRoot();
    const prevKey = existingPanel ? panelKey(extractPanel(existingPanel)) : null;

    // click + wait (retry a couple times if needed)
    let ok = false;
    let panelRoot = null;
    let reason = "";

    for (let attempt = 0; attempt <= CFG.RETRY_ON_TIMEOUT; attempt++) {
      clickSmart(c.cardEl);
      await sleep(CFG.CLICK_DELAY_MS);

      const res = await waitForPanelReady(prevKey, CFG.PANEL_TIMEOUT_MS);
      ok = res.ok;
      panelRoot = res.panelRoot || getPanelRoot();
      reason = res.reason || "";
      if (ok) break;

      // tiny backoff + try again
      await sleep(250 + attempt * 200);
    }

    if (!ok || !panelRoot) {
      console.warn("Panel failed for LIST", c.list_uuid, c.list_title, "-", reason, "— skipping this list row");
      STATE.processedListUuids.add(id);
      cursor = next.i + 1;
      continue;
    }

    const p = extractPanel(panelRoot);

    // Use what the panel actually loaded
    const title = p.title || c.list_title || "untitled";
    const uuid = p.uuid || c.list_uuid || "";
    const url = p.url || (c.href ? new URL(c.href, location.origin).href : "");
    const sound = p.sound || c.list_prompt || "";
    const imageUrl = p.imageUrl || c.list_img || "";
    const lyrics = p.lyrics || "";

    // Dedup by panel uuid (prevents overwriting same uuid)
    const dupe = uuid && STATE.processedPanelUuids.has(uuid);

    // mark processed (list row always)
    STATE.processedListUuids.add(id);
    if (uuid) STATE.processedPanelUuids.add(uuid);

    // downloads only if not duplicate panel uuid
    if (!dupe) {
      const safeTitle = sanitizeFileName(title);
      const baseName = `${safeTitle} ${uuid || "NO_UUID"}`.trim();

      if (CFG.DOWNLOAD_TEXT_EACH) {
        const txt =
`TITLE: ${title}
UUID: ${uuid}
URL: ${url}

LIST_TITLE: ${c.list_title}
LIST_UUID: ${c.list_uuid}
LIST_URL: ${c.href ? new URL(c.href, location.origin).href : ""}

SOUND_PROMPT:
${sound}

MODEL:
${p.model || ""}

LYRICS:
${lyrics}

IMAGE_URL:
${imageUrl}
`;
        downloadText(txt, `${baseName}.txt`);
      }

      if (CFG.DOWNLOAD_IMAGE_EACH) {
        const imgRes = await downloadImage(imageUrl, baseName);
        if (!imgRes.ok) console.warn("Image download failed:", uuid, imgRes.reason);
      }
    }

    processedThisRun++;
    console.log(`✅ ${processedThisRun}/${CFG.TEST_LIMIT === Infinity ? "∞" : CFG.TEST_LIMIT} - ${title} ${uuid}${dupe ? " (dupe uuid; skipped downloads)" : ""}`);

    // scroll to load more cards
    if (CFG.AUTO_SCROLL && (processedThisRun % CFG.AUTO_SCROLL_EVERY === 0)) {
      STATE.scroller.scrollTop = STATE.scroller.scrollHeight;
      await sleep(CFG.SCROLL_WAIT_MS);
    }

    cursor = next.i + 1;
    await sleep(CFG.BETWEEN_SONGS_MS);
  }

  console.log("DONE. NCZ_BACKUP.status():", window.NCZ_BACKUP.status());
})();

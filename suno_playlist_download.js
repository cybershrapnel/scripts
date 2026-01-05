// SUNO PLAYLIST → SCRAPE URLs → DOWNLOAD TSV (records) → BLOB DOWNLOAD MP3/MP4
// + RESUME AFTER RELOAD + NAV LOG + SCROLL-CONTAINER AWARE CLICKING

(async () => {
  // -----------------------------------------------------------------
  // SETTINGS
  // -----------------------------------------------------------------
  const BEFORE_CLICK_DELAY = 800;
  const AFTER_SONG_LOAD_DELAY = 1800;
  const BEFORE_BACK_DELAY = 1200;
  const AFTER_LIST_LOAD_DELAY = 1500;
  const POLL_INTERVAL = 250;
  const PAGE_TIMEOUT = 990000;

  // Download behavior
  const DOWNLOAD_TSV_RECORD = true; // downloads suno_songs.txt for your records
  const DOWNLOAD_NAV_LOG = true;    // downloads suno_nav_log.tsv
  const DOWNLOAD_MP3 = true;
  const DOWNLOAD_MP4 = true;

  // Blob-download pacing / filenames
  const DELAY_MS = 900;
  const MAX_NAME_LEN = 90;
  const PREFIX_INDEX = false;

  // IMPORTANT: collect ALL items (handles virtualized/infinite playlists)
  const COLLECT_ALL_ITEMS_BY_SCROLLING = true;
  const COLLECT_SCROLL_PAUSE_MS = 650;
  const COLLECT_MAX_PASSES = 80;
  const COLLECT_STABLE_PASSES_TO_STOP = 4;

  // When a link isn't found (virtualization), scroll-find it
  const FIND_SCROLL_STEP_RATIO = 0.85; // % of container height each step
  const FIND_SCROLL_PAUSE_MS = 500;

  // -----------------------------------------------------------------
  // PERSISTENCE
  // -----------------------------------------------------------------
  const STATE_KEY = "MEQ_SUNO_SCRAPE_STATE_V2";
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const nowIso = () => new Date().toISOString();

  function saveState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save state:", e);
    }
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  function clearState() {
    try { localStorage.removeItem(STATE_KEY); } catch (_) {}
  }

  // -----------------------------------------------------------------
  // DOM / UI HELPERS
  // -----------------------------------------------------------------
  function isScrollable(el) {
    if (!el) return false;
    const st = getComputedStyle(el);
    const oy = st.overflowY;
    return (oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 20;
  }

  function getPlaylistScroller() {
    // Prefer a scrollable ancestor of a song-row if present
    const row = document.querySelector('[data-testid="song-row"]');
    if (row) {
      let p = row.parentElement;
      while (p) {
        if (isScrollable(p)) return p;
        p = p.parentElement;
      }
    }
    // fallback to main/document scroller
    return document.scrollingElement || document.documentElement;
  }

  function getScrollTop(scroller) {
    return scroller === document.scrollingElement || scroller === document.documentElement
      ? window.scrollY
      : scroller.scrollTop;
  }

  function setScrollTop(scroller, top) {
    if (scroller === document.scrollingElement || scroller === document.documentElement) {
      window.scrollTo(0, top);
    } else {
      scroller.scrollTop = top;
    }
  }

  function findLinksInDom() {
    // Be a bit more forgiving than the original selector:
    // - still prefers the title link
    // - but will accept any /song/ anchor inside a song-row
    const anchors = Array.from(document.querySelectorAll('[data-testid="song-row"] a[href^="/song/"]'));
    return anchors;
  }

  function collectSongPathsFromDom() {
    const anchors = findLinksInDom();
    return Array.from(new Set(anchors.map((a) => a.getAttribute("href")).filter(Boolean)));
  }

  async function collectAllSongPathsByScrolling(scroller) {
    const seen = new Set();
    let stable = 0;
    let lastCount = 0;

    // Start from top so ordering is consistent
    const startingTop = getScrollTop(scroller);
    setScrollTop(scroller, 0);
    await delay(400);

    for (let pass = 0; pass < COLLECT_MAX_PASSES; pass++) {
      // Collect
      for (const p of collectSongPathsFromDom()) seen.add(p);

      const count = seen.size;
      if (count === lastCount) stable++;
      else stable = 0;
      lastCount = count;

      if (stable >= COLLECT_STABLE_PASSES_TO_STOP) break;

      // Scroll down
      const step = Math.max(200, Math.floor((scroller.clientHeight || window.innerHeight) * 0.9));
      const current = getScrollTop(scroller);
      setScrollTop(scroller, current + step);
      await delay(COLLECT_SCROLL_PAUSE_MS);
    }

    // Restore where user was
    setScrollTop(scroller, startingTop);
    await delay(250);

    return Array.from(seen);
  }

  function findSongLinkInDomByPath(path) {
    const anchors = findLinksInDom();
    return anchors.find((a) => a.getAttribute("href") === path) || null;
  }

  async function findSongLinkByScrolling(path, scroller, timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    let lastTop = -1;
    let wrapped = false;

    while (performance.now() - start < timeoutMs) {
      const match = findSongLinkInDomByPath(path);
      if (match) return match;

      const viewH = scroller.clientHeight || window.innerHeight;
      const step = Math.max(220, Math.floor(viewH * FIND_SCROLL_STEP_RATIO));

      const top = getScrollTop(scroller);
      if (top === lastTop) {
        // likely stuck at bottom; wrap once to top and try again
        if (!wrapped) {
          wrapped = true;
          setScrollTop(scroller, 0);
          await delay(FIND_SCROLL_PAUSE_MS);
          lastTop = getScrollTop(scroller);
          continue;
        }
        break;
      }

      setScrollTop(scroller, top + step);
      await delay(FIND_SCROLL_PAUSE_MS);
      lastTop = top;
    }
    return null;
  }

  function realClick(el) {
    // Mimic a real user click in a way SPA routers usually like
    const rect = el.getBoundingClientRect();
    const opts = {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.left + Math.min(10, rect.width / 2),
      clientY: rect.top + Math.min(10, rect.height / 2),
      button: 0,
    };
    el.dispatchEvent(new PointerEvent("pointerdown", opts));
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new PointerEvent("pointerup", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  }

  async function waitForSongPage(timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const ogAudio = document.querySelector('meta[property="og:audio"]');
      const titleInput = document.querySelector('input[type="text"]');
      if (ogAudio || titleInput) return true;
      await delay(POLL_INTERVAL);
    }
    return false;
  }

  async function waitForListPage(timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      if (document.querySelector('[data-testid="song-row"]')) return true;
      await delay(POLL_INTERVAL);
    }
    return false;
  }

  function extractSongData() {
    const titleInput = document.querySelector('input[type="text"]');
    const title = titleInput ? titleInput.value.trim() : "";

    let author = "";
    const mainAuthorLink =
      document.querySelector('a.hover\\:underline.line-clamp-1.max-w-fit.break-all[href^="/@"]')
      || document.querySelector('a[href^="/@"]');
    if (mainAuthorLink) author = mainAuthorLink.textContent.trim();

    const ogAudio = document.querySelector('meta[property="og:audio"]');
    const mp3Url = ogAudio ? ogAudio.content : "";

    const srcEl = document.querySelector('video source[src*="suno.ai"]');
    const vEl = document.querySelector('video');
    const videoUrl =
      (srcEl && srcEl.src) ||
      (vEl && (vEl.currentSrc || vEl.src)) ||
      "";

    const info = {
      pageUrl: location.href,
      title,
      mp3Url,
      videoUrl,
      author,
    };

    console.log("Extracted:", info);
    return info;
  }

  function safeLine(v) {
    return v == null ? "" : String(v).replace(/\r?\n/g, " ");
  }

  function sanitizeFilename(title) {
    let s = (title ?? "").toString().trim();

    try { s = s.normalize("NFKD"); } catch (_) {}
    try { s = s.replace(/\p{Extended_Pictographic}+/gu, ""); } catch (_) {}
    try { s = s.replace(/\p{M}+/gu, ""); } catch (_) {}

    s = s.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "");
    s = s.replace(/[^\w\s\-\(\)]+/g, "");
    s = s.replace(/\s+/g, " ").trim();
    s = s.replace(/[. ]+$/g, "");

    if (s.length > MAX_NAME_LEN) s = s.slice(0, MAX_NAME_LEN).trim();
    return s || "untitled";
  }

  function uniqueBase(base, used) {
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) name = `${base} (${n++})`;
    used.add(name.toLowerCase());
    return name;
  }

  async function blobDownload(url, filename) {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(objUrl);
  }

  function askRange1Based(total) {
    const startStr = prompt(`Found ${total} items.\nEnter START index (1-${total}).\nLeave blank for 1:`, "1");
    const endStr = prompt(`Enter END index (1-${total}).\nLeave blank for ${total}:`, String(total));

    let start1 = startStr == null || startStr.trim() === "" ? 1 : parseInt(startStr.trim(), 10);
    let end1 = endStr == null || endStr.trim() === "" ? total : parseInt(endStr.trim(), 10);

    if (!Number.isFinite(start1) || !Number.isFinite(end1) || Number.isNaN(start1) || Number.isNaN(end1)) {
      alert("Invalid start/end index. Aborting.");
      return null;
    }

    start1 = Math.max(1, Math.min(total, start1));
    end1 = Math.max(1, Math.min(total, end1));

    if (end1 < start1) {
      alert(`End index must be >= start index.\nYou entered: start=${start1}, end=${end1}\nAborting.`);
      return null;
    }

    return { start1, end1, start0: start1 - 1, end0: end1 - 1 };
  }

  // -----------------------------------------------------------------
  // NAV LOG
  // -----------------------------------------------------------------
  function logNav(state, type, data = {}) {
    const entry = {
      t: nowIso(),
      type,
      at: location.href,
      ...data,
    };
    state.navLog.push(entry);
    console.log("%c[NAV]", "color:#7dd3fc", entry);
    saveState(state);
  }

  // -----------------------------------------------------------------
  // START / RESUME
  // -----------------------------------------------------------------
  const scroller = getPlaylistScroller();
  const playlistUrl = location.href;

  let state = loadState();
  let results = [];
  let navLog = [];
  let songPaths = [];
  let range = null;
  let iStart0 = 0;
  let iEnd0 = 0;
  let iNext = 0;

  if (state && state.playlistUrl && state.playlistUrl.split("?")[0] === playlistUrl.split("?")[0]) {
    const resume = confirm(
      "Found saved progress for this playlist.\n\nOK = Resume\nCancel = Start over (clears saved progress)"
    );
    if (!resume) {
      clearState();
      state = null;
    }
  } else if (state) {
    // saved state exists but different playlist
    const overwrite = confirm(
      "Found saved progress from a DIFFERENT playlist.\n\nOK = Start over here (clears old progress)\nCancel = Keep old progress (no changes)"
    );
    if (overwrite) {
      clearState();
      state = null;
    }
  }

  if (state) {
    results = state.results || [];
    navLog = state.navLog || [];
    songPaths = state.songPaths || [];
    range = state.range || null;
    iStart0 = state.iStart0 ?? 0;
    iEnd0 = state.iEnd0 ?? (songPaths.length - 1);
    iNext = state.iNext ?? iStart0;

    console.log("✅ Resuming with saved state:", { iNext, iStart0, iEnd0, total: songPaths.length });
  } else {
    // Fresh run: collect items
    if (COLLECT_ALL_ITEMS_BY_SCROLLING) {
      console.log("Collecting ALL song paths by scrolling the playlist container...");
      songPaths = await collectAllSongPathsByScrolling(scroller);
    } else {
      songPaths = collectSongPathsFromDom();
    }

    console.log("Found song paths:", songPaths);

    if (!songPaths.length) {
      console.warn("No songs found on this page.");
      return;
    }

    range = askRange1Based(songPaths.length);
    if (!range) return;

    iStart0 = range.start0;
    iEnd0 = range.end0;
    iNext = iStart0;

    state = {
      playlistUrl,
      songPaths,
      range,
      iStart0,
      iEnd0,
      iNext,
      results: [],
      navLog: [],
      lastListScrollTop: getScrollTop(scroller),
    };
    saveState(state);
    logNav(state, "start", { total: songPaths.length, start1: range.start1, end1: range.end1 });
  }

  const start1 = state.range.start1;
  const end1 = state.range.end1;
  const rangeCount = end1 - start1 + 1;

  // -----------------------------------------------------------------
  // MAIN LOOP
  // -----------------------------------------------------------------
  for (let i = iNext; i <= iEnd0 && i < state.songPaths.length; i++) {
    state.iNext = i; // save where we are BEFORE doing anything risky
    state.lastListScrollTop = getScrollTop(scroller);
    saveState(state);

    const path = state.songPaths[i];
    const globalIdx = i + 1;
    const localIdx = globalIdx - start1 + 1;

    console.log(`\n=== ${localIdx} / ${rangeCount} :: item ${globalIdx} / ${state.songPaths.length} :: ${path} ===`);

    // Find link (scroll-find if virtualized)
    let link = findSongLinkInDomByPath(path);
    if (!link) {
      console.log("Link not in DOM (likely virtualized). Scrolling to find it...");
      link = await findSongLinkByScrolling(path, scroller, PAGE_TIMEOUT);
    }

    if (!link) {
      console.warn("Could not find link for path, skipping:", path);
      logNav(state, "skip_not_found", { path, globalIdx, localIdx });
      continue;
    }

    // Ensure visible (helps click reliability)
    try { link.scrollIntoView({ block: "center", behavior: "instant" }); } catch (_) {}
    await delay(BEFORE_CLICK_DELAY);

    logNav(state, "click_song", {
      path,
      from: state.playlistUrl,
      globalIdx,
      localIdx,
      listScrollTop: state.lastListScrollTop,
    });

    // UI-style click (no direct navigation)
    realClick(link);

    const songReady = await waitForSongPage();
    if (!songReady) {
      console.warn("Timed out waiting for song page:", path);
      logNav(state, "timeout_song_page", { path, globalIdx, localIdx });
      continue;
    }

    logNav(state, "song_page_ready", { path, landed: location.href, globalIdx, localIdx });

    await delay(AFTER_SONG_LOAD_DELAY);

    const data = extractSongData();
    state.results.push(data);
    saveState(state);

    await delay(BEFORE_BACK_DELAY);
    logNav(state, "go_back", { fromSong: location.href, toList: state.playlistUrl, globalIdx, localIdx });

    history.back();

    const listReady = await waitForListPage();
    if (!listReady) {
      console.warn("Timed out waiting to return to list page. Stopping.");
      logNav(state, "timeout_back_to_list", { globalIdx, localIdx });
      break;
    }

    await delay(AFTER_LIST_LOAD_DELAY);

    // Restore scroll position on list (fixes reload/scroll loss most of the time)
    if (typeof state.lastListScrollTop === "number") {
      setScrollTop(scroller, state.lastListScrollTop);
      await delay(200);
    }

    logNav(state, "back_on_list", { at: location.href, restoredScrollTop: state.lastListScrollTop });
  }

  // Mark done
  state.iNext = state.iEnd0 + 1;
  saveState(state);
  logNav(state, "done_scrape", { results: state.results.length });

  console.log("\n=== ALL RESULTS ===");
  console.table(state.results);

  // -----------------------------------------------------------------
  // DOWNLOAD TSV (RECORD) + NAV LOG
  // -----------------------------------------------------------------
  if (DOWNLOAD_TSV_RECORD) {
    const lines = state.results.map((r) =>
      [safeLine(r.title), safeLine(r.mp3Url), safeLine(r.videoUrl), safeLine(r.author), safeLine(r.pageUrl)].join("\t")
    );

    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "suno_songs.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    console.log("Downloaded suno_songs.txt (record).");
  }

  if (DOWNLOAD_NAV_LOG) {
    const header = ["time", "type", "at", "path", "from", "landed", "fromSong", "toList", "globalIdx", "localIdx", "listScrollTop", "restoredScrollTop"].join("\t");
    const lines = state.navLog.map((e) => ([
      safeLine(e.t),
      safeLine(e.type),
      safeLine(e.at),
      safeLine(e.path),
      safeLine(e.from),
      safeLine(e.landed),
      safeLine(e.fromSong),
      safeLine(e.toList),
      safeLine(e.globalIdx),
      safeLine(e.localIdx),
      safeLine(e.listScrollTop),
      safeLine(e.restoredScrollTop),
    ].join("\t")));
    const text = [header, ...lines].join("\n");

    const blob = new Blob([text], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "suno_nav_log.tsv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    console.log("Downloaded suno_nav_log.tsv.");
  }

  // -----------------------------------------------------------------
  // BLOB DOWNLOADS (IN-MEMORY)
  // -----------------------------------------------------------------
  const items = state.results
    .map((r) => ({
      title: (r.title || "").trim(),
      mp3: (r.mp3Url || "").trim(),
      mp4: (r.videoUrl || "").trim(),
    }))
    .filter((x) => x.mp3 || x.mp4);

  console.log(`Starting blob downloads for ${items.length} items...`);
  console.log("If Chrome blocks it, allow multiple downloads for suno.com in the address bar prompt.");

  const used = new Set();

  for (let i = 0; i < items.length; i++) {
    const idx = String(i + 1).padStart(2, "0");
    const clean = sanitizeFilename(items[i].title);
    const base0 = PREFIX_INDEX ? `${idx} - ${clean}` : clean;
    const base = uniqueBase(base0, used);

    if (DOWNLOAD_MP3 && items[i].mp3) {
      const mp3Name = `${base}.mp3`;
      console.log(`[${i + 1}/${items.length}] blob → ${mp3Name}`);
      try {
        await blobDownload(items[i].mp3, mp3Name);
      } catch (e) {
        console.error(`MP3 FAILED: ${mp3Name}`, e);
      }
      await delay(DELAY_MS);
    }

    if (DOWNLOAD_MP4 && items[i].mp4) {
      const mp4Name = `${base}.mp4`;
      console.log(`[${i + 1}/${items.length}] blob → ${mp4Name}`);
      try {
        await blobDownload(items[i].mp4, mp4Name);
      } catch (e) {
        console.error(`MP4 FAILED: ${mp4Name}`, e);
      }
      await delay(DELAY_MS);
    }
  }

  console.log("Done. (Saved state remains so you can resume / inspect logs.)");
  console.log("To clear saved state: localStorage.removeItem('MEQ_SUNO_SCRAPE_STATE_V2')");
})();

// SUNO PLAYLIST → SCRAPE URLs → DOWNLOAD TSV (records) → BLOB DOWNLOAD MP3/MP4
// PATCH: add NAV logging + "pause on miss" (no selector widening, no timeout changes)

(async () => {
  // -----------------------------------------------------------------
  // SETTINGS (UNCHANGED)
  // -----------------------------------------------------------------
  const BEFORE_CLICK_DELAY = 1000;
  const AFTER_SONG_LOAD_DELAY = 2000;
  const BEFORE_BACK_DELAY = 2000;
  const AFTER_LIST_LOAD_DELAY = 3000;
  const POLL_INTERVAL = 250;
  const PAGE_TIMEOUT = 990000;

  // Download behavior
  const DOWNLOAD_TSV_RECORD = true;
  const DOWNLOAD_MP3 = true;
  const DOWNLOAD_MP4 = true;

  // PATCH: nav log download
  const DOWNLOAD_NAV_LOG = true; // downloads suno_nav_log.tsv

  // PATCH: do NOT skip instantly when stuff glitches
  const PAUSE_ON_MISS = true; // if true, prompts you to retry same item instead of skipping

  // Blob-download pacing / filenames
  const DELAY_MS = 900;
  const MAX_NAME_LEN = 90;
  const PREFIX_INDEX = false;

  // Optional: try to load more rows first (only helps if the playlist uses infinite scroll)
  const AUTO_SCROLL_TO_LOAD_MORE = false;
  const AUTO_SCROLL_PAUSE_MS = 800;
  const AUTO_SCROLL_MAX_PASSES = 40;

  // -----------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const nowIso = () => new Date().toISOString();

  // PATCH: navigation log
  const NAV_LOG = [];
  function nav(type, extra = {}) {
    const entry = { t: nowIso(), type, at: location.href, ...extra };
    NAV_LOG.push(entry);
    console.log("%c[NAV]", "color:#8be9fd", entry);
  }

  async function autoScrollToLoadMore() {
    let lastHeight = -1;
    let stableCount = 0;

    for (let pass = 0; pass < AUTO_SCROLL_MAX_PASSES; pass++) {
      window.scrollTo(0, document.body.scrollHeight);
      await delay(AUTO_SCROLL_PAUSE_MS);

      const h = document.body.scrollHeight;
      if (h === lastHeight) stableCount++;
      else stableCount = 0;

      lastHeight = h;
      if (stableCount >= 3) break;
    }

    window.scrollTo(0, 0);
    await delay(500);
  }

  // IMPORTANT: keep YOUR original selector so counts stay correct
  function collectSongPaths() {
    const links = Array.from(
      document.querySelectorAll(
        '[data-testid="song-row"] span.line-clamp-1.font-sans.text-base.font-medium.break-all.text-foreground-primary > a[href^="/song/"]'
      )
    );
    return Array.from(new Set(links.map((a) => a.getAttribute("href"))));
  }

  // IMPORTANT: keep YOUR original find logic + timeout
  async function findSongLink(path, timeoutMs = PAGE_TIMEOUT) {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const links = Array.from(
        document.querySelectorAll(
          '[data-testid="song-row"] span.line-clamp-1.font-sans.text-base.font-medium.break-all.text-foreground-primary > a[href^="/song/"]'
        )
      );
      const match = links.find((a) => a.getAttribute("href") === path);
      if (match) return match;
      await delay(POLL_INTERVAL);
    }
    return null;
  }

  // PATCH: "pause and retry" instead of skip
  async function findSongLinkWithManualRetry(path) {
    while (true) {
      const link = await findSongLink(path, PAGE_TIMEOUT);
      if (link) return link;

      nav("miss_link_timeout", { path });

      if (!PAUSE_ON_MISS) return null;

      const ok = confirm(
        `Couldn't find the next item in the playlist DOM:\n${path}\n\n` +
        `This usually means the page reloaded, list didn't render yet, or you need to scroll/load.\n\n` +
        `Click OK after you manually recover (scroll/load/back to playlist) to RETRY.\n` +
        `Click Cancel to STOP.`
      );
      if (!ok) return null;
    }
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
      document.querySelector(
        'a.hover\\:underline.line-clamp-1.max-w-fit.break-all[href^="/@"]'
      ) || document.querySelector('a[href^="/@"]');
    if (mainAuthorLink) author = mainAuthorLink.textContent.trim();

    const ogAudio = document.querySelector('meta[property="og:audio"]');
    const mp3Url = ogAudio ? ogAudio.content : "";

    const videoEl = document.querySelector('video[src*="suno.ai"], video source[src*="suno.ai"]');
    let videoUrl = "";
    if (videoEl) {
      const el = videoEl.tagName.toLowerCase() === "source" ? videoEl : videoEl;
      videoUrl = el.currentSrc || el.src || "";
    } else {
      const v = document.querySelector("video");
      videoUrl = v ? (v.currentSrc || v.src || "") : "";
    }

    const info = {
      pageUrl: location.href,
      title,
      mp3Url,
      videoUrl,
      author,
    };

    console.log("Extracted:", info);
    nav("extract", { pageUrl: info.pageUrl, title: info.title });
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
    const startStr = prompt(
      `Found ${total} items.\nEnter START index (1-${total}).\nLeave blank for 1:`,
      "1"
    );
    const endStr = prompt(
      `Enter END index (1-${total}).\nLeave blank for ${total}:`,
      String(total)
    );

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
  // SCRAPE
  // -----------------------------------------------------------------
  if (AUTO_SCROLL_TO_LOAD_MORE) {
    console.log("Auto-scrolling to load more rows...");
    await autoScrollToLoadMore();
  }

  const results = [];
  const songPaths = collectSongPaths();
  console.log("Found song paths (title links only):", songPaths);
  nav("collected_paths", { count: songPaths.length });

  if (!songPaths.length) {
    console.warn("No songs found on this page.");
    return;
  }

  const range = askRange1Based(songPaths.length);
  if (!range) return;

  const { start1, end1, start0, end0 } = range;
  const rangeCount = end1 - start1 + 1;

  console.log(`\nProcessing range: ${start1}..${end1} (total ${rangeCount} items)\n`);
  nav("range", { start1, end1, rangeCount });

  for (let i = start0; i <= end0 && i < songPaths.length; i++) {
    const path = songPaths[i];

    const globalIdx = i + 1;
    const localIdx = globalIdx - start1 + 1;

    console.log(`\n=== ${localIdx} / ${rangeCount} :: item ${globalIdx} / ${songPaths.length} :: ${path} ===`);

    // PATCH: remember scroll so coming back is less annoying (no effect if full reload)
    const listScrollY = window.scrollY;

    // PATCH: use manual-retry wrapper so it doesn't skip instantly
    const link = await findSongLinkWithManualRetry(path);
    if (!link) {
      console.warn("Stopping (could not find link):", path);
      nav("stop_not_found", { path, globalIdx, localIdx });
      break;
    }

    await delay(BEFORE_CLICK_DELAY);

    nav("click", {
      path,
      globalIdx,
      localIdx,
      fromListUrl: location.href,
      listScrollY
    });

    // IMPORTANT: still click the UI element, not direct navigation
    link.click();

    const songReady = await waitForSongPage();
    if (!songReady) {
      console.warn("Timed out waiting for song page:", path);
      nav("timeout_song_page", { path, globalIdx, localIdx });

      if (PAUSE_ON_MISS) {
        const ok = confirm(
          `Timed out waiting for song page to load.\n${path}\n\n` +
          `Click OK after you manually recover (reload/back) to RETRY this same item.\n` +
          `Cancel to STOP.`
        );
        if (ok) { i--; continue; } // retry same item
      }

      continue;
    }

    nav("song_loaded", { path, landedUrl: location.href, globalIdx, localIdx });

    await delay(AFTER_SONG_LOAD_DELAY);
    results.push(extractSongData());

    await delay(BEFORE_BACK_DELAY);
    nav("back", { fromSongUrl: location.href, toListHistoryBack: true, globalIdx, localIdx });

    history.back();

    const listReady = await waitForListPage();
    if (!listReady) {
      console.warn("Timed out waiting to return to list page. Stopping.");
      nav("timeout_back_to_list", { globalIdx, localIdx });
      break;
    }

    await delay(AFTER_LIST_LOAD_DELAY);

    // PATCH: restore scroll (again: doesn't help full reloads, but helps normal SPA back)
    window.scrollTo(0, listScrollY);
    nav("list_ready", { listUrl: location.href, restoredScrollY: listScrollY });
  }

  console.log("\n=== ALL RESULTS ===");
  console.table(results);

  // -----------------------------------------------------------------
  // DOWNLOAD TSV (RECORD)
  // -----------------------------------------------------------------
  if (DOWNLOAD_TSV_RECORD) {
    const lines = results.map((r) =>
      [safeLine(r.title), safeLine(r.mp3Url), safeLine(r.videoUrl), safeLine(r.author)].join("\t")
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

  // PATCH: DOWNLOAD NAV LOG
  if (DOWNLOAD_NAV_LOG) {
    const header = ["time", "type", "at", "path", "fromListUrl", "landedUrl", "fromSongUrl", "globalIdx", "localIdx", "listScrollY", "restoredScrollY"].join("\t");
    const lines = NAV_LOG.map((e) => [
      safeLine(e.t),
      safeLine(e.type),
      safeLine(e.at),
      safeLine(e.path),
      safeLine(e.fromListUrl),
      safeLine(e.landedUrl),
      safeLine(e.fromSongUrl),
      safeLine(e.globalIdx),
      safeLine(e.localIdx),
      safeLine(e.listScrollY),
      safeLine(e.restoredScrollY),
    ].join("\t"));

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

  const items = results
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

  // expose logs if you want to copy without downloading
  window.__SUNO_NAV_LOG__ = NAV_LOG;
  console.log("Done. (window.__SUNO_NAV_LOG__ available)");
})();

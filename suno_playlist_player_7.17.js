// ==UserScript==
// @name Suno - Playlist Ripper + Downloader v7.17 (Synced Full Video + Dark Audio Player)
// @namespace https://suno.com/
// @version 7.17
// @description v7.17 - Visible dark MP3 audio player + automatic video seek sync for full videos (lyrics stay in sync). Clean & stable.
// @author Grok + you
// @match https://suno.com/*
// @grant none
// @run-at document-start
// ==/UserScript==

console.log('[Ripper v7.17] Loaded with synced full-video + dark audio player');

// ====================== JSON MEDIA DOWNLOADER (unchanged) ======================
(() => {
  "use strict";
  const OPEN_EVENT = "ncz-json-media-downloader-open";
  const PANEL_ID = "ncz-json-media-downloader-panel";
  const LOADED_FLAG = "__ncz_json_media_downloader_loaded__";
  if (window[LOADED_FLAG]) return;
  window[LOADED_FLAG] = true;
  const PLAYLIST_API_BASE = "https://studio-api.prod.suno.com/api/playlist";
  let requestSeq = 0;
  function sanitizeFilename(name, fallback = "file") {
    return String(name || fallback).replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\s+/g, " ").trim().slice(0, 180) || fallback;
  }
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  function getExtFromUrl(url, fallback = "") {
    try {
      const m = new URL(url, location.href).pathname.match(/\.([a-zA-Z0-9]{2,8})(?:$|\?)/);
      return m ? "." + m[1].toLowerCase() : fallback;
    } catch { return fallback; }
  }
  function extractPlaylistUuid(input) {
    const s = String(input || "").trim();
    if (!s) return "";
    const m = s.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return m ? m[0] : "";
  }
  function extractEntries(json) {
    let arr = null;
    if (json?.playlist_schema?.playlist_clips && Array.isArray(json.playlist_schema.playlist_clips)) arr = json.playlist_schema.playlist_clips;
    else if (Array.isArray(json?.playlist_clips)) arr = json.playlist_clips;
    else if (Array.isArray(json)) arr = json;
    if (!arr) throw new Error("Could not find playlist_clips array.");
    return arr.map((entry, idx) => {
      const clip = entry?.clip ?? entry ?? {};
      return {
        index: idx + 1,
        title: clip?.title || entry?.title || `untitled_${idx + 1}`,
        video_cover_url: clip?.video_cover_url || entry?.video_cover_url || "",
        audio_url: clip?.audio_url || entry?.audio_url || "",
        video_url: clip?.video_url || entry?.video_url || "",
        image_large_url: clip?.image_large_url || entry?.image_large_url || "",
        clip_id: clip?.id || entry?.id || "",
        raw: entry
      };
    });
  }
  async function fetchJson(url) {
    const res = await fetch(url, { method: "GET", credentials: "omit", mode: "cors", headers: { "accept": "application/json, text/plain, */*" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  function makeEntryKey(entry, idx) {
    const clip = entry?.clip ?? entry ?? {};
    return clip?.id || entry?.id || clip?.audio_url || clip?.video_url || clip?.image_large_url || `${clip?.title || entry?.title || "untitled"}__${idx}`;
  }
  async function fetchWholePlaylist(uuid, log) {
    const cleanUuid = extractPlaylistUuid(uuid);
    if (!cleanUuid) throw new Error("Invalid playlist UUID.");
    const merged = [];
    const seen = new Set();
    let firstPageJson = null;
    let page = 1;
    let emptyPagesInRow = 0;
    while (page <= 1000) {
      const url = `${PLAYLIST_API_BASE}/${cleanUuid}/?page=${page}`;
      log(`Fetching playlist page ${page}...`);
      const data = await fetchJson(url);
      if (!firstPageJson) firstPageJson = data;
      const pageClips = data?.playlist_schema?.playlist_clips || data?.playlist_clips || [];
      if (!pageClips.length) {
        emptyPagesInRow++;
        if (emptyPagesInRow >= 1) break;
      } else {
        emptyPagesInRow = 0;
        pageClips.forEach((entry, idx) => {
          const key = makeEntryKey(entry, idx);
          if (!seen.has(key)) { seen.add(key); merged.push(entry); }
        });
      }
      page++;
      await sleep(150);
    }
    if (!firstPageJson) throw new Error("Could not fetch first playlist page.");
    if (firstPageJson?.playlist_schema) firstPageJson.playlist_schema.playlist_clips = merged;
    else firstPageJson.playlist_clips = merged;
    firstPageJson._dump_meta = { playlist_uuid: cleanUuid, pages_fetched: page - 1, merged_items: merged.length, dumped_at: new Date().toISOString() };
    return firstPageJson;
  }
  async function fetchBlob(url) {
    const res = await fetch(url, { method: "GET", credentials: "omit" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  }
  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }
  function triggerUrlDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.rel = "noopener"; a.target = "_blank";
    document.body.appendChild(a); a.click(); a.remove();
  }
  function downloadViaBridge(url, filename) {
    return new Promise((resolve, reject) => {
      const requestId = `nczdl_${Date.now()}_${++requestSeq}`;
      function onMessage(e) {
        if (e.source !== window) return;
        const msg = e.data;
        if (!msg || msg.type !== "NCZ_DOWNLOAD_URL_RESPONSE" || msg.requestId !== requestId) return;
        window.removeEventListener("message", onMessage);
        msg.ok ? resolve(msg.downloadId) : reject(new Error(msg.error || "Bridge failed"));
      }
      window.addEventListener("message", onMessage);
      window.postMessage({ type: "NCZ_DOWNLOAD_URL_REQUEST", requestId, url, filename }, "*");
      setTimeout(() => { window.removeEventListener("message", onMessage); reject(new Error("Bridge timeout")); }, 15000);
    });
  }
  async function tryDownload(url, filename, log, current, total, opts = {}) {
    const { preferBridge = false, noDirectLinkFallback = false } = opts;
    if (preferBridge) {
      try { await downloadViaBridge(url, filename); log(`[${current}/${total}] Downloaded via bridge: ${filename}`); return true; }
      catch (e) { log(`Bridge failed: ${e.message}`); }
    }
    try {
      const blob = await fetchBlob(url);
      triggerBlobDownload(blob, filename);
      log(`[${current}/${total}] Downloaded: ${filename}`);
      return true;
    } catch (e) {}
    if (!preferBridge) {
      try { await downloadViaBridge(url, filename); log(`[${current}/${total}] Downloaded via bridge fallback: ${filename}`); return true; }
      catch (e) {}
    }
    if (noDirectLinkFallback) return false;
    try { triggerUrlDownload(url, filename); log(`[${current}/${total}] Direct link triggered: ${filename}`); return true; }
    catch (e) { return false; }
  }
  function makeReportText(modeLabel, skipped, failed) {
    const lines = [`Report for mode: ${modeLabel}`, "", `Skipped: ${skipped.length}`, ""];
    skipped.forEach((x, i) => lines.push(`${i+1}. ${x}`));
    lines.push("", `Failed: ${failed.length}`, "");
    failed.forEach((x, i) => lines.push(`${i+1}. ${x}`));
    return lines.join("\n");
  }
  const DOWNLOAD_MODES = {
    both: { label: "both", required: ["video_cover_url", "audio_url"], files: [{ key: "video_cover_url", fallbackExt: ".jpg" }, { key: "audio_url", fallbackExt: ".mp3" }] },
    mp3: { label: "mp3", required: ["audio_url"], files: [{ key: "audio_url", fallbackExt: ".mp3" }] },
    covers: { label: "covers", required: ["video_cover_url"], files: [{ key: "video_cover_url", fallbackExt: ".jpg" }] },
    genvideos: { label: "generated_videos", required: ["video_url"], files: [{ key: "video_url", fallbackExt: ".mp4", forceNameSuffix: ".mp3.mp4" }] },
    meta: { label: "meta", required: [], files: [] },
    images: { label: "images", required: ["image_large_url"], files: [{ key: "image_large_url", fallbackExt: ".jpg" }] }
  };
  function openPanel() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) { existing.style.display = "block"; return; }
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.style.cssText = `position:fixed;top:20px;right:20px;width:560px;background:#111;color:#eee;border:1px solid #444;border-radius:10px;padding:12px;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,.45);font:12px/1.4 monospace;`;
    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <strong style="font-size:14px;">JSON Media Downloader</strong>
        <button id="${PANEL_ID}-close" style="background:#600;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;">X</button>
      </div>
      <div style="margin-bottom:8px;">Playlist UUID or full playlist URL:</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
        <input id="${PANEL_ID}-uuid" type="text" placeholder="Paste playlist UUID or full Suno playlist URL here..." style="flex:1;background:#1a1a1a;color:#fff;border:1px solid #555;border-radius:8px;padding:8px;" />
        <button id="${PANEL_ID}-fetch" style="background:#265dbe;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Fetch Playlist</button>
      </div>
      <div style="margin-bottom:8px;">Paste your full JSON dump below, or fetch it above.</div>
      <textarea id="${PANEL_ID}-input" spellcheck="false" style="width:100%;height:220px;resize:vertical;background:#1a1a1a;color:#fff;border:1px solid #555;border-radius:8px;padding:8px;" placeholder="Paste full JSON here..."></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
        <button id="${PANEL_ID}-both" style="background:#0a6;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Download Both</button>
        <button id="${PANEL_ID}-mp3" style="background:#4a7;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Download MP3s</button>
        <button id="${PANEL_ID}-covers" style="background:#875;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Download Covers</button>
        <button id="${PANEL_ID}-genvideos" style="background:#a63;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Download Generated Videos</button>
        <button id="${PANEL_ID}-meta" style="background:#357;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Download Meta</button>
        <button id="${PANEL_ID}-images" style="background:#b56;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Download Images</button>
        <button id="${PANEL_ID}-clear" style="background:#555;color:#fff;border:none;border-radius:6px;padding:8px 12px;cursor:pointer;">Clear</button>
      </div>
      <pre id="${PANEL_ID}-log" style="margin-top:10px;white-space:pre-wrap;background:#0b0b0b;border:1px solid #333;border-radius:8px;padding:8px;height:220px;overflow:auto;"></pre>
    `;
    document.body.appendChild(panel);
    const $uuid = document.getElementById(`${PANEL_ID}-uuid`);
    const $input = document.getElementById(`${PANEL_ID}-input`);
    const $log = document.getElementById(`${PANEL_ID}-log`);
    const $fetch = document.getElementById(`${PANEL_ID}-fetch`);
    const $both = document.getElementById(`${PANEL_ID}-both`);
    const $mp3 = document.getElementById(`${PANEL_ID}-mp3`);
    const $covers = document.getElementById(`${PANEL_ID}-covers`);
    const $genvideos = document.getElementById(`${PANEL_ID}-genvideos`);
    const $meta = document.getElementById(`${PANEL_ID}-meta`);
    const $images = document.getElementById(`${PANEL_ID}-images`);
    const $clear = document.getElementById(`${PANEL_ID}-clear`);
    const $close = document.getElementById(`${PANEL_ID}-close`);
    function log(msg) {
      const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
      console.log(line);
      $log.textContent += line + "\n";
      $log.scrollTop = $log.scrollHeight;
    }
    function setButtonsDisabled(disabled) {
      [$fetch, $both, $mp3, $covers, $genvideos, $meta, $images, $clear].forEach(b => { b.disabled = disabled; b.style.opacity = disabled ? "0.65" : "1"; });
    }
    async function runDownloadMode(modeKey) {
      const mode = DOWNLOAD_MODES[modeKey];
      if (!mode) return;
      setButtonsDisabled(true);
      try {
        const raw = $input.value.trim();
        if (!raw) throw new Error("No JSON pasted or fetched.");
        log(`Parsing JSON for mode "${mode.label}"...`);
        const json = JSON.parse(raw);
        const entries = extractEntries(json);
        log(`Found ${entries.length} entries.`);
        const valid = [], skipped = [], failed = [];
        for (const item of entries) {
          const hasAll = mode.required.every(k => !!item[k]);
          if (hasAll) valid.push(item);
          else if (mode.required.length) skipped.push(item.title || `untitled_${item.index}`);
        }
        log(`Will process ${valid.length} entries. Skipped ${skipped.length}.`);
        let completed = 0;
        for (let i = 0; i < valid.length; i++) {
          const item = valid[i];
          const current = i + 1, total = valid.length;
          const base = sanitizeFilename(item.title || `clip_${item.index}`, `clip_${item.index}`);
          log(`[${current}/${total}] Processing: ${item.title}`);
          let itemOk = true;
          if (modeKey === "meta") {
            try {
              triggerBlobDownload(new Blob([JSON.stringify(item.raw, null, 2)], { type: "application/json" }), `${base}.json`);
              log(`[${current}/${total}] Downloaded: ${base}.json`);
              completed++;
            } catch (e) { itemOk = false; failed.push(item.title); }
            await sleep(250); continue;
          }
          for (const f of mode.files) {
            const url = item[f.key];
            const fn = f.forceNameSuffix ? `${base}${f.forceNameSuffix}` : `${base}${getExtFromUrl(url, f.fallbackExt)}`;
            const ok = await tryDownload(url, fn, log, current, total, modeKey === "images" ? { preferBridge: true, noDirectLinkFallback: true } : {});
            if (!ok) itemOk = false;
            await sleep(250);
          }
          if (!itemOk) failed.push(item.title); else completed++;
          await sleep(350);
        }
        const report = makeReportText(mode.label, skipped, failed);
        triggerBlobDownload(new Blob([report], { type: "text/plain" }), `skipped_titles_${mode.label}.txt`);
        log(`Done. Completed ${completed}/${valid.length}.`);
      } catch (e) { log(`ERROR: ${e.message}`); }
      finally { setButtonsDisabled(false); }
    }
    $close.onclick = () => panel.remove();
    $clear.onclick = () => { $uuid.value = ""; $input.value = ""; $log.textContent = ""; };
    $fetch.onclick = async () => {
      setButtonsDisabled(true);
      try {
        $log.textContent = "";
        const uuid = extractPlaylistUuid($uuid.value);
        if (!uuid) throw new Error("Invalid UUID or URL.");
        log(`Fetching playlist ${uuid}...`);
        const merged = await fetchWholePlaylist(uuid, log);
        $input.value = JSON.stringify(merged, null, 2);
        log(`Fetch complete. JSON loaded.`);
      } catch (e) { log(`ERROR: ${e.message}`); }
      finally { setButtonsDisabled(false); }
    };
    $both.onclick = () => runDownloadMode("both");
    $mp3.onclick = () => runDownloadMode("mp3");
    $covers.onclick = () => runDownloadMode("covers");
    $genvideos.onclick = () => runDownloadMode("genvideos");
    $meta.onclick = () => runDownloadMode("meta");
    $images.onclick = () => runDownloadMode("images");
  }
  window.addEventListener(OPEN_EVENT, openPanel);
  window.NCZOpenJsonMediaDownloader = openPanel;
  console.log("[NCZ JSON Downloader] ready");
})();

// ====================== SUNO PLAYLIST RIPPER v7.17 (SYNCED FULL VIDEO + DARK AUDIO) ======================
(function() {
    'use strict';
    const CACHE_KEY = 'suno_playlist_cache_v1';

    // HIDE PLAYING BUTTONS (unchanged)
    const hidePlayingButtons = () => {
        document.querySelectorAll('button[aria-label="Playing"]').forEach(btn => btn.style.setProperty('display', 'none', 'important'));
        const exactClass = "flex items-center justify-center rounded-full p-4 bg-background-primary/60 backdrop-blur-xl border-none outline-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-all duration-200 h-[68px] w-[68px] scale-100 opacity-100";
        document.querySelectorAll('button').forEach(btn => {
            if (btn.getAttribute('class') === exactClass) btn.style.setProperty('display', 'none', 'important');
        });
        document.querySelectorAll('button').forEach(btn => {
            const svg = btn.querySelector('svg');
            if (svg && svg.innerHTML.includes('animate-wave') && svg.innerHTML.includes('rect')) {
                btn.style.setProperty('display', 'none', 'important');
            }
        });
    };
    hidePlayingButtons();
    const observer = new MutationObserver(hidePlayingButtons);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(hidePlayingButtons, 500);

    // API HELPERS (unchanged)
    const PLAYLIST_API_BASE = "https://studio-api.prod.suno.com/api/playlist";
    function extractPlaylistUuid(input) {
        const s = String(input || "").trim();
        if (!s) return "";
        const m = s.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        return m ? m[0] : "";
    }
    async function fetchJson(url) {
        const res = await fetch(url, { method: "GET", credentials: "omit", mode: "cors", headers: { "accept": "application/json, text/plain, */*" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    }
    async function fetchWholePlaylist(uuid, onProgress, onNewSong) {
        const cleanUuid = extractPlaylistUuid(uuid);
        if (!cleanUuid) throw new Error("Invalid UUID");
        const merged = [];
        const seen = new Set();
        let page = 1;
        let emptyPages = 0;
        while (page <= 1000) {
            const url = `${PLAYLIST_API_BASE}/${cleanUuid}/?page=${page}`;
            onProgress && onProgress(`Fetching page ${page}...`);
            const data = await fetchJson(url);
            const pageClips = data?.playlist_schema?.playlist_clips || data?.playlist_clips || [];
            if (!pageClips.length) {
                emptyPages++;
                if (emptyPages >= 2) break;
            } else {
                emptyPages = 0;
                pageClips.forEach((entry, idx) => {
                    const clip = entry?.clip ?? entry ?? {};
                    const key = clip?.id || entry?.id || clip?.audio_url;
                    if (!seen.has(key)) {
                        seen.add(key);
                        const song = {
                            title: clip?.title || entry?.title || `untitled_${idx + 1}`,
                            audio_url: clip?.audio_url || entry?.audio_url || "",
                            video_url: clip?.video_url || entry?.video_url || "",
                            image_large_url: clip?.image_large_url || entry?.image_large_url || "",
                            video_cover_url: clip?.video_cover_url || entry?.video_cover_url || "",
                            clip_id: clip?.id || entry?.id || ""
                        };
                        merged.push(song);
                        onNewSong && onNewSong(song);
                    }
                });
            }
            page++;
            await new Promise(r => setTimeout(r, 100));
        }
        return merged;
    }

    // PERSISTENT CACHE (unchanged)
    function loadCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; } }
    function saveCache(cache) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { console.warn('[CACHE] Failed to save:', e); } }
    function getCachedPlaylist(uuid) { const cache = loadCache(); return cache[uuid] || null; }
    function setCachedPlaylist(uuid, songs) {
        const cache = loadCache();
        cache[uuid] = { songs: songs, cachedAt: new Date().toISOString() };
        saveCache(cache);
    }

    function isOnProfilePage() {
        const url = location.href;
        return url.includes('/@') || url.includes('/profile/@') || url.includes('/profile/');
    }

    function extractPlaylistsFromDOM() {
        if (!isOnProfilePage()) return [];
        const playlists = [];
        const seen = new Set();
        const links = document.querySelectorAll('a[href*="/playlist/"]');
        links.forEach(a => {
            const href = a.getAttribute('href');
            const uuid = extractPlaylistUuid(href);
            if (!uuid || seen.has(uuid)) return;
            seen.add(uuid);
            let name = 'Unnamed Playlist';
            const h4 = a.querySelector('h4');
            const span = a.querySelector('span');
            if (h4) name = h4.textContent.trim();
            else if (span) name = span.textContent.trim();
            else if (a.textContent.trim()) name = a.textContent.trim();
            if (name.length > 80) name = name.substring(0, 77) + '...';
            playlists.push({ uuid, name, songCount: '', url: `https://suno.com${href}` });
        });
        window.sunoPlaylists = playlists;
        return playlists;
    }

    function injectViewSongsButton() {
        if (!isOnProfilePage()) return;
        if (document.getElementById('suno-view-songs-btn')) return;
        let insertAfter = null;
        const isPlaylistsPage = location.href.includes('?page=playlists');
        if (isPlaylistsPage) {
            const recentBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Recent');
            if (recentBtn) {
                let container = recentBtn.parentElement;
                let attempts = 0;
                while (container && attempts < 6) {
                    if (container.querySelectorAll('button').length >= 2 && container.textContent.includes('Recent')) {
                        insertAfter = container;
                        break;
                    }
                    container = container.parentElement;
                    attempts++;
                }
            }
        } else {
            insertAfter = document.querySelector('button[aria-label="View all Playlists"]');
            if (!insertAfter) {
                const allBtns = document.querySelectorAll('button');
                for (let b of allBtns) {
                    if (b.textContent.toLowerCase().includes('playlists')) {
                        insertAfter = b;
                        break;
                    }
                }
            }
        }
        if (!insertAfter) return;
        const newBtn = document.createElement('button');
        newBtn.id = 'suno-view-songs-btn';
        newBtn.textContent = '🎵 View Songs';
        newBtn.style.cssText = `margin-left:12px; padding:7px 16px; background:#1f6feb; color:white; border:none; border-radius:9999px; font-size:13px; font-weight:600; cursor:pointer;`;
        newBtn.onclick = () => {
            openSongsPanel();
            getsongs(false);
        };
        insertAfter.parentNode.insertBefore(newBtn, insertAfter.nextSibling);
    }
    setInterval(() => {
        if (isOnProfilePage()) {
            injectViewSongsButton();
        }
    }, 2500);

    // ====================== MAIN PANEL + PLAYER ======================
    let songsPanel = null;
    let currentMode = 'cover';
    let allSongs = [];
    let currentSongIndex = -1;
    let isShuffled = false;
    let shuffledOrder = [];

    function getCurrentPlaylist() { return isShuffled ? shuffledOrder : allSongs; }

    function openSongsPanel() {
        if (songsPanel) {
            songsPanel.style.display = 'flex';
            return;
        }
        songsPanel = document.createElement('div');
        songsPanel.id = 'suno-songs-panel';
        songsPanel.style.cssText = `position:fixed; top:20px; right:20px; width:920px; max-height:85vh; background:#111; color:#eee; border:1px solid #444; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.6); z-index:2147483647; display:flex; flex-direction:row; overflow:hidden; font-family:system-ui;`;
        songsPanel.innerHTML = `
            <div style="flex:1; display:flex; flex-direction:column; min-width:0;">
                <div style="padding:12px 16px; background:#1a1a1a; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #333;">
                    <div style="font-weight:700; font-size:15px;">🎵 Songs</div>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <div style="display:flex; background:#222; border-radius:999px; padding:2px;">
                            <button id="mode-cover" style="padding:4px 12px; border-radius:999px; border:none; font-size:12px; cursor:pointer; background:#1f6feb; color:white;">Cover Videos</button>
                            <button id="mode-video" style="padding:4px 12px; border-radius:999px; border:none; font-size:12px; cursor:pointer; background:#333; color:#aaa;">Full Videos</button>
                        </div>
                        <button id="btn-reload" style="padding:4px 10px; background:#555; color:white; border:none; border-radius:6px; font-size:12px; cursor:pointer;">⟳ Reload</button>
                        <button id="btn-downloads" style="padding:4px 10px; background:#0a6; color:white; border:none; border-radius:6px; font-size:12px; cursor:pointer;">📥 Downloads</button>
                        <button id="close-panel" style="background:#600; color:white; border:none; border-radius:6px; padding:4px 10px; cursor:pointer;">✕</button>
                    </div>
                </div>
                <div id="songs-count" style="padding:8px 16px; font-size:12px; color:#888; background:#1a1a1a;">Waiting for songs...</div>
                <div id="songs-grid" style="flex:1; overflow-y:auto; padding:12px; display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px;"></div>
            </div>
            <div id="side-player" style="width:380px; border-left:1px solid #333; background:#1a1a1a; display:flex; flex-direction:column;">
                <div style="padding:12px 16px; background:#222; font-weight:600; border-bottom:1px solid #333;">Now Playing</div>
                <div style="padding:16px; flex:1; display:flex; flex-direction:column;">
                    <div id="player-media-container" style="position:relative; background:#000; border-radius:8px; overflow:hidden; margin-bottom:12px; min-height:220px; width:100%;"></div>
                    <div id="player-title" style="font-weight:600; font-size:14px; margin-bottom:4px; min-height:36px;">No song selected</div>
                    <div id="player-playlist" style="font-size:11px; color:#888; margin-bottom:12px;"></div>
                    <div style="display:flex; gap:8px; margin-bottom:12px;">
                        <button id="btn-prev" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:6px; cursor:pointer;">⏮ Prev</button>
                        <button id="btn-play" style="flex:1; padding:8px; background:#1f6feb; color:white; border:none; border-radius:6px; cursor:pointer;">▶ Play</button>
                        <button id="btn-next" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:6px; cursor:pointer;">⏭ Next</button>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button id="btn-shuffle" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:6px; cursor:pointer;">🔀 Shuffle</button>
                        <button id="btn-mode" style="flex:1; padding:8px; background:#333; color:white; border:none; border-radius:6px; cursor:pointer;">Mode: Cover</button>
                    </div>

                    <!-- VISIBLE DARK MP3 AUDIO PLAYER -->
                    <div style="margin-top:16px; padding-top:12px; border-top:1px solid #333;">
                        <div style="font-size:11px; color:#888; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                            🎵 <span>MP3 Audio Player</span> <span style="font-size:9px; opacity:0.7;">— volume • seek • loop</span>
                        </div>
                        <audio id="audio-player" controls loop style="width:100%; height:38px; background:#1a1a1a; border:1px solid #444; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.3);"></audio>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(songsPanel);

        const coverBtn = songsPanel.querySelector('#mode-cover');
        const videoBtn = songsPanel.querySelector('#mode-video');

        function setMode(mode) {
            currentMode = mode;
            if (mode === 'cover') {
                coverBtn.style.background = '#1f6feb'; coverBtn.style.color = 'white';
                videoBtn.style.background = '#333'; videoBtn.style.color = '#aaa';
                songsPanel.querySelector('#btn-mode').textContent = 'Mode: Cover';
            } else {
                videoBtn.style.background = '#1f6feb'; videoBtn.style.color = 'white';
                coverBtn.style.background = '#333'; coverBtn.style.color = '#aaa';
                songsPanel.querySelector('#btn-mode').textContent = 'Mode: Full Video';
            }
        }

        coverBtn.onclick = () => setMode('cover');
        videoBtn.onclick = () => setMode('video');
        songsPanel.querySelector('#btn-prev').onclick = () => playPrevious();
        songsPanel.querySelector('#btn-next').onclick = () => playNext();
        songsPanel.querySelector('#btn-play').onclick = () => togglePlay();
        songsPanel.querySelector('#btn-shuffle').onclick = () => toggleShuffle();
        songsPanel.querySelector('#btn-mode').onclick = () => {
            setMode(currentMode === 'cover' ? 'video' : 'cover');
            if (currentSongIndex >= 0) loadSongIntoPlayer(getCurrentPlaylist()[currentSongIndex]);
        };
        songsPanel.querySelector('#btn-reload').onclick = () => getsongs(true);

        const downloadsBtn = songsPanel.querySelector('#btn-downloads');
        if (downloadsBtn) {
            downloadsBtn.onclick = () => {
                if (typeof window.NCZOpenJsonMediaDownloader === 'function') {
                    window.NCZOpenJsonMediaDownloader();
                } else {
                    window.dispatchEvent(new CustomEvent('ncz-json-media-downloader-open'));
                }
            };
        }
        songsPanel.querySelector('#close-panel').onclick = () => { songsPanel.style.display = 'none'; stopCurrentPlayback(); };

        // === VISIBLE AUDIO PLAYER + VIDEO SYNC LOGIC ===
        const audioPlayer = songsPanel.querySelector('#audio-player');
        const playBtn = songsPanel.querySelector('#btn-play');

        if (audioPlayer && playBtn) {
            // Play/pause sync with video
            const syncVideoPlayback = (shouldPlay) => {
                const container = songsPanel.querySelector('#player-media-container');
                if (!container) return;
                const vid = container.querySelector('video');
                if (vid) {
                    if (shouldPlay) vid.play().catch(() => {});
                    else vid.pause();
                }
            };

            audioPlayer.onplay = () => {
                playBtn.textContent = '⏸ Pause';
                syncVideoPlayback(true);
            };
            audioPlayer.onpause = () => {
                playBtn.textContent = '▶ Play';
                syncVideoPlayback(false);
            };

            // === NEW: Sync video seek time with audio (only for full videos with lyrics) ===
            const syncVideoTime = () => {
                const container = songsPanel.querySelector('#player-media-container');
                if (!container) return;
                const vid = container.querySelector('video');
                if (vid && !vid.loop && !vid.paused) {   // only full videos (non-looping)
                    if (Math.abs(vid.currentTime - audioPlayer.currentTime) > 0.3) {
                        vid.currentTime = audioPlayer.currentTime;
                    }
                }
            };

            audioPlayer.onseeked = syncVideoTime;           // instant sync when user seeks

            // Light throttled sync during playback (prevents drift)
            let lastSyncTime = 0;
            audioPlayer.ontimeupdate = () => {
                const now = Date.now();
                if (now - lastSyncTime > 700) {             // every ~700ms
                    lastSyncTime = now;
                    syncVideoTime();
                }
            };
        }

        setMode(currentMode);
    }

    function addSongToPanel(song) {
        if (!songsPanel) return;
        const grid = songsPanel.querySelector('#songs-grid');
        const countEl = songsPanel.querySelector('#songs-count');
        const card = document.createElement('div');
        card.style.cssText = `background:#1f1f1f; border-radius:10px; overflow:hidden; cursor:pointer; border:1px solid #333; height:210px; display:flex; flex-direction:column;`;
        card.onmouseenter = () => card.style.transform = 'scale(1.02)';
        card.onmouseleave = () => card.style.transform = 'scale(1)';
        const thumb = song.image_large_url || song.video_cover_url || '';
        card.innerHTML = `
            <div style="height:130px; background:#222; position:relative; flex-shrink:0;">
                ${thumb ? `<img src="${thumb}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none';this.parentNode.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:11px\\'>No Image</div>'">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:11px">No Image</div>`}
                <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.7); color:white; font-size:10px; padding:2px 6px; border-radius:4px;">${song.playlist || ''}</div>
            </div>
            <div style="padding:8px 10px; flex:1; overflow:hidden;">
                <div style="font-size:12px; font-weight:600; line-height:1.3; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${song.title}</div>
            </div>
        `;
        card.onclick = () => {
            const playlist = getCurrentPlaylist();
            const index = playlist.findIndex(s => s.clip_id === song.clip_id);
            if (index >= 0) { currentSongIndex = index; loadSongIntoPlayer(song); }
        };
        grid.appendChild(card);
        countEl.textContent = `${grid.children.length} songs loaded • Click any card to play`;
    }

    function loadSongIntoPlayer(song) {
        if (!songsPanel) return;
        const container = songsPanel.querySelector('#player-media-container');
        const titleEl = songsPanel.querySelector('#player-title');
        const playlistEl = songsPanel.querySelector('#player-playlist');
        const playBtn = songsPanel.querySelector('#btn-play');
        const audioPlayer = songsPanel.querySelector('#audio-player');

        titleEl.textContent = song.title;
        playlistEl.textContent = song.playlist || '';
        container.innerHTML = '';

        const requestedMode = currentMode;
        let videoSrc = '';
        let audioSrc = song.audio_url || '';
        let actualMode = requestedMode;

        if (requestedMode === 'cover') {
            if (song.video_cover_url) videoSrc = song.video_cover_url;
            else if (song.video_url) { videoSrc = song.video_url; actualMode = 'video'; }
        } else {
            if (song.video_url) videoSrc = song.video_url;
            else if (song.video_cover_url) { videoSrc = song.video_cover_url; actualMode = 'cover'; }
        }

        // Use visible audio player
        if (audioPlayer) {
            if (audioSrc) {
                audioPlayer.src = audioSrc;
                audioPlayer.loop = true;
                audioPlayer.play().catch(() => {});
            } else {
                audioPlayer.src = '';
                audioPlayer.pause();
            }
        }

        if (!videoSrc) {
            const img = document.createElement('img');
            img.src = song.image_large_url || song.video_cover_url || '';
            img.style.cssText = 'width:100%; max-height:220px; object-fit:contain; background:#111;';
            container.appendChild(img);
            playBtn.textContent = (audioPlayer && audioPlayer.src) ? '⏸ Pause' : '▶ Play';
        } else {
            const video = document.createElement('video');
            video.style.cssText = 'width:100%; max-height:220px; background:#000;';
            video.muted = true;
            video.loop = (actualMode === 'cover');
            video.src = videoSrc;
            container.appendChild(video);
            video.onloadedmetadata = () => {
                if (video.duration && video.duration > 0.5) {
                    video.play().catch(() => {});
                    playBtn.textContent = '⏸ Pause';
                } else {
                    container.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = song.image_large_url || song.video_cover_url || '';
                    img.style.cssText = 'width:100%; max-height:220px; object-fit:contain; background:#111;';
                    container.appendChild(img);
                    playBtn.textContent = (audioPlayer && audioPlayer.src) ? '⏸ Pause' : '▶ Play';
                }
            };
            video.onerror = () => {
                container.innerHTML = '';
                const img = document.createElement('img');
                img.src = song.image_large_url || song.video_cover_url || '';
                img.style.cssText = 'width:100%; max-height:220px; object-fit:contain; background:#111;';
                container.appendChild(img);
                playBtn.textContent = (audioPlayer && audioPlayer.src) ? '⏸ Pause' : '▶ Play';
            };
        }

        if (song.clip_id) {
            titleEl.innerHTML = '';
            const link = document.createElement('a');
            link.href = `https://suno.com/song/${song.clip_id}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = song.title;
            link.style.cssText = `color:#60a5fa; text-decoration:none; font-weight:600;`;
            link.onmouseenter = () => link.style.textDecoration = 'underline';
            link.onmouseleave = () => link.style.textDecoration = 'none';
            titleEl.appendChild(link);
        }
    }

    function stopCurrentPlayback() {
        if (!songsPanel) return;
        const container = songsPanel.querySelector('#player-media-container');
        const audioPlayer = songsPanel.querySelector('#audio-player');
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.src = '';
        }
        if (container) container.innerHTML = '';
    }

    function togglePlay() {
        if (!songsPanel) return;
        const container = songsPanel.querySelector('#player-media-container');
        const playBtn = songsPanel.querySelector('#btn-play');
        const audioPlayer = songsPanel.querySelector('#audio-player');
        if (!container || !playBtn) return;

        if (audioPlayer && audioPlayer.src) {
            if (audioPlayer.paused) {
                audioPlayer.play().catch(() => {});
                const vid = container.querySelector('video');
                if (vid) vid.play().catch(() => {});
                playBtn.textContent = '⏸ Pause';
            } else {
                audioPlayer.pause();
                const vid = container.querySelector('video');
                if (vid) vid.pause();
                playBtn.textContent = '▶ Play';
            }
        } else {
            const vid = container.querySelector('video');
            if (vid) {
                if (vid.paused) { vid.play().catch(() => {}); playBtn.textContent = '⏸ Pause'; }
                else { vid.pause(); playBtn.textContent = '▶ Play'; }
            }
        }
    }

    function playNext() {
        const playlist = getCurrentPlaylist();
        if (!playlist.length) return;
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSongIntoPlayer(playlist[currentSongIndex]);
    }

    function playPrevious() {
        const playlist = getCurrentPlaylist();
        if (!playlist.length) return;
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSongIntoPlayer(playlist[currentSongIndex]);
    }

    function toggleShuffle() {
        isShuffled = !isShuffled;
        const btn = songsPanel.querySelector('#btn-shuffle');
        if (isShuffled) {
            shuffledOrder = [...allSongs].sort(() => Math.random() - 0.5);
            btn.style.background = '#1f6feb';
            btn.textContent = '🔀 Shuffled';
        } else {
            shuffledOrder = [];
            btn.style.background = '#333';
            btn.textContent = '🔀 Shuffle';
        }
        if (currentSongIndex >= 0) {
            const currentSong = allSongs[currentSongIndex];
            const newIndex = getCurrentPlaylist().findIndex(s => s.clip_id === currentSong.clip_id);
            if (newIndex >= 0) currentSongIndex = newIndex;
        }
    }

    async function getsongs(forceReload = false) {
        if (!songsPanel) openSongsPanel();
        let playlists = extractPlaylistsFromDOM();
        if (playlists.length === 0) {
            await new Promise(r => setTimeout(r, 1000));
            playlists = extractPlaylistsFromDOM();
        }
        if (!playlists.length) {
            const countEl = songsPanel?.querySelector('#songs-count');
            if (countEl) countEl.textContent = 'No playlists found on this page';
            return;
        }
        allSongs = [];
        currentSongIndex = -1;
        isShuffled = false;
        for (let i = 0; i < playlists.length; i++) {
            const p = playlists[i];
            let songs = [];
            if (!forceReload) {
                const cached = getCachedPlaylist(p.uuid);
                if (cached && cached.songs && cached.songs.length > 0) songs = cached.songs;
            }
            if (songs.length === 0 || forceReload) {
                try {
                    songs = await fetchWholePlaylist(p.uuid, (msg) => console.log(' ' + msg), (song) => { song.playlist = p.name; });
                    setCachedPlaylist(p.uuid, songs);
                } catch (e) { continue; }
            }
            songs.forEach(song => {
                allSongs.push(song);
                if (songsPanel) addSongToPanel(song);
            });
        }
        window.sunoSongs = allSongs;
        if (songsPanel) {
            const countEl = songsPanel.querySelector('#songs-count');
            if (countEl) countEl.textContent = `${allSongs.length} songs loaded • Click any card to play`;
        }
    }

    window.getsongs = getsongs;
    window.extractPlaylists = extractPlaylistsFromDOM;
    window.clearSunoCache = () => { localStorage.removeItem(CACHE_KEY); console.log('[CACHE] Cleared'); };
    console.log('✅ Suno Ripper v7.17 ready — full video now syncs with audio seek');
})();

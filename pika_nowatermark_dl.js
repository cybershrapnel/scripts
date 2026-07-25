(function() {
  const CHECK_INTERVAL = 400;
  const seen = new Set();

  function getVideoUrl(video) {
    if (video.currentSrc) return video.currentSrc;
    if (video.src) return video.src;

    const sources = [...video.querySelectorAll('source')].map(s => s.src).filter(Boolean);
    if (sources.length) return sources.join(' | ');

    return null;
  }

  function getAllVideos() {
    const videos = [...document.querySelectorAll('video')];

    // Also try to find videos inside open shadow roots
    [...document.querySelectorAll('*')].forEach(el => {
      if (el.shadowRoot) {
        videos.push(...el.shadowRoot.querySelectorAll('video'));
      }
    });

    return videos;
  }

  function scan() {
    const videos = getAllVideos();

    videos.forEach(video => {
      try {
        if (!video.paused && !video.ended && video.readyState > 2) {
          const url = getVideoUrl(video);
          if (!url) return;

          const key = url + '|' + Math.floor(video.currentTime);
          if (!seen.has(key)) {
            seen.add(key);
            console.log('%c▶ PLAYING VIDEO', 'color:#0f0;font-weight:bold;font-size:14px', url);
            console.log(video);
          }
        }
      } catch (e) {}
    });

    // Detect common video iframes
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        const src = iframe.src || iframe.getAttribute('src');
        if (src && /youtube|youtu\.be|vimeo|dailymotion|twitch|player\./i.test(src)) {
          const key = 'iframe:' + src;
          if (!seen.has(key)) {
            seen.add(key);
            console.log('%c▶ VIDEO IFRAME DETECTED', 'color:#f80;font-weight:bold', src);
          }
        }
      } catch (e) {}
    });
  }

  setInterval(scan, CHECK_INTERVAL);

  document.addEventListener('play', (e) => {
    if (e.target.tagName === 'VIDEO') {
      const url = getVideoUrl(e.target);
      if (url) {
        console.log('%c▶ PLAY EVENT', 'color:#0ff;font-weight:bold', url);
      }
    }
  }, true);

  const observer = new MutationObserver(() => scan());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  });

  console.log('%cAggressive video scanner started', 'color:#0f0;font-weight:bold');
  scan();
})();

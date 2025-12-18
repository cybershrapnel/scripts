// Block any network requests matching the disneyadvertising.com pattern
const blockRule = /^([^.]+\.)*disneyadvertising\.com$/i;

(function interceptRequests() {
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    try {
      const hostname = new URL(url, location.href).hostname;
      if (blockRule.test(hostname)) {
        console.warn('Blocked request to:', url);
        return; // Stop request entirely
      }
    } catch (err) {
      console.error('XHR block check failed:', err);
    }
    return origOpen.call(this, method, url, ...rest);
  };

  const origFetch = window.fetch;
  window.fetch = async function(url, options) {
    try {
      const hostname = new URL(url, location.href).hostname;
      if (blockRule.test(hostname)) {
        console.warn('Blocked fetch to:', url);
        return new Response('', { status: 403, statusText: 'Blocked by rule' });
      }
    } catch (err) {
      console.error('Fetch block check failed:', err);
    }
    return origFetch(url, options);
  };
})();

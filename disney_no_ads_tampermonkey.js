// ==UserScript==
// @name         Block Disney Advertising Requests
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blocks all network requests to disneyadvertising.com and its subdomains
// @author       You
// @match        *://*.disneyplus.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const blockRule = /^([^.]+\.)*disneyadvertising\.com$/i;

  // Intercept XMLHttpRequest
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    try {
      const hostname = new URL(url, location.href).hostname;
      if (blockRule.test(hostname)) {
        console.warn('Blocked XHR to:', url);
        return; // prevent sending
      }
    } catch (err) {
      console.error('XHR block check failed:', err);
    }
    return origOpen.call(this, method, url, ...rest);
  };

  // Intercept Fetch
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

  console.log('Disney Advertising domain blocker initialized.');
})();

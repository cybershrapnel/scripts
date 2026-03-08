// ==UserScript==
// @name         Block modal + overlay by class
// @namespace    ncz
// @version      1.1
// @description  Prevents specific modal/overlay elements from remaining in the DOM
// @match        https://www.producer.ai/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

//Press A key after page loads to regain button control.

  
(() => {
  "use strict";

  const BLOCK_PATTERNS = [
    // Modal container
    [
      "fixed",
      "inset-0",
      "z-(--z-modal)",
      "flex",
      "items-center",
      "justify-center",
    ],

    // Backdrop overlay
    [
      "fixed",
      "inset-0",
      "z-(--z-overlay)",
      "bg-black/40",
    ],
  ];

  function isElement(node) {
    return node && node.nodeType === 1;
  }

  function matchesPattern(el, pattern) {
    if (!isElement(el) || !el.classList) return false;
    return pattern.every(cls => el.classList.contains(cls));
  }

  function shouldBlock(el) {
    return BLOCK_PATTERNS.some(pattern => matchesPattern(el, pattern));
  }

  function findBlockedInside(root) {
    if (!isElement(root) || !root.querySelectorAll) return [];
    return Array.from(root.querySelectorAll("*")).filter(shouldBlock);
  }

  function removeIfBlocked(node) {
    if (!isElement(node)) return false;

    let removed = false;

    if (shouldBlock(node)) {
      node.remove();
      return true;
    }

    for (const el of findBlockedInside(node)) {
      el.remove();
      removed = true;
    }

    return removed;
  }

  // Hide matching nodes immediately to reduce flash
  const style = document.createElement("style");
  style.textContent = `
    .fixed.inset-0.flex.items-center.justify-center.z-\\(--z-modal\\),
    .fixed.inset-0.z-\\(--z-overlay\\).bg-black\\/40,
    .fixed.inset-0.z-\\(--z-overlay\\).bg-black\\/40.dark\\:bg-black\\/60 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.documentElement.appendChild(style);

  function sweep() {
    const all = document.querySelectorAll("*");
    for (const el of all) {
      if (shouldBlock(el)) el.remove();
    }
  }

  // Patch insertion methods
  const appendChildOrig = Node.prototype.appendChild;
  const insertBeforeOrig = Node.prototype.insertBefore;
  const replaceChildOrig = Node.prototype.replaceChild;

  Node.prototype.appendChild = function(node) {
    if (removeIfBlocked(node)) return node;
    return appendChildOrig.call(this, node);
  };

  Node.prototype.insertBefore = function(node, ref) {
    if (removeIfBlocked(node)) return node;
    return insertBeforeOrig.call(this, node, ref);
  };

  Node.prototype.replaceChild = function(node, oldChild) {
    if (removeIfBlocked(node)) return oldChild;
    return replaceChildOrig.call(this, node, oldChild);
  };

  // Watch DOM changes and class mutations
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        for (const node of m.addedNodes) {
          removeIfBlocked(node);
        }
      } else if (m.type === "attributes") {
        const el = m.target;
        if (shouldBlock(el)) el.remove();
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "data-state"],
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sweep, { once: true });
  } else {
    sweep();
  }
})();

(() => {
  "use strict";

  if (window.__nczUnlockTester) {
    console.log("[NCZ UnlockTester] already loaded");
    return;
  }

  const state = {
    step: 0,
    total: 8,
    lastRemoved: 0,
  };

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || "").toUpperCase();
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      el.isContentEditable
    );
  }

  function qsa(sel, root = document) {
    try { return Array.from(root.querySelectorAll(sel)); }
    catch { return []; }
  }

  function setStyleImportant(el, prop, value) {
    try { el.style.setProperty(prop, value, "important"); } catch {}
  }

  function unlockGlobal() {
    const html = document.documentElement;
    const body = document.body;

    [html, body].forEach(el => {
      if (!el) return;
      setStyleImportant(el, "pointer-events", "auto");
      setStyleImportant(el, "overflow", "auto");
      setStyleImportant(el, "overflow-x", "auto");
      setStyleImportant(el, "overflow-y", "auto");
      setStyleImportant(el, "user-select", "auto");
      setStyleImportant(el, "touch-action", "auto");
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
      el.removeAttribute("data-aria-hidden");
    });
  }

  function unlockAllElements() {
    const all = document.querySelectorAll("*");
    for (const el of all) {
      el.removeAttribute("inert");
      if (el.getAttribute("aria-hidden") === "true") el.removeAttribute("aria-hidden");
      if (el.getAttribute("data-aria-hidden") === "true") el.removeAttribute("data-aria-hidden");

      setStyleImportant(el, "pointer-events", "auto");
    }
  }

  function removeLikelyOverlays() {
    let removed = 0;
    const all = document.querySelectorAll("*");

    for (const el of all) {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const cls = el.className || "";
      const z = Number(cs.zIndex);
      const bigEnough =
        rect.width >= window.innerWidth * 0.85 &&
        rect.height >= window.innerHeight * 0.85;

      const looksOverlay =
        (cs.position === "fixed" || cs.position === "absolute") &&
        bigEnough &&
        (
          cls.includes("z-(--z-overlay)") ||
          cls.includes("z-(--z-modal)") ||
          cs.pointerEvents !== "none" ||
          (!Number.isNaN(z) && z >= 20)
        );

      if (looksOverlay) {
        el.remove();
        removed++;
      }
    }

    state.lastRemoved = removed;
    return removed;
  }

  function lowerAllHighZ() {
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const cs = getComputedStyle(el);
      const z = Number(cs.zIndex);
      if (!Number.isNaN(z) && z >= 10) {
        setStyleImportant(el, "z-index", "0");
      }
    }
  }

  function disablePointerBlockers() {
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const bigEnough =
        rect.width >= window.innerWidth * 0.85 &&
        rect.height >= window.innerHeight * 0.85;

      if (
        (cs.position === "fixed" || cs.position === "absolute") &&
        bigEnough &&
        cs.pointerEvents !== "none"
      ) {
        setStyleImportant(el, "pointer-events", "none");
        setStyleImportant(el, "background", "transparent");
      }
    }
  }

  function focusBodyAndTopElement() {
    try {
      document.body?.focus?.();
      window.focus?.();
    } catch {}

    const midX = Math.floor(window.innerWidth / 2);
    const midY = Math.floor(window.innerHeight / 2);
    let el = null;

    try {
      el = document.elementFromPoint(midX, midY);
    } catch {}

    if (el) {
      try {
        el.removeAttribute("inert");
        el.focus?.();
        el.click?.();
      } catch {}
    }
  }

  function unlockDialogs() {
    const candidates = qsa('[role="dialog"], [aria-modal="true"], [data-state="open"]');
    for (const el of candidates) {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
      el.removeAttribute("data-aria-hidden");
      setStyleImportant(el, "pointer-events", "auto");
    }
  }

  function nukeProblemClasses() {
    const targets = qsa(`
      .pointer-events-none,
      .z-\\(--z-overlay\\),
      .z-\\(--z-modal\\),
      .overflow-hidden
    `);

    for (const el of targets) {
      el.classList.remove("pointer-events-none", "z-(--z-overlay)", "z-(--z-modal)", "overflow-hidden");
      setStyleImportant(el, "pointer-events", "auto");
    }
  }

  function runStep(step) {
    switch (step) {
      case 0:
        unlockGlobal();
        console.log("[NCZ UnlockTester] Step 1: unlockGlobal");
        break;
      case 1:
        unlockDialogs();
        console.log("[NCZ UnlockTester] Step 2: unlockDialogs");
        break;
      case 2:
        nukeProblemClasses();
        console.log("[NCZ UnlockTester] Step 3: nukeProblemClasses");
        break;
      case 3:
        disablePointerBlockers();
        console.log("[NCZ UnlockTester] Step 4: disablePointerBlockers");
        break;
      case 4: {
        const removed = removeLikelyOverlays();
        console.log("[NCZ UnlockTester] Step 5: removeLikelyOverlays | removed =", removed);
        break;
      }
      case 5:
        lowerAllHighZ();
        console.log("[NCZ UnlockTester] Step 6: lowerAllHighZ");
        break;
      case 6:
        unlockAllElements();
        console.log("[NCZ UnlockTester] Step 7: unlockAllElements");
        break;
      case 7:
        focusBodyAndTopElement();
        console.log("[NCZ UnlockTester] Step 8: focusBodyAndTopElement");
        break;
    }
  }

  function handler(e) {
    if (e.repeat) return;
    if (e.key !== "a" && e.key !== "A") return;
    if (isTypingTarget(e.target)) return;

    const step = state.step % state.total;
    runStep(step);
    state.step++;
  }

  document.addEventListener("keydown", handler, true);

  window.__nczUnlockTester = {
    remove() {
      document.removeEventListener("keydown", handler, true);
      delete window.__nczUnlockTester;
      console.log("[NCZ UnlockTester] removed");
    },
    runAll() {
      for (let i = 0; i < state.total; i++) runStep(i);
    },
    reset() {
      state.step = 0;
      console.log("[NCZ UnlockTester] step counter reset");
    },
    state,
  };

  console.log("[NCZ UnlockTester] loaded");
  console.log("[NCZ UnlockTester] press A to cycle unlock strategies");
  console.log("[NCZ UnlockTester] window.__nczUnlockTester.runAll() to run all");
  console.log("[NCZ UnlockTester] window.__nczUnlockTester.remove() to unload");
})();

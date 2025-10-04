(function () {
  "use strict";

  /******************************
   * EVE: DBS ANIME SCENE ENGINE
   * (Simple Prompt Passthrough)
   ******************************/
  const CONFIG = {
    // keep your timing/behavior exactly the same
    ensureAnimeDBS: true,
    defaultSFW: true,
    strictlyAdultWhenPeople: true,
    includeLoreMotifs: true,
    includeCircleTriangle: true,
    sectionsPerPrompt: [5, 8],
    addActHeaders: true,
    addCameraLanguage: true,
    addTransitions: true,
    addColorGrade: true,
    addFilmStock: true,
    addUIOverlays: false,
    addReferenceLines: true,
    addAudioBlock: true,
    loopSchedulerMs: [60_000, 110_000],
    seed: null
  };

  // === your fixed simple prompt (exact text) ===
  const SIMPLE_PROMPT =
    "make fake gameplay from a fake metroidvania style game on the NES but I want you to make up new levels and enemies that didn't exist in any original game.";

  // Tiny RNG (left intact for compatibility)
  let _seed = CONFIG.seed ?? (Math.random() * 1e9) | 0;
  function rand() { _seed^=_seed<<13; _seed^=_seed>>>17; _seed^=_seed<<5; return ((_seed>>>0)/0xFFFFFFFF); }

  /********************
   * PROMPT BUILDING  *
   ********************/
  // === THE ONLY CHANGE: always return your simple prompt ===
  function buildPrompt() {
    return SIMPLE_PROMPT;
  }

  /*******************
   * DOM INTEGRATION *
   *******************/
  function setText(el, value) {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function findTextArea() {
    return document.querySelector(
      'textarea[placeholder*="Describe"], textarea[placeholder*="prompt"], textarea'
    );
  }

  function findSubmitButton() {
    const btns = Array.from(document.querySelectorAll("button"));
    const byText = btns.find(b => /generate|create|submit|go|make|render/i.test(b.textContent || ""));
    return byText || btns[0];
  }

  function uiShowsQueue() {
    const divs = Array.from(document.querySelectorAll("div"));
    return divs.some(d => {
      const t = (d.textContent || "").trim().toLowerCase();
      return /\b\d{1,3}%\b/.test(t) || /queue|queued|processing|working/i.test(t);
    });
  }

  function generateAndSubmit() {
    const ta = findTextArea();
    if (!ta) { console.log("[simple passthrough] textarea not found"); return false; }
    const prompt = buildPrompt();
    setText(ta, prompt);
    console.log("[simple passthrough] inserted prompt:", prompt);
    const btn = findSubmitButton();
    if (btn) { setTimeout(() => btn.click(), 400); console.log("[simple passthrough] submit clicked"); }
    else { console.log("[simple passthrough] submit button not found"); }
    return true;
  }

  function scheduleNext() {
    const [min, max] = CONFIG.loopSchedulerMs;
    const delay = Math.floor(min + Math.random() * (max - min));
    setTimeout(tick, delay);
  }

  function tick() {
    if (uiShowsQueue()) { console.log("[simple passthrough] queue detected, waiting…"); setTimeout(tick, 20_000); return; }
    generateAndSubmit();
    scheduleNext();
  }

  // Kickoff
  tick();
})();

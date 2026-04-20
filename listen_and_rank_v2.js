// ==UserScript==
// @name         Suno Listen & Earn Auto-Farmer (Optimized + Auto-Reload)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Automatically farms listen & earn credits. Clicks Start, waits, farms with 18s plays, and reloads every 12 tasks.
// @author       Grok
// @match        https://suno.com/listen-and-rank
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ==================== CONFIG ====================
    const MAX_TASKS_BEFORE_RELOAD = 12;

    // ==================== VARIABLES ====================
    let running = false;
    let stopRequested = false;
    let taskCount = 0;

    // ==================== HELPERS ====================
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function simulateClick(el) {
        if (el && document.body.contains(el)) {
            el.dispatchEvent(new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            console.log(`[${new Date().toLocaleTimeString()}] ✅ Clicked:`, el.innerText?.trim() || el.tagName);
        } else {
            console.warn("⚠️ Element not found or detached!");
        }
    }

    async function waitForElement(selector, timeout = 15000) {
        return new Promise((resolve, reject) => {
            let el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.documentElement, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout: ${selector}`));
            }, timeout);
        });
    }

    async function waitForChoices(timeout = 15000) {
        return new Promise((resolve, reject) => {
            const check = () => {
                const container = document.querySelector("div.css-1swbe27");
                if (container) {
                    const options = Array.from(container.querySelectorAll("div"))
                        .filter(d => ["A", "B", "Neither"].includes(d.innerText.trim()));
                    if (options.length >= 3) return options;
                }
                return null;
            };

            let options = check();
            if (options) return resolve(options);

            const observer = new MutationObserver(() => {
                options = check();
                if (options) {
                    observer.disconnect();
                    resolve(options);
                }
            });

            observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error("Choices not found"));
            }, timeout);
        });
    }

    // ==================== MAIN TASK ====================
    async function doOneTask() {
        console.log(`\n[${new Date().toLocaleTimeString()}] 🚀 Starting task #${taskCount + 1}...`);

        try {
            // 1. First Play
            const firstPlay = await waitForElement('button[aria-label="Play"]', 12000);
            simulateClick(firstPlay);
            await sleep(18000 + Math.random() * 3000); // 18–21s

            // 2. Second Play
            const secondPlay = await waitForElement('button[aria-label="Play"]', 12000);
            simulateClick(secondPlay);
            await sleep(18000 + Math.random() * 3000);

            // 3. Choose A/B/Neither
            const options = await waitForChoices(12000);
            const choice = options[Math.floor(Math.random() * options.length)];
            console.log(`   → Choosing: ${choice.innerText}`);
            simulateClick(choice);
            await sleep(1800 + Math.random() * 1200);

            // 4. Submit
            const submitBtn = Array.from(document.querySelectorAll("button"))
                .find(b => b.textContent.trim().toLowerCase().includes("submit"));

            if (submitBtn) {
                simulateClick(submitBtn);
            } else {
                console.warn("⚠️ Submit button not found");
            }

            // 5. Pause + increment counter
            taskCount++;
            console.log(`   📊 Completed ${taskCount}/${MAX_TASKS_BEFORE_RELOAD} tasks`);

            const pause = 4500 + Math.random() * 3500;
            await sleep(pause);

            // Occasional longer break
            if (Math.random() < 0.12) {
                const longBreak = 12000 + Math.random() * 8000;
                console.log(`   🧘 Longer break (${Math.round(longBreak / 1000)}s)`);
                await sleep(longBreak);
            }

        } catch (err) {
            console.error(`   ❌ Error: ${err.message}`);
            await sleep(4000);
        }
    }

    // ==================== MAIN LOOP ====================
    async function runSequence() {
        if (running) return;
        running = true;
        stopRequested = false;

        console.log("%c[STARTED] Suno Auto-Farmer v2.1 running. Type stopSuno() to stop.", "color:#0f0");

        while (!stopRequested) {
            await doOneTask();

            // === RELOAD AFTER 12 TASKS ===
            if (taskCount >= MAX_TASKS_BEFORE_RELOAD) {
                console.log("%c[RELOAD] 12 tasks completed. Reloading page in 3 seconds...", "color:#0af");
                setTimeout(() => {
                    location.reload();
                }, 3000);
                break;
            }
        }

        running = false;
    }

    function stopSuno() {
        stopRequested = true;
        console.log("%c🛑 Stop requested. Will finish current task then stop.", "color:#ff0");
    }

    // ==================== AUTO STARTUP (5s wait → Click Start → 3s → Farm) ====================
    async function startEverything() {
        console.log("%c[STARTUP] Waiting 5 seconds for page to load...", "color:#0af");
        await sleep(5000);

        // Click the Start button
        const startBtn = Array.from(document.querySelectorAll("button"))
            .find(b => b.textContent.trim() === "Start");

        if (startBtn) {
            console.log("%c[STARTUP] Clicking Start button...", "color:#0af");
            simulateClick(startBtn);
        } else {
            console.warn("%c[STARTUP] Start button not found — continuing anyway", "color:#f80");
        }

        console.log("%c[STARTUP] Waiting 3 seconds...", "color:#0af");
        await sleep(3000);

        // Start farming
        runSequence();
    }

    // ==================== BOOT ====================
    console.log("%c[Suno Auto-Farmer] Tampermonkey script loaded. Starting in 5 seconds...", "color:#0af");
    startEverything();

    // Expose stop function globally
    window.stopSuno = stopSuno;

})();

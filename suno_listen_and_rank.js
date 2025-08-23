//run this script from the listen and earn page
//https://suno.com/listen-and-rank
//click the start button and then run this script
//it will auto earn listen and earn credits for all your pending tasks.
//It will burn all your tasks if you leave it running.
//I usually run it for 30 minutes or so and get a small pile of credits to use
//I burn the earned credits before 5pm when reset happens, wait for my 50 free credits to daily reload at 5pm PST, and then run script again to maximize credits.
//earned credits seem to deploy on the top of every hour as of right now.

function simulateClick(el) {
  if (el && document.body.contains(el)) {
    el.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }));
    console.log("Clicked:", el.innerText || el);
  } else {
    console.warn("Element not found or no longer in DOM!");
  }
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const interval = 200;
    let elapsed = 0;
    const timer = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(timer);
        resolve(el);
      } else if ((elapsed += interval) >= timeout) {
        clearInterval(timer);
        reject("Element not found: " + selector);
      }
    }, interval);
  });
}

function waitForChoices(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const interval = 200;
    let elapsed = 0;
    const timer = setInterval(() => {
      const container = document.querySelector("div.css-1swbe27");
      if (container) {
        const options = Array.from(container.querySelectorAll("div"))
          .filter(d => ["A", "B", "Neither"].includes(d.innerText.trim()));
        if (options.length >= 3) {
          clearInterval(timer);
          resolve(options);
          return;
        }
      }
      if ((elapsed += interval) >= timeout) {
        clearInterval(timer);
        reject("Choice divs not found");
      }
    }, interval);
  });
}

function runSequence() {
  console.log("🚀 Starting sequence...");

  // Step 1: Click the first Play
  waitForElement('button[aria-label="Play"]').then(firstPlay => {
    simulateClick(firstPlay);

    // Step 2: Wait 12s, then find and click the second Play
    setTimeout(() => {
      waitForElement('button[aria-label="Play"]').then(secondPlay => {
        simulateClick(secondPlay);

        // Step 3: Wait another 12s, then click random A/B/Neither
        setTimeout(() => {
          waitForChoices().then(options => {
            let randomDiv = options[Math.floor(Math.random() * options.length)];
            console.log("Choosing option:", randomDiv.innerText);
            simulateClick(randomDiv);

            // Step 4: Wait 2s, then click Submit
            setTimeout(() => {
              const submitBtn = Array.from(document.querySelectorAll("button"))
                .find(b => b.textContent.includes("Submit"));
              simulateClick(submitBtn);

              // Step 5: Wait 5s, then loop again
              setTimeout(() => {
                runSequence(); // 🔁 loop forever
              }, 5000);

            }, 2000);

          }).catch(console.error);
        }, 12000);

      }).catch(console.error);
    }, 12000);
  }).catch(console.error);
}

// Kick it off
runSequence();

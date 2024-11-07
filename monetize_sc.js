(async function automateMonetization() {
    // Specify the title of the track to start with
    const startingTrackTitle = "Virtual Stars Recover Persona Remix 2".toLowerCase();
    // Specify the title of the track to stop at
    const stopTrackTitle = "Ghost in thejfjfjfj Code".toLowerCase();

    // List of phrases to skip (all converted to lowercase for case-insensitive comparison)
    const skipPhrases = [
        "love again",
        "lovea again",
        "lovae again",
        "echoes of the moon",
        "the veil of the merkaba",
        "song that saves the world",
        "transmission",
        "halloween again",
        "virtual power",
        "restoring the circuit",
        "ghost in the code",
        "anime",
        "window",
        "cover",
        "persona",
        "certify again",
        "love recursion",
        "mining again",
        "music again",
        "no more",
        " again",
        "trying to explain again"
    ].map(phrase => phrase.toLowerCase());

    // Wait for a specific amount of time
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Initial delay before starting the script
    await wait(5000);

    // Check if the title contains any phrases to skip (case-insensitive)
    function shouldSkipTitle(title) {
        const lowerTitle = title.toLowerCase();
        return skipPhrases.some(phrase => lowerTitle.includes(phrase));
    }

    // Function to set content rating with strict delays
    async function setContentRating() {
        const contentRatingButton = [...document.querySelectorAll('button')]
            .find(btn => btn.textContent.includes('Select') || btn.textContent.includes('Not Explicit'));

        if (contentRatingButton) {
            let attempts = 0;
            const maxAttempts = 5;
            let success = false;

            while (attempts < maxAttempts && !success) {
                contentRatingButton.click();
                await wait(500); // Wait for dropdown to fully open
                
                const notExplicitOption = [...document.querySelectorAll('li div')]
                    .find(option => option.textContent.trim() === "Not Explicit");
                if (notExplicitOption) {
                    notExplicitOption.click();
                    await wait(500); // Wait for the setting to apply
                    
                    success = contentRatingButton.textContent.includes("Not Explicit");
                    if (!success) {
                        console.log(`Attempt ${attempts + 1} to set content rating failed. Retrying...`);
                        await wait(500); // 2-second delay before next retry
                    }
                }
                attempts++;
            }

            if (!success) {
                console.log("Content rating could not be set to 'Not Explicit' after retries.");
            }

            await wait(500); // Additional wait before moving to submit
            return success;
        }
        return false;
    }

    // Main function to process tracks
    async function processTrack(button, title) {
        button.click();
        await wait(500); // Wait for the form to load

        const contributorNameInput = document.querySelector('input[name="contributors.1.name"]');
        if (contributorNameInput) {
            contributorNameInput.focus();
            contributorNameInput.value = "";
            contributorNameInput.dispatchEvent(new Event('input', { bubbles: true }));
            contributorNameInput.value = "Kenneth Erkel Thorson";
            contributorNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const labelInput = document.querySelector('input[name="label"]');
        if (labelInput) {
            labelInput.focus();
            labelInput.value = "";
            labelInput.dispatchEvent(new Event('input', { bubbles: true }));
            labelInput.value = "NanoCheeZe MEQUAVIS";
            labelInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const songwriterRadioButton = document.querySelector('input[name="songwriter"][value="true"]');
        if (songwriterRadioButton) {
            songwriterRadioButton.click();
        }

        const ratingSet = await setContentRating();
        if (ratingSet) {
            console.log("Content rating confirmed as 'Not Explicit'.");
        } else {
            console.log("Proceeding despite failed content rating setting.");
        }

        const monetizeCheckbox = document.querySelector('input[name="monetizeRightsConfirmed"]');
        if (monetizeCheckbox && !monetizeCheckbox.checked) {
            monetizeCheckbox.click();
        }

        await wait(2000); // Ensure everything is set before submitting

        console.log("Submitting the form...");
        await wait(500); // Extra delay for stability
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }

        await wait(500); // Final pause after submission
    }

    // Main execution loop
    async function runAutomation() {
        let firstRun = true;

        while (true) {
            const allMonetizeButtons = [...document.querySelectorAll("button")].filter(button =>
                button.textContent.includes("Monetize this track") && 
                !button.textContent.toLowerCase().includes("resubmit")
            );

            let startIndex = 0;

            // Only look for the starting track on the first run
            if (firstRun) {
                startIndex = allMonetizeButtons.findIndex(button => {
                    const titleElement = button.closest(".w-full").querySelector("span[title]");
                    return titleElement && titleElement.getAttribute("title").toLowerCase() === startingTrackTitle;
                });

                if (startIndex === -1) {
                    console.log("Starting track not found.");
                    return;
                }

                firstRun = false; // After the first run, process all remaining entries
                startIndex++; // Skip the first item
            }

            let currentIndex = startIndex;
            while (currentIndex < allMonetizeButtons.length) {
                const button = allMonetizeButtons[currentIndex];
                const titleElement = button.closest(".w-full").querySelector("span[title]");
                const title = titleElement ? titleElement.getAttribute("title") : "";

                if (title.toLowerCase() === stopTrackTitle) {
                    console.log(`Stopping at track: ${title}`);
                    return;
                }

                if (shouldSkipTitle(title)) {
                    console.log(`Skipping track: ${title}`);
                    currentIndex++;
                    continue;
                }

                await processTrack(button, title);
                currentIndex++;
                console.log("Moving to the next track...");
                await wait(3500); // Delay before moving to the next track
            }

            // Scroll to the bottom and wait for more entries to load
            console.log("No more entries found, scrolling to the bottom...");
            window.scrollTo(0, document.body.scrollHeight);
            await wait(10000); // Wait 10 seconds before continuing to check for new entries
        }
    }

    // Run the automation process
    runAutomation();

    console.log("Automation is running...");
})();

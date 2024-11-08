// Select all buttons with the specified aria-label
function clickUnclickedButtons(delay) {
    const buttons = document.querySelectorAll('button[aria-label="Like button with like count"]');
    console.log(`Found ${buttons.length} like buttons on the page.`);

    let index = 0;

    function clickNextButton() {
        // Stop if we've processed all buttons
        if (index >= buttons.length) {
            console.log("Finished processing all buttons.");
            // Wait 2 minutes (120000 ms) and then run the function again
            setTimeout(() => {
                console.log("Restarting after 2 minutes.");
                clickUnclickedButtons(delay);
            }, 120000);
            return;
        }

        const button = buttons[index];

        // Check if the button is unliked by verifying the presence of `bg-vinylBlack-darker/50` in its class list
        if (button.classList.contains('bg-vinylBlack-darker/50')) {
            // Scroll to the button to make it visible
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log(`Clicking button ${index + 1} (unliked).`);
            button.click();
            // Wait for the delay only after clicking an unliked button
            index++;
            setTimeout(clickNextButton, delay);
        } else {
            // If the button is already liked, skip the delay and move to the next one immediately
            console.log(`Skipping button ${index + 1} (already liked).`);
            index++;
            clickNextButton();
        }
    }

    clickNextButton();
}

// Start clicking with a 500ms delay for unliked buttons only
clickUnclickedButtons(500);

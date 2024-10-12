// Add a keypress event listener to the document
document.addEventListener('keydown', function(event) {
    // Check if the 'z' key was pressed
    if (event.key === 'z' || event.key === 'Z') {
        // Simulate typing the contributor name "Kenneth Erkel Thorson" (2nd contributor)
        const contributorNameInput = document.querySelector('input[name="contributors.1.name"]');
        if (contributorNameInput) {
            contributorNameInput.focus();
            contributorNameInput.value = "";
            contributorNameInput.dispatchEvent(new Event('input', { bubbles: true }));
            contributorNameInput.value = "Kenneth Erkel Thorson";
            contributorNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Simulate typing the music label "NanoCheeZe MEQUAVIS"
        const labelInput = document.querySelector('input[name="label"]');
        if (labelInput) {
            labelInput.focus();
            labelInput.value = "";
            labelInput.dispatchEvent(new Event('input', { bubbles: true }));
            labelInput.value = "NanoCheeZe MEQUAVIS";
            labelInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Simulate a click on the radio button for "I wrote this song/I represent the writer(s)"
        const songwriterRadioButton = document.querySelector('input[name="songwriter"][value="true"]');
        if (songwriterRadioButton) {
            songwriterRadioButton.click(); // Simulate a native click event
        }

        // Look for the content rating button using stable text or aria-label
        const contentRatingButton = [...document.querySelectorAll('button')]
            .find(btn => btn.textContent.includes('Select') || btn.textContent.includes('Not Explicit'));

        if (contentRatingButton) {
            contentRatingButton.click(); // Simulate a click to open the dropdown

            // Use a timeout to wait for the dropdown to open
            setTimeout(function() {
                // Find and click the "Not Explicit" option inside the dropdown
                const notExplicitOption = [...document.querySelectorAll('li div')]
                    .find(option => option.textContent.trim() === "Not Explicit");
                
                if (notExplicitOption) {
                    notExplicitOption.click(); // Click on the "Not Explicit" option
                }
            }, 200); // Adjust the delay based on rendering time if needed
        }

        // Simulate a click to tick the checkbox to confirm rights to monetize the track
        const monetizeCheckbox = document.querySelector('input[name="monetizeRightsConfirmed"]');
        if (monetizeCheckbox && !monetizeCheckbox.checked) {
            monetizeCheckbox.click(); // Simulate a native click event
        }
    }
});

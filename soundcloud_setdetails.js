function processItem(index = 0) {
    // Select the first 20 menu buttons for each item on the page
    let menuButtons = Array.from(document.querySelectorAll("button[aria-label='Open track actions']")).slice(0, 20);

    // Check if the current index is within the first 20 items
    if (menuButtons[index]) {
        menuButtons[index].click();
        console.log(`Menu button clicked for item ${index + 1}.`);

        // Wait for menu to open
        setTimeout(() => {
            // Step 2: Find and click "Edit details" from the menu
            let editDetailsButton = [...document.querySelectorAll("li")].find(li => li.textContent.includes("Edit"));
            if (editDetailsButton) {
                editDetailsButton.click();
                console.log("Edit details button clicked.");

                // Wait for edit details panel to open
                setTimeout(() => {
                    // Step 3: Find and click "Advanced settings" tab
                    let advancedSettingsButton = [...document.querySelectorAll("button")].find(button => button.textContent.includes("Advanced settings"));
                    if (advancedSettingsButton) {
                        advancedSettingsButton.click();
                        console.log("Advanced settings tab clicked.");

                        // Wait for advanced settings panel to open
                        setTimeout(() => {
                            // Step 4: Locate and click the second matching SVG icon to expand the "Permissions" section
                            let svgIcons = [...document.querySelectorAll("svg")].filter(svg => 
                                svg.getAttribute("height") === "24" &&
                                svg.getAttribute("width") === "24" &&
                                svg.getAttribute("viewBox") === "0 0 24 24" &&
                                svg.querySelector("path") &&
                                svg.querySelector("path").getAttribute("d") === "m10 3.94 7.53 7.53a.75.75 0 0 1 0 1.06L10 20.06 8.94 19l7-7-7-7L10 3.94Z" &&
                                svg.querySelector("path").getAttribute("transform") === "rotate(90, 12, 12)"
                            );

                            if (svgIcons && svgIcons.length > 1) {
                                svgIcons[1].parentElement.click();  // Click the second matching SVG icon
                                console.log("Permissions section expanded.");

                                // Wait for permissions section to fully expand
                                setTimeout(() => {
                                    // Step 5: Set checkboxes to true (active), excluding 'Select All' and 'Explicit'
                                    let checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
                                    checkboxes.forEach((checkbox) => {
                                        if (!checkbox.hasAttribute("data-indeterminate") && !checkbox.hasAttribute("name")) {
                                            if (!checkbox.checked) {
                                                checkbox.click();
                                                console.log("Checkbox set to true.");
                                            }
                                        }
                                    });
                                    console.log("All target checkboxes set to active.");

                                    // Step 6: Wait and click "Save changes" button
                                    setTimeout(() => {
                                        let saveButton = document.querySelector("button.Button_Primary__GHMis");
                                        if (saveButton) {
                                            saveButton.click();
                                            console.log("Save changes button clicked.");

                                            // Wait for save to complete, then proceed to the next item
                                            setTimeout(() => {
                                                if (index + 1 < menuButtons.length) {
                                                    processItem(index + 1); // Process next item
                                                } else {
                                                    console.log("All items processed on this page.");
                                                    goToNextPage();
                                                }
                                            }, 2000); // Wait 2 seconds before moving to the next item
                                        } else {
                                            console.error("Save changes button not found.");
                                        }
                                    }, 500); // Wait 500 ms after setting checkboxes
                                }, 1000); // Adjust delay as needed
                            } else {
                                console.error("Permissions SVG icon not found. Retrying...");
                                closePopupAndRetry(index); // Close and retry the same item
                            }
                        }, 1000); // Adjust delay as needed
                    } else {
                        console.error("Advanced settings button not found.");
                    }
                }, 1000); // Adjust delay as needed
            } else {
                console.error("Edit details button not found.");
            }
        }, 1000); // Adjust delay as needed
    } else {
        console.log("No more items to process on this page.");
        goToNextPage();
    }
}

// Helper function to close the popup and retry the same item
function closePopupAndRetry(index) {
    // Close the popup (e.g., by simulating an "Escape" key press)
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    console.log("Popup closed. Retrying item...");

    // Wait briefly before retrying
    setTimeout(() => {
        processItem(index);
    }, 1000); // Adjust delay as needed
}

// Helper function to go to the next page
function goToNextPage() {
    let nextPageButton = document.querySelector("a[aria-label='Go to next page']");
    if (nextPageButton) {
        nextPageButton.click();
        console.log("Navigated to next page.");

        // Wait 10 seconds for the new page to load, then restart processing
        setTimeout(() => {
            processItem(0); // Start from the first item on the new page
        }, 10000); // Wait 10 seconds before starting the next page
    } else {
        console.log("No next page button found. Processing complete.");
    }
}

// Start processing the first item
processItem();

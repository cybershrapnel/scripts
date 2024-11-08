function processItem(index = 0) {
    // Select the first 20 menu buttons for each item on the page
    let menuButtons = Array.from(document.querySelectorAll("button[aria-label='Open track actions']")).slice(0, 20);

    if (menuButtons[index]) {
        menuButtons[index].click();
        console.log(`Menu button clicked for item ${index + 1}.`);

        setTimeout(() => {
            let editDetailsButton = [...document.querySelectorAll("li")].find(li => li.textContent.includes("Edit"));
            if (editDetailsButton) {
                editDetailsButton.click();
                console.log("Edit details button clicked.");

                setTimeout(() => {
                    let advancedSettingsButton = [...document.querySelectorAll("button")].find(button => button.textContent.includes("Advanced settings"));
                    if (advancedSettingsButton) {
                        advancedSettingsButton.click();
                        console.log("Advanced settings tab clicked.");

                        setTimeout(() => {
                            let svgIcons = [...document.querySelectorAll("svg")].filter(svg => 
                                svg.getAttribute("height") === "24" &&
                                svg.getAttribute("width") === "24" &&
                                svg.getAttribute("viewBox") === "0 0 24 24" &&
                                svg.querySelector("path") &&
                                svg.querySelector("path").getAttribute("d") === "m10 3.94 7.53 7.53a.75.75 0 0 1 0 1.06L10 20.06 8.94 19l7-7-7-7L10 3.94Z" &&
                                svg.querySelector("path").getAttribute("transform") === "rotate(90, 12, 12)"
                            );

                            if (svgIcons && svgIcons.length > 1) {
                                svgIcons[1].parentElement.click();
                                console.log("Permissions section expanded.");

                                setTimeout(() => {
                                    let checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
                                    checkboxes.forEach((checkbox) => {
                                        if (!checkbox.hasAttribute("data-indeterminate") && !checkbox.hasAttribute("name")) {
                                            if (!checkbox.checked) {
                                                checkbox.click();
                                                console.log("Checkbox set to true.");
                                            }
                                        }
                                    });

                                    let explicitCheckbox = document.querySelector("input[type='checkbox'][name='explicit']");
                                    if (explicitCheckbox && explicitCheckbox.checked) {
                                        explicitCheckbox.click();
                                        console.log("Explicit checkbox unchecked.");
                                    }

                                    // Try to save changes
                                    saveChangesOrRetry(index);

                                }, 1000);
                            } else {
                                console.error("Permissions SVG icon not found. Moving to next item.");
                                moveToNextItem(index); // Move to the next item
                            }
                        }, 1000);
                    } else {
                        console.error("Advanced settings button not found.");
                    }
                }, 1000);
            } else {
                console.log(`Skipping item ${index + 1}: No "Edit details" button found (likely removed).`);
                setTimeout(() => {
                    processItem(index + 1);
                }, 500);
            }
        }, 1000);
    } else {
        console.log("No more items to process on this page.");
        goToNextPage();
    }
}

// Function to try saving changes or skip if disabled
function saveChangesOrRetry(index) {
    let saveButton = document.querySelector("button.Button_Primary__GHMis");

    if (saveButton && !saveButton.disabled) {
        saveButton.click();
        console.log("Save changes button clicked.");

        // Wait for save to complete, then proceed to the next item
        setTimeout(() => {
            confirmAndClose(index);
        }, 3000); // Wait 3 seconds to allow save to complete
    } else if (saveButton && saveButton.disabled) {
        console.log("Save button is disabled. Rechecking after delay to confirm.");

        // Wait a moment and recheck to confirm if button is still disabled
        setTimeout(() => {
            if (saveButton.disabled) {
                console.log("Save button confirmed as permanently disabled, closing without saving.");
                confirmAndClose(index);
            } else {
                console.log("Save button is now active, attempting to save.");
                saveButton.click();

                setTimeout(() => {
                    confirmAndClose(index);
                }, 3000); // Wait 3 seconds to ensure save completes
            }
        }, 2000); // Wait 2 seconds before rechecking disabled state
    } else {
        console.error("Save changes button not found.");
    }
}

// Function to confirm any "unsaved changes" modal and close open tabs if necessary
function confirmAndClose(index) {
    let unsavedModal = document.querySelector("div[role='presentation'].MuiModal-root");
    if (unsavedModal) {
        let quitButton = unsavedModal.querySelector("button.MuiButton-containedError");
        if (quitButton) {
            quitButton.click();
            console.log("Unsaved changes modal found and dismissed.");
        }
    }

    let closeButton = document.querySelector("button[aria-label='Navigation Close Button']");
    for (let i = 0; i < 3; i++) {
        if (closeButton) {
            closeButton.click();
            console.log("Close button clicked to ensure all tabs are closed.");
        }
    }

    setTimeout(() => {
        processItem(index + 1);
    }, 1000); // Wait briefly before moving to the next item
}

// Helper function to go to the next page
function goToNextPage() {
    let nextPageButton = document.querySelector("a[aria-label='Go to next page']");
    if (nextPageButton) {
        nextPageButton.click();
        console.log("Navigated to next page.");

        setTimeout(() => {
            processItem(0); // Start from the first item on the new page
        }, 10000);
    } else {
        console.log("No next page button found. Processing complete.");
    }
}

// Start processing the first item
processItem();

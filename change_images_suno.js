//this will open the edit playlist details tab, leave it open and then press z to move on to the next song.
//this will start at the index specified at the end of file, and brings you all the way to the point where you just click the button and pick and image. saves a lot of time
//scroll your playlist down as far as you want the script to goto before running from console.
function downloadAllAudio() {
    const maxItems = 200;

    // Function to click the "Audio" button in the menu
    function clickAudioButton(menuItems) {
        menuItems.forEach((item) => {
            if (item.textContent.trim() === "Edit Details") {
                item.click();

                // Click the "Add New Image" button after opening "Edit Details"
                setTimeout(() => {
                    const addNewImageButton = document.querySelector('button.chakra-button.css-45aimc');
                    if (addNewImageButton) {
                        addNewImageButton.click();
                        console.log("Clicked 'Add New Image' button.");
                    } else {
                        console.log("Add New Image button not found");
                    }
                }, 1000);
            }
        });
    }

    // Function to handle each item on the current page
    function handleItem(index) {
        const moreActionsButtons = document.querySelectorAll('button[aria-label="More Actions"]');

        if (index < moreActionsButtons.length && index < maxItems) {
            moreActionsButtons[index].click();
            setTimeout(() => {
                const menuItems = document.querySelectorAll('button[role="menuitem"]');
                if (menuItems.length > 0) {
                    clickAudioButton(menuItems);

                    // Wait for 'Z' key press before moving to the next item
                    waitForZKeyPress(() => handleItem(index + 1));
                } else {
                    console.log("Menu items not found");
                }
            }, 1000);
        } else if (index >= maxItems || index >= moreActionsButtons.length) {
            console.log(`Finished processing ${Math.min(maxItems, moreActionsButtons.length - 1)} items on this page.`);
            waitForZKeyPress(checkForNextPage);
        }
    }

    // Function to check and click the "Next Page" button
    function checkForNextPage() {
        const nextPageButton = document.querySelector('button svg path[d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"]');
        
        if (nextPageButton && !nextPageButton.closest('button').disabled) {
            nextPageButton.closest('button').click();
            setTimeout(() => {
                handleItem(0);
            }, 2000);
        } else {
            console.log("No more pages to process");
        }
    }

    // Function to wait for the 'Z' key to be pressed
    function waitForZKeyPress(callback) {
        console.log("Waiting for 'Z' key press to continue...");
        
        // Creating a promise that resolves when 'Z' key is pressed
        function waitForKeyPress() {
            return new Promise((resolve) => {
                document.addEventListener("keydown", function onKeyPress(event) {
                    if (event.key === 'z' || event.key === 'Z') {
                        console.log("'Z' key pressed. Proceeding...");
                        document.removeEventListener("keydown", onKeyPress);
                        resolve();
                    }
                });
            });
        }

        // Using the promise to wait for the key press
        waitForKeyPress().then(callback);
    }

    // Start handling items from the specified starting point
    handleItem(81);
}

// Call the function to download 20 audio items per page and handle paging
downloadAllAudio();

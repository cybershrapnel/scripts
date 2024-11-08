//this script will walk through all pages of your SUNO library and download all 20 songs on each page until the end. THis script will only work for free account.
//paid accts need to use the other script with the link modified to grab the MP3 our WAV. The links are titled different on free accts.

function downloadAllAudio() {
    // Limit the number of items to process per page to 20, starting from the second item
    const maxItems = 20;

    // Function to click the "Audio" button in the menu
    function clickAudioButton(menuItems) {
        menuItems.forEach((item) => {
            if (item.textContent.trim() === "WAV Audio") {
                item.click();
            }
        });
    }

    // Function to handle each item on the current page
    function handleItem(index) {
        const moreActionsButtons = document.querySelectorAll('button[aria-label="More Actions"]');

        if (index < moreActionsButtons.length && index < maxItems) {
            // Click the current "More Actions" button
            moreActionsButtons[index].click();
            // Wait for the menu to open
            setTimeout(() => {
                const menuItems = document.querySelectorAll('button[role="menuitem"]');
                if (menuItems.length > 0) {
                    clickAudioButton(menuItems);
                    // Move to the next item after a delay
                    setTimeout(() => {
                        handleItem(index + 1);
                    }, 35000); // Adjust the timeout duration as needed
                } else {
                    console.log("Menu items not found");
                }
            }, 1000); // Adjust the timeout duration as needed
        } else if (index >= maxItems || index >= moreActionsButtons.length) {
            console.log(`Finished processing ${Math.min(maxItems, moreActionsButtons.length - 1)} items on this page.`);
            checkForNextPage();
        }
    }

    // Function to check and click the "Next Page" button
    function checkForNextPage() {
        const nextPageButton = document.querySelector('button svg path[d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"]');
        
        if (nextPageButton && !nextPageButton.closest('button').disabled) {
            nextPageButton.closest('button').click();
            // Wait for the next page to load
            setTimeout(() => {
                // Start processing items on the next page, skipping the first one
                handleItem(0); // Start from the second item on the next page
            }, 200000); // Wait for 2 seconds for the next page to load
        } else {
            console.log("No more pages to process");
        }
    }

    // Start handling items from the second one on the first page
    handleItem(0);
}

// Call the function to download 20 audio items per page and handle paging
downloadAllAudio();

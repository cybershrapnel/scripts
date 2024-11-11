(function() {
    let lastSongTitle = ""; // Stores the last found song title
    const processedTitles = new Set(); // To track already processed song titles
    const downloadFolderPath = 'C:\\Users\\shrap\\Downloads\\'; // Set your downloads folder path

    // Function to find the last occurrence of the phrase and get the song title
    function getLastSongTitle() {
        const pageText = document.body.innerText;
        const searchPhrase = "song you are currently listening to is called";
        const index = pageText.lastIndexOf(searchPhrase);
        
        if (index !== -1) {
            const titleStart = index + searchPhrase.length;
            const titleEnd = pageText.indexOf("\n", titleStart);
            lastSongTitle = pageText.slice(titleStart, titleEnd).trim();
            console.log("Found song title:", lastSongTitle);
        } else {
            console.log("Phrase not found on page.");
        }
    }

    // Function to locate and click the closest "Copy" button before the last instance of the phrase
    async function clickButtonBeforeText() {
        // Check if the song title has already been processed
        if (processedTitles.has(lastSongTitle)) {
            console.log("Song title has already been processed:", lastSongTitle);
            return; // Exit if already processed
        }

        // Find all elements that contain the phrase text
        const elementsWithPhrase = Array.from(document.querySelectorAll('*')).filter(el =>
            el.textContent.includes("song you are currently listening to is called")
        );

        if (elementsWithPhrase.length > 0) {
            // Select the last occurrence of the phrase
            const lastPhraseElement = elementsWithPhrase[elementsWithPhrase.length - 1];

            // Collect all 'Copy' buttons
            let buttons = Array.from(document.querySelectorAll("button[aria-label='Copy'][data-testid='copy-turn-action-button']"));
            
            // Find the last 'Copy' button that appears before the phrase in the DOM order
            const precedingButtons = buttons.filter(button => button.compareDocumentPosition(lastPhraseElement) & Node.DOCUMENT_POSITION_PRECEDING);

            if (precedingButtons.length > 0) {
                console.log("Clicking the closest 'Copy' button preceding the phrase...");
                precedingButtons[precedingButtons.length - 1].click(); // Click the last preceding button

                // Add the song title to the set of processed titles
                processedTitles.add(lastSongTitle);

                // Wait for 1 second before checking the clipboard
                setTimeout(saveClipboardContent, 1000); 
            } else {
                console.log("Could not locate a preceding 'Copy' button.");
            }
        }
    }

    // Function to save clipboard content as a .txt file in the downloads folder
    async function saveClipboardContent() {
        try {
            let clipboardText = await navigator.clipboard.readText();
            if (!clipboardText) {
                console.log("Clipboard is empty or failed to retrieve content.");
                return;
            }

            // Remove any asterisks from the clipboard content
            clipboardText = clipboardText.replace(/\*/g, "");

            // Append "N_" to the song title and sanitize it
            const sanitizedTitle = "N_" + lastSongTitle.replace(/[<>:"\/\\|?*\x00-\x1F]/g, "");
            const fileName = `${sanitizedTitle}.txt`; // Use only the song title as the filename
            const blob = new Blob([clipboardText], { type: 'text/plain' });
            const fileURL = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = fileURL;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(fileURL);
            console.log("Saved clipboard content to:", fileName);
        } catch (error) {
            console.error("Failed to save clipboard content:", error);
        }
    }

    // Function to monitor for new instances of the search phrase and act on it
    function checkPage() {
        getLastSongTitle();
        if (lastSongTitle) {
            clickButtonBeforeText();
        }
    }

    // Set an interval to regularly check for updates
    setInterval(checkPage, 5000); // Adjust interval as needed
})();

(function() {
    const serverUrl = 'http://127.0.0.1:8421';  // FastAPI server URL
    let lastPlayedSong = null; // To avoid duplicate sends for the same song
    const delayBeforeCopy = 5000; // Delay in milliseconds to ensure the correct image loads

    // Function to apply CSS changes to #playSongPopup and #closePopupButton
    function applyCustomStyles() {
        // Apply styles to #playSongPopup
        const playSongPopup = document.getElementById('playSongPopup');
        if (playSongPopup) {
            playSongPopup.style.display = 'block';
            playSongPopup.style.position = 'fixed';
            playSongPopup.style.top = '65%';
            playSongPopup.style.left = '70%';
            playSongPopup.style.transform = 'translate(-50%, -50%)';
            playSongPopup.style.backgroundColor = 'transparent';
            playSongPopup.style.padding = '0px';
            playSongPopup.style.borderRadius = '8px';
            playSongPopup.style.boxShadow = 'rgba(0, 0, 0, 0.5) 0px 0px 10px';
            playSongPopup.style.textAlign = 'center';
            playSongPopup.style.zIndex = '10000';
            playSongPopup.style.width = '80%';
            playSongPopup.style.maxWidth = '600px';
        }

        // Apply styles to #closePopupButton
        const closePopupButton = document.getElementById('closePopupButton');
        if (closePopupButton) {
            closePopupButton.style.position = 'absolute';
            closePopupButton.style.top = '10px';
            closePopupButton.style.right = '10px';
            closePopupButton.style.cursor = 'pointer';
            closePopupButton.style.fontSize = '24px';
            closePopupButton.style.background = 'none';
            closePopupButton.style.border = 'none';
            closePopupButton.style.color = 'white';
            closePopupButton.style.zIndex = '0';
        }
    }

    // Apply styles once initially
    applyCustomStyles();

    // Monitor audio element for playback start
    const audio = document.getElementById('audio');
    if (!audio) {
        console.error('Audio element not found.');
        return;
    }

    audio.addEventListener('play', () => {
        applyCustomStyles(); // Reapply styles to ensure they're set when playback starts

        // Identify the highlighted song
        const selectedSong = document.querySelector('#songList .selected');
        if (selectedSong) {
            const songName = selectedSong.textContent.trim();
            console.log('Now Playing:', songName);

            if (songName !== lastPlayedSong) {  // Avoid sending duplicates
                lastPlayedSong = songName;

                // Send song name to FastAPI server
                fetch(`${serverUrl}/current_song`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ songName: songName })
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Song name sent successfully:', songName);
                    } else {
                        console.error('Failed to send song name:', response.statusText);
                    }
                })
                .catch(error => console.error('Error:', error));

                // Wait 5 seconds before copying the image
                setTimeout(async () => {
                    // Copy the popup image to the clipboard
                    const popupImage = document.getElementById('popupImage');
                    
                    // Check if the image has loaded by verifying its source
                    if (popupImage && popupImage.complete && popupImage.src) {
                        try {
                            const imgResponse = await fetch(popupImage.src);
                            const imgBlob = await imgResponse.blob();
                            const clipboardItem = new ClipboardItem({ 'image/png': imgBlob });
                            await navigator.clipboard.write([clipboardItem]);
                            console.log('Popup image copied to clipboard.');
                        } catch (error) {
                            console.error('Failed to copy popup image:', error);
                        }
                    } else {
                        console.error('Popup image not found or not fully loaded.');
                    }
                }, delayBeforeCopy);  // Delay before copying
            }
        } else {
            console.error('No song is highlighted as currently playing.');
        }
    });
})();

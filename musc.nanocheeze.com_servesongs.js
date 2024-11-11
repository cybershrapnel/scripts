(function() {
    const serverUrl = 'http://127.0.0.1:8421';  // FastAPI server URL
    let lastPlayedSong = null; // To avoid duplicate sends for the same song
    const delayBeforeCopy = 5000; // Delay in milliseconds to ensure the correct image loads

    // Monitor audio element for playback start
    const audio = document.getElementById('audio');
    if (!audio) {
        console.error('Audio element not found.');
        return;
    }

    audio.addEventListener('play', () => {
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

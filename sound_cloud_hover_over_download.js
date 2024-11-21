//run this script from browser console on an artists tracks page.
//before running I suggest hovering over any items real quick on the right panel and the song listed in the media player.
//if you don't they can accidentally get triggered during the script and the wrong song may get applied to a title.
//Also scroll down as far as you want the script to download to prior to running the script
//This will walk through every enabled play button and download the mp3 even if downloads are disabled for the track.
//This script is for educational purposes and to serve as my resume for SoundCloud so they know I actually understand their backend
//And this was all done with the help of AI and a few hours and no knowledge of how the system works.
//Soundcloud breaks up every song into ~9 second long mp3s that it servers the user via an authorized chunking system served via a M3U file that acts as a playlist for the chunks to be streamed together
//This script utilizes the authorization granted by your browser hovering over the link and then downloads the m3u as a blob
//it then downloads the blob with the proper artist name and song
//Do not abuse this. I will be deleting this. Nobody looks at my scripts anyways so I doubt anyone will ever try it or use it.
//Again this is to serve as my resume withj Soundcloud.

// Track the last detected M3U URL
let lastSeenM3U = null;

// Track the current playing song and processed songs
let currentPlayingSong = null;
const processedSongs = new Set(); // To track downloaded songs

// Function to monitor the currently playing song
function updateCurrentPlayingSong() {
    const { songName, artist } = getCurrentSongMetadata();

    if (!songName || !artist) {
        console.log("No song is currently playing or metadata unavailable.");
        return;
    }

    const newPlayingSong = `${artist} - ${songName}`;

    if (newPlayingSong !== currentPlayingSong) {
        currentPlayingSong = newPlayingSong;

        if (processedSongs.has(newPlayingSong)) {
            console.log(`Song "${newPlayingSong}" already processed. Skipping.`);
            return;
        }

        console.log(`Now playing: "${songName}" by "${artist}"`);

        // If there's a detected M3U, process it for this song
        if (lastSeenM3U) {
            console.log(`Using last detected M3U URL: ${lastSeenM3U} for "${currentPlayingSong}"`);
            processedSongs.add(newPlayingSong); // Mark the song as processed
            processAndDownloadSong(lastSeenM3U, songName, artist);
        } else {
            console.warn("No M3U URL available for the current song.");
        }
    }
}

// Function to get the current song metadata
function getCurrentSongMetadata() {
    const pageTitle = document.title || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    let songName = '';
    let artist = '';

    if (pageTitle.includes(' by ')) {
        const [song, artistText] = pageTitle.split(' by ');
        songName = song.trim();
        artist = artistText.trim();
    } else if (metaDescription.includes(' by ')) {
        const [song, artistText] = metaDescription.split(' by ');
        songName = song.trim();
        artist = artistText.trim();
    }

    return { songName, artist };
}

// Intercept fetch API requests to detect M3U URLs
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    const url = args[0];

    if (typeof url === "string" && (url.includes(".m3u") || url.includes(".m3u8"))) {
        console.log(`Detected M3U URL via fetch: ${url}`);
        lastSeenM3U = url; // Save the last detected M3U URL
    }

    return originalFetch.apply(this, args);
};

// Intercept XMLHttpRequest requests to detect M3U URLs
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (method.toUpperCase() === "GET" && (url.includes(".m3u") || url.includes(".m3u8"))) {
        console.log(`Detected M3U URL via XMLHttpRequest: ${url}`);
        lastSeenM3U = url; // Save the last detected M3U URL
    }
    return originalOpen.apply(this, [method, url, ...rest]);
};

// Function to process and download the current song
async function processAndDownloadSong(m3uUrl, songName, artist) {
    const filename = `${artist} - ${songName}.mp3`;

    try {
        console.log(`Processing song: "${songName}" by "${artist}" using M3U URL: ${m3uUrl}`);
        const songBlob = await processM3U(m3uUrl);
        downloadBlob(songBlob, filename);
        console.log(`Successfully downloaded: ${filename}`);
    } catch (error) {
        console.error(`Error processing and downloading the song "${songName}" by "${artist}":`, error);
    }
}

// Function to process the M3U URL and return the blob
async function processM3U(m3uUrl) {
    try {
        console.log(`Fetching M3U URL: ${m3uUrl}`);

        // Fetch the M3U file
        const m3uResponse = await fetch(m3uUrl);
        if (!m3uResponse.ok) {
            throw new Error(`Failed to fetch M3U: ${m3uResponse.status}`);
        }

        const m3uText = await m3uResponse.text();
        const chunkUrls = m3uText.split('\n').filter(line => line && !line.startsWith('#'));

        console.log(`Found ${chunkUrls.length} chunk URLs in M3U.`);
        console.log("Chunk URLs:", chunkUrls);

        // Fetch each chunk and combine into a single blob
        const blobs = await Promise.all(chunkUrls.map(async (url) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch chunk: ${url} - ${response.status}`);
            }
            return await response.blob();
        }));

        return new Blob(blobs, { type: 'audio/mp3' });
    } catch (error) {
        console.error(`Error processing M3U: ${error.message}`);
        throw error;
    }
}

// Utility to download a blob
function downloadBlob(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Download triggered for: ${filename}`);
}

// Periodically check for the currently playing song
setInterval(updateCurrentPlayingSong, 300);

console.log("Script initialized. Hover over playlists to detect M3U URLs and ensure a song is playing.");


(function hoverAndClickPlayButtons() {
    // Get all play button containers, skipping disabled ones
    const playButtons = Array.from(document.querySelectorAll('.soundTitle__playButton a.sc-button-play'))
        .filter((button) => !button.classList.contains('sc-button-disabled')); // Skip disabled buttons

    if (playButtons.length === 0) {
        console.log("No enabled play buttons found on the page.");
        return;
    }

    console.log(`Found ${playButtons.length} enabled play buttons. Starting hover and click simulation.`);

    // Get the "next" button
    const nextButton = document.querySelector('.playControls__next');
    if (!nextButton) {
        console.error("Next button not found on the page.");
        return;
    }

    // Initialize play button counter
    let remainingButtons = playButtons.length;

    // Function to hover over a button and perform actions
    async function hoverAndClick(button, index) {
        console.log(`Simulating hover on button ${index + 1}/${playButtons.length}. Remaining: ${remainingButtons}`);

        // Simulate hover event
        const hoverEvent = new Event('mouseover', { bubbles: true });
        button.dispatchEvent(hoverEvent);

        // Wait for 1 second before the next action
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (index === 0) {
            // First button: Click the play button itself
            console.log(`Clicking the first play button: ${index + 1}/${playButtons.length}`);
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            button.dispatchEvent(clickEvent);
        } else {
            // Subsequent buttons: Click the "next" button
            console.log(`Clicking the next button for button ${index + 1}/${playButtons.length}.`);
            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            nextButton.dispatchEvent(clickEvent);
        }

        // Decrement the counter and stop when no buttons remain
        remainingButtons -= 1;
        if (remainingButtons === 0) {
            console.log("All play buttons have been processed.");
        }
    }

    // Iterate over all play buttons and simulate actions
    playButtons.forEach((button, index) => {
        setTimeout(() => hoverAndClick(button, index), index * 2000); // Space out each interaction by 2 seconds
    });
})();

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
setInterval(updateCurrentPlayingSong, 1000);

console.log("Script initialized. Hover over playlists to detect M3U URLs and ensure a song is playing.");

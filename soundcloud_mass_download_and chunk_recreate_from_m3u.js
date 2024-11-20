// Track processed URLs to avoid duplicates
const processedUrls = new Set();

// Queue for URLs to process
const urlQueue = [];

// Throttle control (5 seconds delay)
const THROTTLE_DELAY = 5000;
let isProcessing = false;

// Function to process the next URL in the queue
async function processNextUrl() {
    if (isProcessing || urlQueue.length === 0) {
        return; // Either already processing or no URLs in the queue
    }

    isProcessing = true;
    const m3uUrl = urlQueue.shift(); // Get the next URL from the queue

    try {
        console.log(`Processing URL: ${m3uUrl}`);
        await processM3U(m3uUrl); // Process the M3U file
    } catch (error) {
        console.error(`Error processing URL: ${m3uUrl}`, error);
    } finally {
        isProcessing = false;
        // Schedule the next download after the delay
        setTimeout(processNextUrl, THROTTLE_DELAY);
    }
}

// Intercept fetch API requests
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    const url = args[0];
    if (typeof url === "string" && (url.includes(".m3u") || url.includes(".m3u8"))) {
        if (!processedUrls.has(url)) {
            console.log("Intercepted fetch GET request:", url);
            processedUrls.add(url); // Mark URL as processed
            urlQueue.push(url); // Add to queue
            processNextUrl(); // Start processing
        } else {
            console.log("Duplicate M3U URL skipped:", url);
        }
    }
    return originalFetch.apply(this, args);
};

// Intercept XMLHttpRequest requests
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (method.toUpperCase() === "GET" && (url.includes(".m3u") || url.includes(".m3u8"))) {
        if (!processedUrls.has(url)) {
            console.log("Intercepted XMLHttpRequest GET request:", url);
            processedUrls.add(url); // Mark URL as processed
            urlQueue.push(url); // Add to queue
            processNextUrl(); // Start processing
        } else {
            console.log("Duplicate M3U URL skipped:", url);
        }
    }
    return originalOpen.apply(this, [method, url, ...rest]);
};

console.log("Network request monitoring initialized.");

// Function to fetch, process, and combine MP3 chunks from an M3U playlist
async function processM3U(m3uUrl) {
    try {
        console.log("Processing M3U URL:", m3uUrl);

        // Fetch the M3U file
        const m3uResponse = await fetch(m3uUrl);
        if (!m3uResponse.ok) {
            throw new Error(`Failed to fetch M3U file: ${m3uResponse.status}`);
        }
        const m3uText = await m3uResponse.text();

        // Parse the M3U file for chunk URLs
        const chunkUrls = m3uText
            .split('\n')
            .filter(line => line && !line.startsWith('#')); // Filter out metadata and comments

        console.log("Chunk URLs found:", chunkUrls);

        // Download each chunk as a blob
        const blobs = await Promise.all(chunkUrls.map(async (url) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch chunk: ${response.status}`);
            }
            return await response.blob();
        }));

        // Combine blobs into one
        const combinedBlob = new Blob(blobs, { type: 'audio/mp3' });

        // Download the combined MP3
        downloadBlob(combinedBlob, "combined.mp3");
        console.log("MP3 file downloaded!");
    } catch (error) {
        console.error("Error processing M3U:", error);
    }
}

// Utility function to download a blob as a file
function downloadBlob(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

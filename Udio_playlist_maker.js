// Initialize an array to store song data
let songDataList = [];

// Function to extract information from the media player
function extractMediaInfo() {
    try {
        const mediaPlayer = document.querySelector("div.sticky.bottom-0.left-0"); // Generalized selector
        if (!mediaPlayer) return;

        const songTitle = mediaPlayer.querySelector("h1")?.textContent?.trim() || "Unknown Title";
        const artist = mediaPlayer.querySelector("p")?.textContent?.trim() || "Unknown Artist";
        const audioSrc = mediaPlayer.querySelector("audio")?.getAttribute("src") || "Unknown URL";
        const songImage = mediaPlayer.querySelector("img")?.getAttribute("src") || "Unknown Image";

        return {
            title: songTitle,
            uuid: audioSrc,
            author: artist,
            user: artist, // Using artist as user
            image: songImage,
            profile: "https://cdn1.suno.ai/default-profile.webp" // Placeholder profile image
        };
    } catch (error) {
        console.error("Error extracting media info:", error);
        return null;
    }
}

// Function to handle mutations in the media player
function handleMediaChanges(mutationsList) {
    mutationsList.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
            const songInfo = extractMediaInfo();
            if (songInfo) {
                // Avoid duplicates in the data list
                if (!songDataList.some((item) => item.uuid === songInfo.uuid)) {
                    songDataList.push(songInfo);
                    console.log("Media info updated:", songInfo);
                }
            }
        }
    });
}

// Save the playlist to a JSON file
function savePlaylistToFile() {
    if (songDataList.length === 0) {
        console.warn("No songs captured to save.");
        return;
    }

    const date = new Date();
    const timestamp = date.toISOString().replace(/[-:T]/g, "").split(".")[0]; // Format as YYYYMMDDHHMMSS
    const fileName = `Udio_Playlist_${timestamp}.json`;

    const blob = new Blob([JSON.stringify(songDataList, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url); // Clean up the URL object
    console.log(`Playlist saved as ${fileName}`);
}

// Set up MutationObserver to monitor changes to the media player
const mediaPlayer = document.querySelector("div.sticky.bottom-0.left-0"); // Generalized selector
if (mediaPlayer) {
    const observer = new MutationObserver(handleMediaChanges);
    observer.observe(mediaPlayer, {
        childList: true, // Watch for child nodes being added/removed
        attributes: true, // Watch for attribute changes
        subtree: true, // Monitor all descendants
    });

    console.log("Media player monitoring started...");
} else {
    console.warn("Media player not found. Check the selector.");
}

// Listen for the 'z' key to save the file and output the playlist
document.addEventListener("keydown", (event) => {
    if (event.key === "z" || event.key === "Z") {
        console.log("Captured Song Data List:", JSON.stringify(songDataList, null, 2));
        savePlaylistToFile();
    }
});

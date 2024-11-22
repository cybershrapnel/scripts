// Set to track unique UUIDs to avoid duplicates
const seenUUIDs = new Set();
const songList = [];

// Function to add a song to the list if it's not already present
function addSong({ title, uuid, author, user, image, profile }) {
    if (!seenUUIDs.has(uuid)) {
        seenUUIDs.add(uuid);
        songList.push({ title, uuid, author, user, image, profile });
    }
}

// Function to scan the DOM and collect songs
function scanDOM() {
    // First method: Collect all song elements with a specific structure
    const songsMethod1 = document.querySelectorAll('a[href^="/song/"]');

    songsMethod1.forEach(song => {
        const title = song.getAttribute('title') || song.textContent.trim();
        const href = song.getAttribute('href');
        const uuidMatch = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

        if (uuidMatch && title && title.trim() !== '' && (uuidMatch[0].match(/-/g) || []).length === 4) {
            const uuid = uuidMatch[0];

            // Locate the container element for the song
            const parent = song.closest('.relative.flex.flex-col'); // Adjust selector to match the structure

            // Find the author element for the author's display name
            const authorElement = parent?.querySelector('span[title]');
            const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

            if (authorName === 'Unknown Author') return; // Skip songs with 'Unknown Author'

            // Find the author's link to extract the username
            const authorLinkElement = parent?.querySelector('a[href^="/@"]');
            const authorLink = authorLinkElement?.getAttribute('href') || '';
            const usernameMatch = authorLink.match(/@([\w\d-]+)/);
            const username = usernameMatch ? usernameMatch[1] : '';

            // Find the image element and extract its path
            const imageElement = parent?.querySelector('img');
            const imagePath = imageElement?.getAttribute('src') || '';

            // Locate and extract the first .webp file for the user's profile picture
            const webpElement = parent?.querySelector('img[src$=".webp"]');
            const profilePic = webpElement ? webpElement.getAttribute('src') : '';

            // Add the song to the list
            addSong({ title, uuid, author: authorName, user: username, image: imagePath, profile: profilePic });
        }
    });

    // Second method: Collect songs from another structure
    const songsMethod2 = document.querySelectorAll('a[href^="/song/"]');

    songsMethod2.forEach(song => {
        const title = song.getAttribute('title') || song.textContent.trim();
        const href = song.getAttribute('href');
        const uuidMatch = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

        if (uuidMatch && title && title.trim() !== '' && (uuidMatch[0].match(/-/g) || []).length === 4) {
            const uuid = uuidMatch[0];

            // Locate the parent container for the song
            const parent = song.closest('div[data-testid="song-row"]');

            // Extract the author name
            const authorElement = parent?.querySelector('div.line-clamp-1 a[href^="/@"]');
            const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

            if (!authorName || authorName.toLowerCase().includes('unknown')) return; // Skip 'Unknown Author'

            // Extract the username
            const authorLink = authorElement?.getAttribute('href') || '';
            const usernameMatch = authorLink.match(/@([\w\d-]+)/);
            const username = usernameMatch ? usernameMatch[1] : '';

            // Extract the image URL
            const imageElement = parent?.querySelector('img[alt="Song Image"]');
            const imagePath = imageElement?.getAttribute('src') || '';

            // Locate and extract the first .webp file for the user's profile picture
            const webpElement = parent?.querySelector('img[src$=".webp"]');
            const profilePic = webpElement ? webpElement.getAttribute('src') : '';

            // Add the song to the list
            addSong({ title, uuid, author: authorName, user: username, image: imagePath, profile: profilePic });
        }
    });
}

// Function to save the JSON file
function saveJSON() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `songs-${timestamp}.json`;
    const fileContent = JSON.stringify(songList, null, 2);

    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Saved JSON as ${fileName}`);
}

// Event listener for the "z" key to output the results
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'z') {
        console.clear();
        console.log('Current Song List:', songList);
        console.table(songList);
    }
});

// Continuously scan the DOM every 5 seconds
setInterval(scanDOM, 5000);

// Automatically save JSON every 5 minutes
setInterval(saveJSON, 300000); // 300,000 ms = 5 minutes

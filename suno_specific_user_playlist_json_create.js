// Collect all song elements with a specific structure
const songs = document.querySelectorAll('a[href^="/song/"]');

const songList = [];

songs.forEach(song => {
    const title = song.getAttribute('title') || song.textContent.trim();
    const href = song.getAttribute('href');
    const uuidMatch = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

    // Check for valid title and UUID
    if (uuidMatch && title && title.trim() !== '' && (uuidMatch[0].match(/-/g) || []).length === 4) {
        const uuid = uuidMatch[0];

        // Locate the parent container for the song
        const parent = song.closest('div[data-testid="song-row"]'); // Refined selector based on provided structure

        // Extract the author name
        const authorElement = parent?.querySelector('div.line-clamp-1 a[href^="/@"]');
        const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

        // Extract the username
        const authorLink = authorElement?.getAttribute('href') || '';
        const usernameMatch = authorLink.match(/@([\w\d-]+)/); // Extract username from the @ link
        const username = usernameMatch ? usernameMatch[1] : '';

        // Extract the image URL
        const imageElement = parent?.querySelector('img[alt="Song Image"]');
        const imagePath = imageElement?.getAttribute('src') || '';

        // Only add the song to the list if the username matches "cybershrapnel"
        if (username.toLowerCase() === 'cybershrapnel') {
            songList.push({
                title,
                uuid,
                author: authorName,
                user: username,
                image: imagePath,
            });
        }
    }
});

// Output the results
console.clear();
console.log('Extracted Song Data for user "cybershrapnel":', songList);
console.table(songList); // Tabular view for better readability

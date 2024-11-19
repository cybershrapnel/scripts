// Collect all song elements with a specific structure
const songs = document.querySelectorAll('a[href^="/song/"]');

const songList = [];

songs.forEach(song => {
    const title = song.getAttribute('title') || song.textContent.trim();
    const href = song.getAttribute('href');
    const uuidMatch = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

    // Check for valid title and UUID with 4 dashes
    if (uuidMatch && title && title.trim() !== '' && (uuidMatch[0].match(/-/g) || []).length === 4) {
        const uuid = uuidMatch[0];

        // Locate the container element for the song
        const parent = song.closest('.relative.flex.flex-col'); // Adjust selector to match the structure

        // Find the author element
        const authorElement = parent?.querySelector('span[title]'); // Adjust to target the author span
        const author = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

        songList.push({ title, uuid, author });
    }
});

// Output the results
console.clear();
console.log('Title - UUID - Author');
songList.forEach(({ title, uuid, author }) => {
    console.log(`${title} - ${uuid} - ${author}`);
});

// If needed, log the raw array
console.log(songList);

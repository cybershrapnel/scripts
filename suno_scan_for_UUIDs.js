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

        // Find the author element for the author's display name
        const authorElement = parent?.querySelector('span[title]'); // Adjust to target the author span
        const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

        // Find the author's link to extract the username
        const authorLinkElement = parent?.querySelector('a[href^="/@"]'); // Adjust to target the author's link
        const authorLink = authorLinkElement?.getAttribute('href') || '';
        const usernameMatch = authorLink.match(/@([\w\d-]+)/); // Extract username from the @ link
        const username = usernameMatch ? usernameMatch[1] : '';

        // Add the song to the list
        songList.push({ title, uuid, author: authorName, user: username });
    }
});

// Output the results
console.clear();
console.log('Title - UUID - Author - Username');
songList.forEach(({ title, uuid, author, user }) => {
    console.log(`${title} - ${uuid} - ${author} - ${user}`);
});

// If needed, log the raw array
console.log(songList);

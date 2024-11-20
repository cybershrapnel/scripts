// Collect all song elements with a specific structure
const songs = document.querySelectorAll('a[href^="/song/"]');

const songList = [];
const seenUUIDs = new Set(); // Track unique UUIDs to avoid duplicates

songs.forEach(song => {
    const title = song.getAttribute('title') || song.textContent.trim();
    const href = song.getAttribute('href');
    const uuidMatch = href.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

    // Check for valid title and UUID with 4 dashes
    if (uuidMatch && title && title.trim() !== '' && (uuidMatch[0].match(/-/g) || []).length === 4) {
        const uuid = uuidMatch[0];

        // Skip duplicates based on UUID
        if (seenUUIDs.has(uuid)) {
            return;
        }

        // Locate the container element for the song
        const parent = song.closest('.relative.flex.flex-col'); // Adjust selector to match the structure

        // Find the author element for the author's display name
        const authorElement = parent?.querySelector('span[title]'); // Adjust to target the author span
        const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

        // Skip songs with 'Unknown Author'
        if (authorName === 'Unknown Author') {
            return;
        }

        // Find the author's link to extract the username
        const authorLinkElement = parent?.querySelector('a[href^="/@"]'); // Adjust to target the author's link
        const authorLink = authorLinkElement?.getAttribute('href') || '';
        const usernameMatch = authorLink.match(/@([\w\d-]+)/); // Extract username from the @ link
        const username = usernameMatch ? usernameMatch[1] : '';

        // Find the image element and extract its path
        const imageElement = parent?.querySelector('img'); // Adjust selector to match image location
        const imagePath = imageElement?.getAttribute('src') || '';

        // Locate and extract the first .webp file for the user's profile picture
        const webpElement = parent?.querySelector('img[src$=".webp"]'); // Look for an image with a .webp extension
        const profilePic = webpElement ? webpElement.getAttribute('src') : '';

        // Add the UUID to the seen set and the song to the list
        seenUUIDs.add(uuid);
        songList.push({ title, uuid, author: authorName, user: username, image: imagePath, profile: profilePic });
    }
});

// Output the results
console.clear();
console.log('Title - UUID - Author - Username - Image Path - Profile Pic');
songList.forEach(({ title, uuid, author, user, image, profile }) => {
    console.log(`${title} - ${uuid} - ${author} - ${user} - ${image} - ${profile}`);
});

// If needed, log the raw array
console.log(songList);

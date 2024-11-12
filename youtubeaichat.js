// Function to send a message in the chat input
function sendMessage(message) {
    const inputBox = document.querySelector('div#input[contenteditable=""]');
    if (inputBox) {
        console.log('Input box found.');
        inputBox.innerText = message;
        const inputEvent = new Event('input', {
            bubbles: true,
            cancelable: true,
        });
        inputBox.dispatchEvent(inputEvent);

        setTimeout(() => {
            const sendButton = document.querySelector('div#send-button yt-button-renderer button');
            if (sendButton) {
                console.log('Send button found.');
                sendButton.click();
                console.log('Message sent:', message);
            } else {
                console.error('Send button not found.');
            }
        }, 1000);
    } else {
        console.error('Input box not found.');
    }
}

// Function to split a string into chunks based on max length without splitting words or punctuation
function splitIntoChunks(text, chunkSize) {
    // Replace --- with a double newline marker and split by double newlines to create hard segments
    const segments = text.replace(/---/g, '\n\n').split(/\n\n+/);
    const chunks = [];

    for (const segment of segments) {
        // Replace single line breaks within segments with spaces to avoid splitting chunks on single line breaks
        let cleanedSegment = segment.replace(/\n/g, ' ');

        const words = cleanedSegment.split(' ');
        let currentChunk = '';

        for (const word of words) {
            // Add the word to the current chunk if it fits within the chunk size
            if ((currentChunk + word).length <= chunkSize) {
                currentChunk += (currentChunk ? ' ' : '') + word;
            } else {
                // If the current word doesn't fit, push the current chunk to chunks and start a new chunk
                chunks.push(currentChunk);
                currentChunk = word;
            }
        }
        // Add the last chunk of this segment if there is any remaining text
        if (currentChunk) chunks.push(currentChunk);
    }

    return chunks;
}

// Function to send each chunked message with a delay
async function broadcastChunks(message) {
    const chunks = splitIntoChunks(message, 200); // Adjust chunk size if needed
    for (let i = 0; i < chunks.length; i++) {
        sendMessage(chunks[i]);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between chunks
    }
}

// Function to poll the server for a new message every 5 seconds
async function pollServerForMessage() {
    try {
        const response = await fetch('http://127.0.0.1:8341/get_message');
        const data = await response.json();

        if (data.text) {
            console.log('New message from server:', data.text);
            await broadcastChunks(data.text);  // Send the received message in chunks
        } else {
            console.log('No new message from server');
        }
    } catch (error) {
        console.error('Error polling for message:', error);
    }
    // Poll again after 5 seconds
    setTimeout(pollServerForMessage, 5000);
}

// Start polling for messages
pollServerForMessage();

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

// Function to split a string into chunks based on max length
function splitIntoChunks(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
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

//run in console of browser on grok page
//after 2 downloads page will ask for permission to download multiple files.
//after that it just keeps making images. edit the prompts as you desire.

(function automateInteraction() {
    // Check if error count exists in localStorage, otherwise initialize it to 0
    let errorCount = localStorage.getItem('errorCount') ? parseInt(localStorage.getItem('errorCount')) : 0;
    let lastProcessedImageSrc = null;  // Keep this in the current session

    // Base prompt
    const basePrompt = 'pinup girl with red head long hair pig tails, blue cheerleader skirt, red fishnet leggings, purple cut off sport jersey that says NanoCheeZe, sunglasses, nose ring, belly ring';

    // Lists of extra sentences
    const extraList1 = ['holding a basketball', 'in a park', 'with a playful smile', 'wearing bracelets', 'surrounded by butterflies'];
    const extraList2 = ['standing near a fountain', 'with a backdrop of mountains', 'under a starry sky', 'next to a vintage car', 'holding a bouquet of roses'];
    const extraList3 = ['during sunset', 'with wind-swept hair', 'on a sandy beach', 'amidst falling leaves', 'in a bustling cityscape'];
    const extraList4 = ['in watercolor style', 'with vibrant colors', 'soft focus effect', 'black and white theme', 'with a bokeh background'];
    const extraList5 = ['highly detailed', 'in anime style', 'surreal atmosphere', 'art deco influence', 'cyberpunk elements'];

    const extraLists = [extraList1, extraList2, extraList3, extraList4, extraList5];

    // Function to add extra items to the prompt
    function addStuff(prompt) {
        const numExtras = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
        let addedExtras = [];

        for (let i = 0; i < numExtras; i++) {
            // Randomly select one of the lists
            const listIndex = Math.floor(Math.random() * extraLists.length);
            const selectedList = extraLists[listIndex];
            // Randomly select an item from the list
            const itemIndex = Math.floor(Math.random() * selectedList.length);
            const selectedItem = selectedList[itemIndex];
            // Add the selected item to the array
            addedExtras.push(selectedItem);
        }

        // Append the extra items to the prompt
        return prompt + ', ' + addedExtras.join(', ');
    }

    // Function to set the value natively (works with React and similar frameworks)
    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value').set;
        valueSetter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Function to click the button when it's enabled
    function waitForButtonAndClick(callback) {
        var button = document.querySelector('button[aria-label="Grok something"]');

        if (button) {
            console.log('Button found.');
            if (!button.disabled) {
                button.click();
                console.log('Button clicked!');
                if (callback) callback();
            } else {
                console.log('Button is disabled, waiting...');
                setTimeout(function() {
                    waitForButtonAndClick(callback);
                }, 500);
            }
        } else {
            console.error('Button not found!');
        }
    }

    // Function to process the image at index images.length - 5
    function processImage() {
        console.log('Processing the image at index images.length - 5...');

        const images = document.querySelectorAll('img');

        if (images.length < 5) {
            console.error('Not enough images on the page.');
            setTimeout(() => {
                console.log('Restarting the script due to insufficient images...');
                automateInteraction();
            }, 5000); 
            return;
        }

        const targetImage = images[images.length - 5];

        if (lastProcessedImageSrc === targetImage.src) {
            console.log('Image is the same as the last processed one. Restarting the script...');
            setTimeout(() => {
                automateInteraction();
            }, 5000); 
            return;
        }

        lastProcessedImageSrc = targetImage.src;

        if (targetImage.naturalWidth <= 100 || targetImage.naturalHeight <= 100) {
            console.log('Image is too small (less than 100x100 pixels). Restarting the script...');
            handleImageSizeError();
            return;
        }

        if (!targetImage.complete || targetImage.naturalWidth === 0) {
            console.log('Image not fully loaded. Waiting for load event.');
            targetImage.onload = function() {
                saveImage(targetImage);
            };
            targetImage.onerror = function() {
                console.error('Error loading image.');
                handleImageSizeError();
            };
        } else {
            saveImage(targetImage);
        }
    }

    // Function to save the image
    function saveImage(imgElement) {
        console.log('Saving image...');

        try {
            imgElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = imgElement.naturalWidth;
                canvas.height = imgElement.naturalHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(imgElement, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('Failed to convert canvas to blob.');
                        handleImageSizeError();
                        return;
                    }

                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `image_${Date.now()}.png`;
                    document.body.appendChild(a);

                    a.click();
                    console.log('Image download triggered.');

                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);

                    // Reset error count upon success
                    localStorage.setItem('errorCount', '0');

                    setTimeout(() => {
                        console.log('Restarting the script...');
                        automateInteraction();
                    }, 5000); 
                }, 'image/png');
            }, 500); 
        } catch (error) {
            console.error('Failed to save image:', error);

            if (error.message.includes('SecurityError')) {
                handleImageSizeError();
            }
        }
    }

    // Function to handle errors related to small images or loading errors
    function handleImageSizeError() {
        errorCount++;
        console.log(`Image size issue or SecurityError encountered. Error count: ${errorCount}`);
        localStorage.setItem('errorCount', errorCount);

        if (errorCount >= 2) {
            console.log('Error occurred twice. Waiting 20 minutes before restarting...');
            setTimeout(() => {
                console.log('Restarting the script after 20 minutes...');
                localStorage.setItem('errorCount', '0'); // Reset error count
                automateInteraction();
            }, 20 * 60 * 1000); 
        } else {
            console.log('Restarting the script immediately due to image size or SecurityError...');
            setTimeout(() => {
                automateInteraction();
            }, 5000); 
        }
    }

    // Start the automation process
    (function startAutomation() {
        var textarea = document.querySelector('textarea[placeholder="Ask anything"]');

        if (!textarea) {
            console.error('Textarea not found!');
            setTimeout(() => {
                startAutomation();
            }, 5000); 
        } else {
            console.log('Textarea found.');

            const randomNum = Math.random();
            let finalPrompt = basePrompt;
            if (randomNum < 0.6) {
                console.log('Using base prompt without additions.');
            } else {
                console.log('Adding extra items to the prompt.');
                finalPrompt = addStuff(basePrompt);
            }

            setNativeValue(textarea, finalPrompt);
            console.log(`Set textarea value to: "${finalPrompt}".`);

            waitForButtonAndClick(function() {
                console.log('Button clicked! Waiting 30 seconds before processing the image...');
                setTimeout(function() {
                    console.log('Processing the image...');
                    processImage();
                }, 30000); 
            });
        }
    })();
})();

(function () {
    // Function to process and save all images on the page
    function processAllImages() {
        const images = document.querySelectorAll('img'); // Select all images on the page
        let currentIndex = images.length - 1; // Start from the last image

        if (images.length === 0) {
            console.error('No images found on the page.');
            return;
        }

        // Function to process a single image
        function processImage() {
            if (currentIndex < 0) {
                console.log('All images have been processed.');
                return;
            }

            const targetImage = images[currentIndex];

            if (!targetImage.complete || targetImage.naturalWidth === 0) {
                console.log(`Image at index ${currentIndex} not fully loaded or invalid. Skipping...`);
                currentIndex--;
                setTimeout(processImage, 2000); // Move to the next image after 2 seconds
                return;
            }

            console.log(`Processing image at index ${currentIndex}...`);
            saveImage(targetImage);
            currentIndex--;
            setTimeout(processImage, 2000); // Move to the next image after 2 seconds
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
                    }, 'image/png');
                }, 500);
            } catch (error) {
                console.error('Error saving image:', error);
            }
        }

        // Start processing images
        processImage();
    }

    // Start processing all images
    processAllImages();
})();

// Function to highlight divs that do not contain "Follows you" and hide those that do
//this version hides all your followers so you only see the bad people.
function highlightAndHideDivs() {
    document.querySelectorAll('div[data-testid="cellInnerDiv"]').forEach(div => {
        if (div.innerText.includes("Follows you")) {
            div.style.display = 'none'; // Hide divs that contain "Follows you"
        } else {
            div.style.backgroundColor = 'yellow'; // Highlight divs that do not contain "Follows you"
        }
    });
}

// Run the function once initially
highlightAndHideDivs();

// Set up a MutationObserver to watch for added nodes
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            // Check if the added node is the target div or contains it
            if (node.nodeType === 1 && node.matches('div[data-testid="cellInnerDiv"]')) {
                if (node.innerText.includes("Follows you")) {
                    node.style.display = 'none'; // Hide if it contains "Follows you"
                } else {
                    node.style.backgroundColor = 'yellow'; // Highlight if it does not contain "Follows you"
                }
            } else if (node.nodeType === 1) {
                // Check for nested elements with `data-testid="cellInnerDiv"`
                node.querySelectorAll('div[data-testid="cellInnerDiv"]').forEach(innerDiv => {
                    if (innerDiv.innerText.includes("Follows you")) {
                        innerDiv.style.display = 'none'; // Hide if it contains "Follows you"
                    } else {
                        innerDiv.style.backgroundColor = 'yellow'; // Highlight if it does not contain "Follows you"
                    }
                });
            }
        });
    });
});

// Start observing the body for changes in child elements
observer.observe(document.body, {
    childList: true,
    subtree: true
});

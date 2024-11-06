// Function to highlight divs that do not contain "Follows you"
function highlightNonFollowers() {
    document.querySelectorAll('div[data-testid="cellInnerDiv"]').forEach(div => {
        if (!div.innerText.includes("Follows you")) {
            div.style.backgroundColor = 'yellow';
        }
    });
}

// Run the function once initially
highlightNonFollowers();

// Set up a MutationObserver to watch for added nodes
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            // Check if the added node is the target div or contains it
            if (node.nodeType === 1 && node.matches('div[data-testid="cellInnerDiv"]')) {
                if (!node.innerText.includes("Follows you")) {
                    node.style.backgroundColor = 'yellow';
                }
            } else if (node.nodeType === 1) {
                // Check for nested elements with `data-testid="cellInnerDiv"`
                node.querySelectorAll('div[data-testid="cellInnerDiv"]').forEach(innerDiv => {
                    if (!innerDiv.innerText.includes("Follows you")) {
                        innerDiv.style.backgroundColor = 'yellow';
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

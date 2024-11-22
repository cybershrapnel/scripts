    // Random user link click functionality
    function clickRandomUserLink() {
        const userLinks = Array.from(document.querySelectorAll('a[href^="/@"]'));

        if (userLinks.length === 0) {
            console.error("No user links found on the page.");
            return;
        }

        const randomIndex = Math.floor(Math.random() * userLinks.length);
        const randomLink = userLinks[randomIndex];

        console.log(`Clicking on user link: ${randomLink.href}`);
        randomLink.click();
    }

clickRandomUserLink();

(function () {
    // Function to find and click "Follow" buttons
    function clickFollowButtons() {
        // Select all buttons with the matching class
        const buttons = Array.from(
            document.querySelectorAll(
                'button.group.font-medium.font-sans.text-sm.flex.flex-row.flex-nowrap.items-center.justify-center.select-none.disabled\\:brightness-50.disabled\\:cursor-not-allowed.bg-quaternary.hover\\:bg-primary\\/30.text-primary.py-3.px-10.rounded-md'
            )
        );

        // Filter buttons with "Follow" text (and exclude "Following")
        const followButtons = buttons.filter(button => {
            return (
                button.textContent.trim() === "Follow" &&
                !button.textContent.includes("Following")
            );
        });

        // Click each "Follow" button
        followButtons.forEach(button => {
            console.log("Clicking Follow button:", button);
            button.click();
        });

        if (followButtons.length === 0) {
            console.log("No Follow buttons found.");
        }
    }

    // Continuously check for "Follow" buttons every 3 seconds
    setInterval(clickFollowButtons, 3000); // 3000 ms = 3 seconds
})();

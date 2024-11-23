(function () {
    // Auto-scroll functionality
    function autoScroll() {
        const target = document.querySelector(
            'body > div[class*="container"] > div.css-lb6gzl > div.css-lfs4ov > div.relative.flex.flex-1.overflow-y-hidden.overflow-x-hidden.w-full.mt-0.md\\:mt-0 > div > div[class*="w-split-pane"] > main > div'
        );

        if (target) {
            target.scrollBy(0, 500); // Scroll down by 100px
            console.log("Auto-scrolled the target element.");
        } else {
            console.error("Target element not found for auto-scrolling.");
        }
    }

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

    // Home link click functionality
    function clickHomeLink() {
        const homeLink = document.querySelector(
            'div.relative.w-full.flex.flex-row.items-center.justify-left.gap-2.py-2.pl-10.font-sans.font-medium.text-base\\/5.before\\:block.before\\:absolute.before\\:inset-y-2.before\\:left-0.before\\:w-1.before\\:bg-primary.before\\:origin-left.before\\:opacity-50.before\\:scale-x-0.before\\:transition-transform.before\\:duration-200.cursor-pointer.text-secondary.hover\\:text-primary.hover\\:before\\:scale-x-100.hover\\:before\\:bg-primary.hover\\:before\\:opacity-50'
        );

        if (homeLink) {
            homeLink.click();
            console.log("Clicked the 'Home' link.");
        } else {
            console.error("Could not find the 'Home' link.");
        }
    }

    // Run auto-scroll every second
    setInterval(autoScroll, 1000);

    // Click a random user link every 2 minutes
    setInterval(clickRandomUserLink, 120000); // 120,000ms = 2 minutes

    // Click the Home link every 2 minutes, staggered by 1 minute
    setTimeout(() => {
        setInterval(clickHomeLink, 120000); // 120,000ms = 2 minutes
    }, 60000); // Stagger by 1 minute (60,000ms)
})();


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


(function () {
    // Function to scroll the target element
    function autoScroll() {
        const target = document.querySelector(
            'body > div[class*="container"].bg-vinylBlack-darker.w-full.h-full.flex.flex-col > div.css-lb6gzl > div.css-lfs4ov > div.relative.flex.flex-1.overflow-y-hidden.overflow-x-hidden.w-full.-mt-16.md\\:mt-0 > div > div[class*="w-split-pane"].flex.lg\\:min-w-\\[570px\\].flex-1.bg-vinylBlack-darker.w-full.max-w-full > div.overflow-y-auto.overflow-x-hidden.h-full.w-full'
        );

        if (target) {
            target.scrollBy(0, 500); // Scroll down by 100px
            console.log("Scrolled the target element.");
        } else {
            console.error("Target element not found for scrolling.");
        }
    }

    // Scroll the element every second
    setInterval(autoScroll, 1000);
})();


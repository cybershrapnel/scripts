(function() {
    /**
     * Utility function to simulate a user click on an element.
     * @param {Element} element - The DOM element to click.
     */
    function simulateClick(element) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    /**
     * Function to determine the state of a toggle.
     * @param {Element} toggle - The toggle <div> element.
     * @returns {string} - 'Private', 'Public', or 'Unknown'.
     */
    function getToggleState(toggle) {
        const span = toggle.querySelector('span');
        if (!span) {
            console.warn('[ToggleAutomation] No <span> found within toggle.');
            return 'Unknown';
        }

        // Use classList.contains for accurate class checking
        const hasTranslateX3 = span.classList.contains('translate-x-3');

        // Optionally, check computed style for background color
        const computedStyle = window.getComputedStyle(span);
        const bgColor = computedStyle.backgroundColor;

        // For debugging purposes, log the detected properties
        console.log(`[ToggleAutomation] Toggle:`);
        console.log(`  - Span Classes: ${span.className}`);
        console.log(`  - Span Computed Background Color: ${bgColor}`);
        console.log(`  - Has 'translate-x-3' class: ${hasTranslateX3}`);

        if (hasTranslateX3) {
            return 'Public';
        } else {
            return 'Private';
        }
    }

    /**
     * Function to check if an element is visible.
     * @param {Element} element - The DOM element to check.
     * @returns {boolean} - True if the element is visible, else False.
     */
    function isElementVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    /**
     * Function to process and toggle all private toggles to public.
     */
    function togglePrivateToPublic() {
        console.log('[ToggleAutomation] Starting toggle process...');

        // Select all <div> elements with both 'inline-flex' and 'cursor-pointer' classes
        const allToggles = document.querySelectorAll('div.inline-flex.cursor-pointer');
        const visibleToggles = Array.from(allToggles).filter(toggle => isElementVisible(toggle));

        const totalToggles = visibleToggles.length;
        if (totalToggles === 0) {
            console.log('[ToggleAutomation] No visible toggles found on the page.');
            return;
        }

        console.log(`[ToggleAutomation] Found ${totalToggles} visible toggle(s) on the page.`);

        let togglesToClick = 0;
        let togglesAlreadyPublic = 0;
        let togglesUnknown = 0;

        visibleToggles.forEach((toggle, index) => {
            const toggleNumber = index + 1;
            const state = getToggleState(toggle);

            console.log(`Toggle #${toggleNumber}: Current State - ${state}`);

            if (state === 'Private') {
                console.log(`[ToggleAutomation] Toggle #${toggleNumber}: Private. Clicking to set to "Public".`);
                simulateClick(toggle);
                togglesToClick++;
            } else if (state === 'Public') {
                console.log(`[ToggleAutomation] Toggle #${toggleNumber}: Already "Public". No action taken.`);
                togglesAlreadyPublic++;
            } else {
                console.log(`[ToggleAutomation] Toggle #${toggleNumber}: State Unknown. No action taken.`);
                togglesUnknown++;
            }
        });

        console.log(`[ToggleAutomation] Toggle Process Completed. Clicked ${togglesToClick} toggle(s) to set them to "Public". ${togglesAlreadyPublic} toggle(s) were already "Public". ${togglesUnknown} toggle(s) had Unknown state.`);
    }

    // Run the togglePrivateToPublic function every 10 seconds
    setInterval(togglePrivateToPublic, 10000); // 10000 milliseconds = 10 seconds

    // Optionally, run it immediately on script execution
    togglePrivateToPublic();
})();

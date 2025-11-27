// Mobile UI controls for touch devices
const MobileUI = (function() {
    function init() {
        // Get all mobile control buttons
        const buttons = document.querySelectorAll('.mobile-control-btn');

        buttons.forEach(btn => {
            const key = btn.dataset.key;

            // Mouse events for desktop testing
            btn.addEventListener('mousedown', () => {
                Input.setKeyPressed(key, true);
            });

            btn.addEventListener('mouseup', () => {
                Input.setKeyPressed(key, false);
            });

            btn.addEventListener('mouseleave', () => {
                Input.setKeyPressed(key, false);
            });

            // Touch events for mobile devices
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                Input.setKeyPressed(key, true);
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                Input.setKeyPressed(key, false);
            });
        });
    }

    return {
        init
    };
})();

// Input handling for ClashRun
const Input = (function() {
    const keys = {};

    function init() {
        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
    }

    function isPressed(key) {
        return keys[key] || false;
    }

    function getMovementInput() {
        let dx = 0;
        let dy = 0;

        if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;

        return { dx, dy };
    }

    return {
        init,
        isPressed,
        getMovementInput
    };
})();

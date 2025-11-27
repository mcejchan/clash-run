// Input handling for ClashRun
const Input = (function() {
    const keys = {};
    let mouseX = 0;
    let mouseY = 0;
    let canvasBounds = null;

    function init() {
        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        const canvas = document.getElementById('gameCanvas');
        
        // Track canvas bounds
        function updateCanvasBounds() {
            canvasBounds = canvas.getBoundingClientRect();
        }
        updateCanvasBounds();
        window.addEventListener('resize', updateCanvasBounds);

        // Mouse tracking
        canvas.addEventListener('mousemove', (e) => {
            if (!canvasBounds) return;
            
            mouseX = e.clientX - canvasBounds.left;
            mouseY = e.clientY - canvasBounds.top;
        });

        // Mouse leave handler
        canvas.addEventListener('mouseleave', () => {
            mouseX = 0;
            mouseY = 0;
        });
    }

    function isPressed(key) {
        return keys[key] || false;
    }

    function setKeyPressed(key, pressed) {
        keys[key] = pressed;
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

    function getMovementInputPlayer2() {
        let dx = 0;
        let dy = 0;

        if (keys['i'] || keys['I']) dy -= 1;
        if (keys['k'] || keys['K']) dy += 1;
        if (keys['j'] || keys['J']) dx -= 1;
        if (keys['l'] || keys['L']) dx += 1;

        return { dx, dy };
    }

    function getMovementInputPlayer3() {
        let dx = 0;
        let dy = 0;

        if (keys['š'] || keys['Š']) dy -= 1;
        if (keys['ž'] || keys['Ž']) dy += 1;
        if (keys['č'] || keys['Č']) dx -= 1;
        if (keys['ř'] || keys['Ř']) dx += 1;

        return { dx, dy };
    }

    function getMousePosition() {
        return { x: mouseX, y: mouseY };
    }

    function getShootDirection() {
        const canvas = document.getElementById('gameCanvas');
        const viewportWidth = 800;

        // Player 1 (left viewport) aims relative to left viewport center
        const centerX = viewportWidth / 2;
        const centerY = canvas.height / 2;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If mouse is at center or not tracked, shoot forward
        if (distance < 10) {
            return { dx: 1, dy: 0 };
        }

        return {
            dx: dx / distance,
            dy: dy / distance
        };
    }

    function getShootDirectionForPosition(worldX, worldY) {
        const canvas = document.getElementById('gameCanvas');
        const viewportWidth = 800;
        const world = Player.getWorldOffset ? Player.getWorldOffset() : { offsetX: 0, offsetY: 0 };

        // Determine which viewport the mouse is in
        let viewportCenterX, viewportOriginX;
        if (mouseX < viewportWidth) {
            // Mouse in left viewport (Player 1)
            viewportCenterX = viewportWidth / 2;
            viewportOriginX = 0;
        } else {
            // Mouse in right viewport (Player 2)
            viewportCenterX = viewportWidth + viewportWidth / 2;
            viewportOriginX = viewportWidth;
        }

        // Get Player 2's camera for correct positioning
        const camera2 = Player.getCamera(1);
        const screenX = worldX - camera2.offsetX + viewportCenterX;
        const screenY = worldY - camera2.offsetY + canvas.height / 2;

        const dx = mouseX - screenX;
        const dy = mouseY - screenY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If mouse is at center or not tracked, shoot forward
        if (distance < 10) {
            return { dx: 1, dy: 0 };
        }

        return {
            dx: dx / distance,
            dy: dy / distance
        };
    }

    return {
        init,
        isPressed,
        setKeyPressed,
        getMovementInput,
        getMovementInputPlayer2,
        getMovementInputPlayer3,
        getMousePosition,
        getShootDirection,
        getShootDirectionForPosition
    };
})();

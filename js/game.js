// Main game loop and core logic for ClashRun
const Game = (function() {
    let canvas;

    async function init() {
        canvas = document.getElementById('gameCanvas');
        
        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 600;
        
        // Wait for config to load before initializing units
        await Config.loadConfig();
        
        // Initialize all systems
        Input.init();
        Player.init(canvas);
        Units.init(canvas);
        Rendering.init(canvas);
        UI.init();
        
        // Generate obstacles after units are initialized
        const enemies = Units.getEnemies();
        Obstacles.generateObstacles([], enemies);
        
        console.log('Game initialized');
    }

    function update() {
        Player.update();
        Units.updateEnemies();
        Units.updateAllies();
        Projectiles.update();
        UI.update();
    }

    function gameLoop() {
        Rendering.render();
        update();
        requestAnimationFrame(gameLoop);
    }

    function start() {
        init().then(() => {
            gameLoop();
        });
    }

    return {
        start
    };
})();

// Main game loop and core logic for ClashRun
const Game = (function() {
    let canvas;

    function init() {
        canvas = document.getElementById('gameCanvas');
        
        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 600;
        
        // Initialize all systems
        Input.init();
        Player.init(canvas);
        Units.init(canvas);
        Rendering.init(canvas);
        
        // Generate obstacles after units are initialized
        const allies = Units.getAllies();
        const enemies = Units.getEnemies();
        Obstacles.generateObstacles(allies, enemies);
        
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
        init();
        gameLoop();
    }

    return {
        start
    };
})();

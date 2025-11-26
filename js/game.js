// Main game loop and core logic for ClashRun
const Game = (function() {
    let canvas;
    let animationFrameId;
    let gameInitialized = false;

    async function init() {
        canvas = document.getElementById('gameCanvas');

        // Set canvas dimensions for split-screen (1600x600 = two 800x600 viewports)
        canvas.width = 1600;
        canvas.height = 600;

        // Wait for config to load before initializing units
        await Config.loadConfig();

        // Initialize shop system first
        if (!gameInitialized) {
            Shop.init();
            ShopUI.init();
            gameInitialized = true;
        } else {
            Shop.startNewGame();
        }

        // Initialize all systems
        Input.init();
        Player.init(canvas);
        Units.init(canvas);
        Rendering.init(canvas);
        UI.init();
        Projectiles.reset();

        // Apply any active upgrades
        Shop.applyUpgrades();

        // Generate obstacles after units are initialized
        const enemies = Units.getEnemies();
        Obstacles.generateObstacles([], enemies);

        console.log('Game initialized');
    }

    function update() {
        // Check if both players are dead
        const players = Player.getAllPlayers();
        let allPlayersDead = true;

        for (const player of players) {
            if (player.hp > 0) {
                allPlayersDead = false;
                break;
            }
        }

        if (allPlayersDead) {
            Shop.endGame();
            showGameOver();
            return;
        }

        // Check if all enemies are defeated (win condition)
        const enemies = Units.getEnemies();
        let allEnemiesDead = true;

        for (const enemy of enemies) {
            if (enemy.hp > 0) {
                allEnemiesDead = false;
                break;
            }
        }

        if (allEnemiesDead) {
            Shop.endGame();
            showGameOver();
            return;
        }

        Player.update();
        Units.updateEnemies();
        Units.updateAllies();
        Projectiles.update();
        UI.update();
    }

    function gameLoop() {
        if (Shop.isGameActive()) {
            Rendering.render();
            update();
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function showGameOver() {
        ShopUI.renderShop();
    }

    function restartGame() {
        // Reset all game systems
        init().then(() => {
            // Continue the game loop
            gameLoop();
        });
    }

    function start() {
        init().then(() => {
            gameLoop();
        });
    }

    return {
        start,
        restartGame
    };
})();

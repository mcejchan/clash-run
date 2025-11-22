// Player and camera system for ClashRun
const Player = (function() {
    let canvas;
    let player = {};
    let world = {};

    function init(canvasElement) {
        canvas = canvasElement;
        
        player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: Config.get('player.width'),
            height: Config.get('player.height'),
            speed: Config.get('player.speed'),
            color: Config.get('player.color')
        };
        
        world = {
            offsetX: 0,
            offsetY: 0
        };
    }

    function update() {
        const movement = Input.getMovementInput();
        const playerCollisionRadius = Config.get('collision.playerRadius');

        if (movement.dy < 0) { // Up
            const newOffsetY = world.offsetY - player.speed;
            if (!Obstacles.checkCollisionWithObstacles(0, -player.speed, playerCollisionRadius)) {
                world.offsetY = newOffsetY;
            }
        }
        if (movement.dy > 0) { // Down
            const newOffsetY = world.offsetY + player.speed;
            if (!Obstacles.checkCollisionWithObstacles(0, player.speed, playerCollisionRadius)) {
                world.offsetY = newOffsetY;
            }
        }
        if (movement.dx < 0) { // Left
            const newOffsetX = world.offsetX - player.speed;
            if (!Obstacles.checkCollisionWithObstacles(-player.speed, 0, playerCollisionRadius)) {
                world.offsetX = newOffsetX;
            }
        }
        if (movement.dx > 0) { // Right
            const newOffsetX = world.offsetX + player.speed;
            if (!Obstacles.checkCollisionWithObstacles(player.speed, 0, playerCollisionRadius)) {
                world.offsetX = newOffsetX;
            }
        }
    }

    function getWorldOffset() {
        return world;
    }

    function getPlayer() {
        return player;
    }

    function getWorldX() {
        return world.offsetX;
    }

    function getWorldY() {
        return world.offsetY;
    }

    return {
        init,
        update,
        getWorldOffset,
        getPlayer,
        getWorldX,
        getWorldY
    };
})();

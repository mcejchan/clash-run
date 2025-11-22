// Player and camera system for ClashRun
const Player = (function() {
    let canvas;
    let players = [];
    let world = {}; // Kept for backward compatibility
    let shootCooldowns = [0, 0];
    let shootCooldownMaxes = [60, 90]; // Player 1: 60, Player 2: 90
    const VIEWPORT_WIDTH = 800;
    const VIEWPORT_HEIGHT = 600;

    function init(canvasElement) {
        canvas = canvasElement;

        // Player 1 (archer - left viewport, WASD controls)
        players[0] = {
            id: 0,
            x: VIEWPORT_WIDTH / 2,
            y: VIEWPORT_HEIGHT / 2,
            worldX: 0,
            worldY: 0,
            width: 30,
            height: 40,
            speed: 3,
            color: '#27ae60', // Green
            type: 'player1',
            damage: 15,
            maxHp: 100,
            hp: 100,
            cameraOffsetX: 0,
            cameraOffsetY: 0
        };

        // Player 2 (healer - right viewport, IJKL controls)
        players[1] = {
            id: 1,
            x: VIEWPORT_WIDTH / 2 + 80,
            y: VIEWPORT_HEIGHT / 2,
            worldX: 80,
            worldY: 0,
            width: 30,
            height: 40,
            speed: 2.5,
            color: '#8e44ad', // Purple
            type: 'player2',
            healAmount: 15,
            maxHp: 80,
            hp: 80,
            cameraOffsetX: 0,
            cameraOffsetY: 0
        };

        // Keep world for backward compatibility (mirrors Player 1's camera)
        world = {
            offsetX: 0,
            offsetY: 0
        };
    }

    function update() {
        const playerCollisionRadius = Config.get('collision.playerRadius');

        // Update Player 1 (archer, WASD controls, centered camera)
        const movement1 = Input.getMovementInput();
        const player1 = players[0];

        // Player 1 movement updates camera offset
        if (movement1.dy < 0) { // Up
            const newOffsetY = player1.cameraOffsetY - player1.speed;
            if (!Obstacles.checkCollisionWithObstacles(0, -player1.speed, playerCollisionRadius)) {
                player1.cameraOffsetY = newOffsetY;
            }
        }
        if (movement1.dy > 0) { // Down
            const newOffsetY = player1.cameraOffsetY + player1.speed;
            if (!Obstacles.checkCollisionWithObstacles(0, player1.speed, playerCollisionRadius)) {
                player1.cameraOffsetY = newOffsetY;
            }
        }
        if (movement1.dx < 0) { // Left
            const newOffsetX = player1.cameraOffsetX - player1.speed;
            if (!Obstacles.checkCollisionWithObstacles(-player1.speed, 0, playerCollisionRadius)) {
                player1.cameraOffsetX = newOffsetX;
            }
        }
        if (movement1.dx > 0) { // Right
            const newOffsetX = player1.cameraOffsetX + player1.speed;
            if (!Obstacles.checkCollisionWithObstacles(player1.speed, 0, playerCollisionRadius)) {
                player1.cameraOffsetX = newOffsetX;
            }
        }

        // Update player 1 world position (always centered on viewport)
        player1.worldX = player1.cameraOffsetX;
        player1.worldY = player1.cameraOffsetY;

        // Update world for backward compatibility
        world.offsetX = player1.cameraOffsetX;
        world.offsetY = player1.cameraOffsetY;

        // Update Player 2 (healer, IJKL controls, independent movement)
        const movement2 = Input.getMovementInputPlayer2();
        const player2 = players[1];
        const moveX2 = movement2.dx * player2.speed;
        const moveY2 = movement2.dy * player2.speed;

        if (!Obstacles.checkCollisionWithObstacles(player2.worldX + moveX2, player2.worldY + moveY2, 15)) {
            player2.worldX += moveX2;
            player2.worldY += moveY2;
        }

        // Player 2 camera is centered on its own position
        player2.cameraOffsetX = player2.worldX;
        player2.cameraOffsetY = player2.worldY;

        // Handle shooting
        if (shootCooldowns[0] > 0) {
            shootCooldowns[0]--;
        } else if (Input.isPressed(' ')) {
            shoot(0);
        }

        // Player 2 shooting (healer)
        if (shootCooldowns[1] > 0) {
            shootCooldowns[1]--;
        } else if (Input.isPressed('Y') || Input.isPressed('y')) {
            shoot(1);
        }

        // Heal all players when healer shoots
        if (Input.isPressed('Y') || Input.isPressed('y')) {
            healAllPlayers();
        }
    }

    function shoot(playerId) {
        if (shootCooldowns[playerId] > 0) return;

        const player = players[playerId];
        const direction = playerId === 0
            ? Input.getShootDirection()
            : Input.getShootDirectionForPosition(player.worldX, player.worldY);
        const shootWorldX = player.worldX;
        const shootWorldY = player.worldY;

        if (playerId === 0) {
            // Player 1: Create arrow
            Projectiles.createArrow(shootWorldX, shootWorldY, direction.dx, direction.dy, player.damage);
        } else {
            // Player 2: Create heal projectile
            Projectiles.createHealProjectile(shootWorldX, shootWorldY, direction.dx, direction.dy, player.healAmount);
        }

        shootCooldowns[playerId] = shootCooldownMaxes[playerId];
    }

    function healAllPlayers() {
        const player1 = players[0];
        const player2 = players[1];

        // heal player 1
        player1.hp = Math.min(player1.hp + player2.healAmount, player1.maxHp);

        // heal player 2 (self)
        player2.hp = Math.min(player2.hp + player2.healAmount, player2.maxHp);

        // heal allies from Units (if any still exist during transition)
        if (typeof Units !== 'undefined' && Units.getAllies) {
            const allies = Units.getAllies();
            allies.forEach(ally => {
                if (ally.hp > 0 && ally.hp < ally.maxHp) {
                    ally.hp = Math.min(ally.hp + player2.healAmount, ally.maxHp);
                }
            });
        }
    }

    function getWorldOffset() {
        return world;
    }

    function getPlayer() {
        return players[0];
    }

    function getPlayer2() {
        return players[1];
    }

    function getCamera(playerId) {
        if (playerId < 0 || playerId >= players.length) return null;
        return {
            offsetX: players[playerId].cameraOffsetX,
            offsetY: players[playerId].cameraOffsetY
        };
    }

    function getWorldX() {
        return world.offsetX;
    }

    function getWorldY() {
        return world.offsetY;
    }

    function getShootCooldown() {
        return shootCooldowns[0];
    }

    function getShootCooldown2() {
        return shootCooldowns[1];
    }

    function getShootCooldownMax() {
        return shootCooldownMaxes[0];
    }

    function getShootCooldownMax2() {
        return shootCooldownMaxes[1];
    }

    function resetShootButton() {
        // No shoot button needed anymore
    }

    function getAllPlayers() {
        return players;
    }

    return {
        init,
        update,
        getWorldOffset,
        getPlayer,
        getPlayer2,
        getCamera,
        getWorldX,
        getWorldY,
        getShootCooldown,
        getShootCooldown2,
        getShootCooldownMax,
        getShootCooldownMax2,
        resetShootButton,
        getAllPlayers
    };
})();

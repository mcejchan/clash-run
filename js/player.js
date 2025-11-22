// Player and camera system for ClashRun
const Player = (function() {
    let canvas;
    let player = {}; // Former player 2 (archer)
    let player2 = {}; // Former player 3 (healer)
    let world = {};
    let shootCooldown = 0;
    let shootCooldownMax = 60; // 1 second at 60 FPS
    let shootCooldown2 = 0;
    let shootCooldownMax2 = 90; // Healer has longer cooldown

    function init(canvasElement) {
        canvas = canvasElement;
        
        // Player 1 (former player 2, archer - now controls camera)
        player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            worldX: 0,
            worldY: 0,
            width: 30,
            height: 40,
            speed: 3,
            color: '#27ae60', // Green
            type: 'player1',
            damage: 15,
            maxHp: 100,
            hp: 100
        };
        
        // Player 2 (former player 3, healer)
        player2 = {
            x: canvas.width / 2 + 80,
            y: canvas.height / 2,
            worldX: 80,
            worldY: 0,
            width: 30,
            height: 40,
            speed: 2.5,
            color: '#8e44ad', // Purple
            type: 'player2',
            healAmount: 15,
            maxHp: 80,
            hp: 80
        };
        
        world = {
            offsetX: 0,
            offsetY: 0
        };
    }

    function update() {
        // Update player 1 movement (camera controls world)
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

        // Update player 1 world position
        player.worldX = world.offsetX;
        player.worldY = world.offsetY;

        // Update player 2 movement (relative to camera)
        const movement2 = Input.getMovementInputPlayer2();
        const moveX2 = movement2.dx * player2.speed;
        const moveY2 = movement2.dy * player2.speed;
        
        if (!Obstacles.checkCollisionWithObstacles(player2.worldX + moveX2, player2.worldY + moveY2, 15)) {
            player2.worldX += moveX2;
            player2.worldY += moveY2;
        }

        // Handle shooting
        if (shootCooldown > 0) {
            shootCooldown--;
        } else if (Input.isPressed(' ')) {
            shoot();
        }

        // Player 2 shooting (healer)
        if (shootCooldown2 > 0) {
            shootCooldown2--;
        } else if (Input.isPressed('Y') || Input.isPressed('y')) {
            shoot2();
        }

        // Heal all players when healer shoots
        if (Input.isPressed('Y') || Input.isPressed('y')) {
            healAllPlayers();
        }
    }

    function shoot() {
        if (shootCooldown > 0) return;

        const direction = Input.getShootDirection();
        const shootWorldX = player.worldX;
        const shootWorldY = player.worldY;

        // Create arrow instead of regular projectile
        Projectiles.createArrow(shootWorldX, shootWorldY, direction.dx, direction.dy, player.damage);

        shootCooldown = shootCooldownMax;
    }

    function shoot2() {
        if (shootCooldown2 > 0) return;

        const direction = Input.getShootDirectionForPosition(player2.worldX, player2.worldY);
        const shootWorldX = player2.worldX;
        const shootWorldY = player2.worldY;

        Projectiles.createHealProjectile(shootWorldX, shootWorldY, direction.dx, direction.dy, player2.healAmount);

        shootCooldown2 = shootCooldownMax2;
    }

    function healAllPlayers() {
        // heal player
        player.hp = Math.min(player.hp + player2.healAmount, player.maxHp);
        
        // heal player2 (self)
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
        return player;
    }

    function getPlayer2() {
        return player2;
    }

    function getWorldX() {
        return world.offsetX;
    }

    function getWorldY() {
        return world.offsetY;
    }

    function getShootCooldown() {
        return shootCooldown;
    }

    function getShootCooldown2() {
        return shootCooldown2;
    }

    function getShootCooldownMax() {
        return shootCooldownMax;
    }

    function getShootCooldownMax2() {
        return shootCooldownMax2;
    }

    function resetShootButton() {
        // No shoot button needed anymore
    }

    function getAllPlayers() {
        return [player, player2];
    }

    return {
        init,
        update,
        getWorldOffset,
        getPlayer,
        getPlayer2,
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

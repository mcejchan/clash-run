// Player and camera system for ClashRun
const Player = (function() {
    let canvas;
    let player = {};
    let player2 = {}; // Archer
    let player3 = {}; // Healer
    let world = {};
    let shootCooldown = 0;
    let shootCooldownMax = 60; // 1 second at 60 FPS
    let shootCooldown2 = 0;
    let shootCooldownMax2 = 60;
    let shootCooldown3 = 0;
    let shootCooldownMax3 = 90; // Healer has longer cooldown

    function init(canvasElement) {
        canvas = canvasElement;
        
        // Player 1 (original player)
        player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            worldX: 0,
            worldY: 0,
            width: Config.get('player.width'),
            height: Config.get('player.height'),
            speed: Config.get('player.speed'),
            color: '#3498db', // Blue
            type: 'player1',
            damage: 10,
            maxHp: 120,
            hp: 120
        };
        
        // Player 2 (Archer)
        player2 = {
            x: canvas.width / 2 - 80,
            y: canvas.height / 2,
            worldX: -80,
            worldY: 0,
            width: 30,
            height: 40,
            speed: 3,
            color: '#27ae60', // Green
            type: 'archer',
            damage: 15,
            maxHp: 100,
            hp: 100
        };
        
        // Player 3 (Healer)
        player3 = {
            x: canvas.width / 2 + 80,
            y: canvas.height / 2,
            worldX: 80,
            worldY: 0,
            width: 30,
            height: 40,
            speed: 2.5,
            color: '#8e44ad', // Purple
            type: 'healer',
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

        // Update player 3 movement (relative to camera)
        const movement3 = Input.getMovementInputPlayer3();
        const moveX3 = movement3.dx * player3.speed;
        const moveY3 = movement3.dy * player3.speed;
        
        if (!Obstacles.checkCollisionWithObstacles(player3.worldX + moveX3, player3.worldY + moveY3, 15)) {
            player3.worldX += moveX3;
            player3.worldY += moveY3;
        }

        // Handle shooting
        if (shootCooldown > 0) {
            shootCooldown--;
        } else if (Input.isPressed(' ')) {
            shoot();
        }

        // Player 2 shooting
        if (shootCooldown2 > 0) {
            shootCooldown2--;
        } else if (Input.isPressed('U') || Input.isPressed('u')) {
            shoot2();
        }

        // Player 3 shooting
        if (shootCooldown3 > 0) {
            shootCooldown3--;
        } else if (Input.isPressed('Y') || Input.isPressed('y')) {
            shoot3();
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

        Projectiles.createPlayerProjectile(shootWorldX, shootWorldY, direction.dx, direction.dy, player.damage);

        shootCooldown = shootCooldownMax;
        resetShootButton();
    }

    function shoot2() {
        if (shootCooldown2 > 0) return;

        const direction = Input.getShootDirectionForPosition(player2.worldX, player2.worldY);
        const shootWorldX = player2.worldX;
        const shootWorldY = player2.worldY;

        Projectiles.createArrow(shootWorldX, shootWorldY, direction.dx, direction.dy, player2.damage);

        shootCooldown2 = shootCooldownMax2;
    }

    function shoot3() {
        if (shootCooldown3 > 0) return;

        const direction = Input.getShootDirectionForPosition(player3.worldX, player3.worldY);
        const shootWorldX = player3.worldX;
        const shootWorldY = player3.worldY;

        Projectiles.createHealProjectile(shootWorldX, shootWorldY, direction.dx, direction.dy, player3.healAmount);

        shootCooldown3 = shootCooldownMax3;
    }

    function healAllPlayers() {
        // heal player
        if (player.hp && player.maxHp) {
            player.hp = Math.min(player.hp + player3.healAmount, player.maxHp);
        }
        
        // heal player2 (archer)
        player2.hp = Math.min(player2.hp + player3.healAmount, player2.maxHp);
        
        // heal player3 (self)
        player3.hp = Math.min(player3.hp + player3.healAmount, player3.maxHp);
        
        // heal allies from Units
        const allies = Units.getAllies();
        allies.forEach(ally => {
            if (ally.hp > 0 && ally.hp < ally.maxHp) {
                ally.hp = Math.min(ally.hp + player3.healAmount, ally.maxHp);
            }
        });
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

    function getPlayer3() {
        return player3;
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

    function getShootCooldown3() {
        return shootCooldown3;
    }

    function getShootCooldownMax() {
        return shootCooldownMax;
    }

    function getShootCooldownMax2() {
        return shootCooldownMax2;
    }

    function getShootCooldownMax3() {
        return shootCooldownMax3;
    }

    function resetShootButton() {
        const shootButton = document.getElementById('shoot-button');
        if (shootButton && shootCooldown <= 0) {
            shootButton.classList.remove('on-cooldown');
            shootButton.disabled = false;
        }
    }

    function getAllPlayers() {
        return [player, player2, player3];
    }

    return {
        init,
        update,
        getWorldOffset,
        getPlayer,
        getPlayer2,
        getPlayer3,
        getWorldX,
        getWorldY,
        getShootCooldown,
        getShootCooldown2,
        getShootCooldown3,
        getShootCooldownMax,
        getShootCooldownMax2,
        getShootCooldownMax3,
        resetShootButton,
        getAllPlayers
    };
})();

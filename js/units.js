// Unit system for ClashRun
const Units = (function() {
    let canvas;
    let enemies = [];

    function init(canvasElement) {
        canvas = canvasElement;

        // Initialize enemies only
        enemies = [
            {
                name: 'Robot',
                worldX: 200,
                worldY: -100,
                width: Config.get('robot.width'),
                height: Config.get('robot.height'),
                speed: Config.get('robot.speed'),
                color: Config.get('robot.color'),
                hp: Config.get('robot.hp'),
                maxHp: Config.get('robot.maxHp'),
                attackTimer: 0,
                attackCooldown: Config.get('robot.attackCooldown'),
                attackRange: Config.get('robot.attackRange'),
                damage: Config.get('robot.damage'),
                slowDownTimer: 0,
                slowDownInterval: Math.random() * Config.get('robot.slowDownMaxInterval') + Config.get('robot.slowDownMinInterval'),
                isSlow: false,
                isAttacking: false,
                currentTarget: null, // Individuální target pro tohoto robota
                targetUpdateTimer: 0,
                targetUpdateInterval: 30 // Aktualizovat target každých 30 framů
            }
        ];
        
        // Debug: Log the robot HP values
        console.log('Robot HP config:', {
            hp: Config.get('robot.hp'),
            maxHp: Config.get('robot.maxHp')
        });
    }

    function updateEnemies() {
        enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;

            // Aktualizuj target na intervalu
            enemy.targetUpdateTimer++;
            if (enemy.targetUpdateTimer >= enemy.targetUpdateInterval) {
                enemy.targetUpdateTimer = 0;

                // Get all players as targets
                const players = Player.getAllPlayers();

                // Find nearest target
                let newTarget = null;
                let targetDist = Infinity;

                players.forEach(p => {
                    if (p.hp <= 0) return;

                    const dx = p.worldX - enemy.worldX;
                    const dy = p.worldY - enemy.worldY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < targetDist) {
                        targetDist = dist;
                        newTarget = p;
                    }
                });

                // Nastav aktuální target
                enemy.currentTarget = newTarget;
            }

            // Použij aktuální target
            const target = enemy.currentTarget;

            // Detect dangerous projectiles nearby
            let dangerousProjectile = null;
            let minDangerDist = 150;
            const projectiles = Projectiles.getAll();

            projectiles.forEach(proj => {
                const dx = proj.worldX - enemy.worldX;
                const dy = proj.worldY - enemy.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDangerDist) {
                    dangerousProjectile = proj;
                    minDangerDist = dist;
                }
            });

            const currentSpeed = enemy.isSlow ? enemy.speed * 0.3 : enemy.speed;
            let moveX = 0;
            let moveY = 0;

            // Evade projectiles - highest priority
            if (dangerousProjectile && minDangerDist < 100) {
                const projDx = dangerousProjectile.worldX - enemy.worldX;
                const projDy = dangerousProjectile.worldY - enemy.worldY;
                const projDist = Math.sqrt(projDx * projDx + projDy * projDy);

                if (projDist > 0) {
                    // Move perpendicular to projectile
                    const perpX = -projDy;
                    const perpY = projDx;
                    const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
                    moveX = (perpX / perpLen) * currentSpeed * 1.5;
                    moveY = (perpY / perpLen) * currentSpeed * 1.5;
                }
            }
            // Normal behavior - move to target
            else if (target) {
                const dx = target.worldX - enemy.worldX;
                const dy = target.worldY - enemy.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > enemy.attackRange) {
                    // Strategic movement - sometimes circle around
                    const circleOffset = Math.sin(Date.now() / 500) * 30;
                    const perpX = -dy;
                    const perpY = dx;
                    const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);

                    moveX = ((dx / dist) * currentSpeed) + (perpX / perpLen) * circleOffset * 0.1;
                    moveY = ((dy / dist) * currentSpeed) + (perpY / perpLen) * circleOffset * 0.1;
                    enemy.isAttacking = false;
                } else {
                    // In range - attack
                    moveX = 0;
                    moveY = 0;
                    enemy.attackTimer++;
                    enemy.isAttacking = true;

                    if (enemy.attackTimer >= enemy.attackCooldown) {
                        target.hp -= enemy.damage;
                        enemy.attackTimer = 0;
                    }
                }
            } else {
                enemy.isAttacking = false;
            }

            // Apply movement with collision detection
            if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
                const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);
                if (moveLen > currentSpeed) {
                    moveX = (moveX / moveLen) * currentSpeed;
                    moveY = (moveY / moveLen) * currentSpeed;
                }

                // Try to move (collision check)
                const enemyCollisionRadius = Config.get('collision.enemyRadius');
                if (!Obstacles.checkCollisionWithObstacles(enemy.worldX + moveX, enemy.worldY + moveY, enemyCollisionRadius)) {
                    enemy.worldX += moveX;
                    enemy.worldY += moveY;
                } else {
                    // Try to avoid collision
                    if (!Obstacles.checkCollisionWithObstacles(enemy.worldX + moveX * 0.5, enemy.worldY + moveY, enemyCollisionRadius)) {
                        enemy.worldX += moveX * 0.5;
                        enemy.worldY += moveY;
                    } else if (!Obstacles.checkCollisionWithObstacles(enemy.worldX + moveX, enemy.worldY + moveY * 0.5, enemyCollisionRadius)) {
                        enemy.worldX += moveX;
                        enemy.worldY += moveY * 0.5;
                    }
                }
            }
        });
    }

    function updateAllies() {
        // No allies anymore - this function is kept for compatibility
    }

    function getAllies() {
        // No allies anymore - return empty array
        return [];
    }

    function getEnemies() {
        return enemies;
    }

    return {
        init,
        updateEnemies,
        updateAllies,
        getAllies,
        getEnemies
    };
})();

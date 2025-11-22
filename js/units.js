// Unit system for ClashRun
const Units = (function() {
    let canvas;
    let allies = [];
    let enemies = [];

    function init(canvasElement) {
        canvas = canvasElement;

        // Initialize allies
        allies = [
            {
                name: 'Lukostřelec',
                x: canvas.width / 2 - 40,
                y: canvas.height / 2 + 60,
                worldX: -40,
                worldY: 60,
                width: Config.get('archer.width'),
                height: Config.get('archer.height'),
                speed: Config.get('archer.speed'),
                color: Config.get('archer.color'),
                hp: Config.get('archer.hp'),
                maxHp: Config.get('archer.maxHp'),
                attackTimer: 0,
                attackCooldown: Config.get('archer.attackCooldown'),
                attackRange: Config.get('archer.attackRange'),
                damage: Config.get('archer.damage')
            },
            {
                name: 'Lékař',
                x: canvas.width / 2 + 60,
                y: canvas.height / 2 + 40,
                worldX: 60,
                worldY: 40,
                width: Config.get('healer.width'),
                height: Config.get('healer.height'),
                speed: Config.get('healer.speed'),
                color: Config.get('healer.color'),
                hp: Config.get('healer.hp'),
                maxHp: Config.get('healer.maxHp'),
                healTimer: 0,
                healCooldown: Config.get('healer.healCooldown'),
                healAmount: Config.get('healer.healAmount')
            }
        ];

        // Initialize enemies
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
                isAttacking: false
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

            // Prioritize archer (most dangerous)
            let targetAlly = null;
            let targetDist = Infinity;

            allies.forEach(ally => {
                if (ally.hp <= 0) return;
                const dx = ally.worldX - enemy.worldX;
                const dy = ally.worldY - enemy.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Prioritize archer (index 0)
                if (ally === allies[0]) {
                    if (dist < targetDist) {
                        targetDist = dist;
                        targetAlly = ally;
                    }
                } else if (!targetAlly || targetAlly !== allies[0]) {
                    if (dist < targetDist) {
                        targetDist = dist;
                        targetAlly = ally;
                    }
                }
            });

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
            else if (targetAlly) {
                const dx = targetAlly.worldX - enemy.worldX;
                const dy = targetAlly.worldY - enemy.worldY;
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
                        targetAlly.hp -= enemy.damage;
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
        const world = Player.getWorldOffset();

        allies.forEach((ally, index) => {
            if (ally.hp <= 0) return;
            
            // Target position (follow player/camera)
            const targetWorldX = world.offsetX;
            const targetWorldY = world.offsetY;
            
            const dx = targetWorldX - ally.worldX;
            const dy = targetWorldY - ally.worldY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Move towards player
            const followDistance = index === 0 ? 50 : 40;
            const allyCollisionRadius = Config.get('collision.allyRadius');
            if (distance > followDistance) {
                const moveX = (dx / distance) * ally.speed;
                const moveY = (dy / distance) * ally.speed;

                // Try to move (collision check)
                if (!Obstacles.checkCollisionWithObstacles(ally.worldX + moveX, ally.worldY + moveY, allyCollisionRadius)) {
                    ally.worldX += moveX;
                    ally.worldY += moveY;
                } else {
                    // Try to avoid collision by moving sideways
                    const perpX = -dy;
                    const perpY = dx;
                    const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);

                    if (perpLen > 0) {
                        const sideX = (perpX / perpLen) * ally.speed * 0.7;
                        const sideY = (perpY / perpLen) * ally.speed * 0.7;

                        if (!Obstacles.checkCollisionWithObstacles(ally.worldX + sideX, ally.worldY + sideY, allyCollisionRadius)) {
                            ally.worldX += sideX;
                            ally.worldY += sideY;
                        } else {
                            // Try opposite direction
                            if (!Obstacles.checkCollisionWithObstacles(ally.worldX - sideX, ally.worldY - sideY, allyCollisionRadius)) {
                                ally.worldX -= sideX;
                                ally.worldY -= sideY;
                            }
                        }
                    }
                }
            }
            
            // Archer - attacks robot
            if (index === 0 && ally.attackTimer < ally.attackCooldown) {
                ally.attackTimer++;
            }
            
            if (index === 0 && ally.attackTimer >= ally.attackCooldown) {
                // Find nearest enemy
                enemies.forEach(enemy => {
                    if (enemy.hp <= 0) return;
                    
                    const dx = enemy.worldX - ally.worldX;
                    const dy = enemy.worldY - ally.worldY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < ally.attackRange) {
                        // Shoot arrow
                        Projectiles.create(ally.worldX, ally.worldY, dx / dist, dy / dist, ally.damage, enemy);
                        ally.attackTimer = 0;
                    }
                });
            }
            
            // Healer - heals allies
            if (index === 1) {
                if (ally.healTimer > 0) {
                    ally.healTimer--;
                }
                
                ally.attackTimer++;
                if (ally.attackTimer >= ally.healCooldown) {
                    // Find injured ally
                    allies.forEach(a => {
                        if (a.hp > 0 && a.hp < a.maxHp) {
                            a.hp = Math.min(a.hp + ally.healAmount, a.maxHp);
                            ally.healTimer = 30;
                            ally.attackTimer = 0;
                        }
                    });
                }
            }
        });
    }

    function getAllies() {
        return allies;
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

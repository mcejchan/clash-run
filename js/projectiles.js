// Projectile system for ClashRun
const Projectiles = (function() {
    let projectiles = [];
    let arrows = [];
    let healProjectiles = [];
    let damageProjectiles = []; // Green projectiles from healer attacking enemies

    function create(worldX, worldY, dx, dy, damage, target) {
        projectiles.push({
            worldX,
            worldY,
            dx,
            dy,
            speed: 5,
            damage,
            target,
            isPlayer: false
        });
    }

    function createArrow(worldX, worldY, dx, dy, damage) {
        arrows.push({
            worldX,
            worldY,
            dx,
            dy,
            speed: 10, // Arrows are faster
            damage,
            target: null,
            isPlayer: false
        });
    }

    function createHealProjectile(worldX, worldY, dx, dy, healAmount) {
        healProjectiles.push({
            worldX,
            worldY,
            dx,
            dy,
            speed: 6, // Slower, more visible
            healAmount,
            target: null,
            isPlayer: false,
            isHeal: true
        });
    }

    function createDamageProjectile(worldX, worldY, dx, dy, damage) {
        damageProjectiles.push({
            worldX,
            worldY,
            dx,
            dy,
            speed: 8,
            damage,
            target: null,
            isPlayer: true, // Created by player
            isDamage: true
        });
    }

    function update() {
        // Update ally projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            
            proj.worldX += proj.dx * proj.speed;
            proj.worldY += proj.dy * proj.speed;
            
            // Check hit
            if (proj.target && proj.target.hp > 0) {
                const dx = proj.target.worldX - proj.worldX;
                const dy = proj.target.worldY - proj.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 20) {
                    proj.target.hp -= proj.damage;
                    projectiles.splice(i, 1);
                    continue;
                }
            }
            
            // Remove projectiles off screen
            const world = Player.getWorldOffset();
            const canvas = document.getElementById('gameCanvas');
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;
            
            if (screenX < -50 || screenX > canvas.width + 50 ||
                screenY < -50 || screenY > canvas.height + 50) {
                projectiles.splice(i, 1);
            }
        }

        // Update arrows
        for (let i = arrows.length - 1; i >= 0; i--) {
            const proj = arrows[i];

            proj.worldX += proj.dx * proj.speed;
            proj.worldY += proj.dy * proj.speed;

            // Check collision with enemies
            const enemies = Units.getEnemies();
            let hit = false;

            enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;

                const dx = enemy.worldX - proj.worldX;
                const dy = enemy.worldY - proj.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 30) { // Slightly larger hitbox for arrows
                    enemy.hp -= proj.damage;
                    Audio.playSound('hit');
                    hit = true;
                }
            });

            if (hit) {
                arrows.splice(i, 1);
                continue;
            }
            
            // Remove arrows off screen
            const world = Player.getWorldOffset();
            const canvas = document.getElementById('gameCanvas');
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;
            
            if (screenX < -50 || screenX > canvas.width + 50 ||
                screenY < -50 || screenY > canvas.height + 50) {
                arrows.splice(i, 1);
            }
        }

        // Update heal projectiles
        for (let i = healProjectiles.length - 1; i >= 0; i--) {
            const proj = healProjectiles[i];

            proj.worldX += proj.dx * proj.speed;
            proj.worldY += proj.dy * proj.speed;

            // Check collision with all players
            let healed = false;
            const players = Player.getAllPlayers();

            players.forEach(target => {
                if (target.hp <= 0 || target.hp >= target.maxHp) return;

                const dx = target.worldX - proj.worldX;
                const dy = target.worldY - proj.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 35) { // Larger healing radius
                    target.hp = Math.min(target.hp + proj.healAmount, target.maxHp);
                    Audio.playSound('heal');
                    healed = true;
                }
            });

            if (healed) {
                healProjectiles.splice(i, 1);
                continue;
            }

            // Remove heal projectiles off screen
            const world = Player.getWorldOffset();
            const canvas = document.getElementById('gameCanvas');
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;

            if (screenX < -50 || screenX > canvas.width + 50 ||
                screenY < -50 || screenY > canvas.height + 50) {
                healProjectiles.splice(i, 1);
            }
        }

        // Update damage projectiles (healer's green projectiles attacking enemies)
        for (let i = damageProjectiles.length - 1; i >= 0; i--) {
            const proj = damageProjectiles[i];

            proj.worldX += proj.dx * proj.speed;
            proj.worldY += proj.dy * proj.speed;

            // Check collision with enemies
            const enemies = Units.getEnemies();
            let hit = false;

            enemies.forEach(enemy => {
                if (enemy.hp <= 0) return;

                const dx = enemy.worldX - proj.worldX;
                const dy = enemy.worldY - proj.worldY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 25) {
                    enemy.hp -= proj.damage;
                    hit = true;
                }
            });

            if (hit) {
                damageProjectiles.splice(i, 1);
                continue;
            }

            // Remove damage projectiles off screen
            const world = Player.getWorldOffset();
            const canvas = document.getElementById('gameCanvas');
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;

            if (screenX < -50 || screenX > canvas.width + 50 ||
                screenY < -50 || screenY > canvas.height + 50) {
                damageProjectiles.splice(i, 1);
            }
        }
    }

    function getAll() {
        return projectiles;
    }

    function getArrows() {
        return arrows;
    }

    function getHealProjectiles() {
        return healProjectiles;
    }

    function getDamageProjectiles() {
        return damageProjectiles;
    }

    function reset() {
        projectiles = [];
        arrows = [];
        healProjectiles = [];
        damageProjectiles = [];
    }

    return {
        create,
        createArrow,
        createHealProjectile,
        createDamageProjectile,
        update,
        getAll,
        getArrows,
        getHealProjectiles,
        getDamageProjectiles,
        reset
    };
})();

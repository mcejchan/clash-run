// Projectile system for ClashRun
const Projectiles = (function() {
    let projectiles = [];

    function create(worldX, worldY, dx, dy, damage, target) {
        projectiles.push({
            worldX,
            worldY,
            dx,
            dy,
            speed: 5,
            damage,
            target
        });
    }

    function update() {
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
    }

    function getAll() {
        return projectiles;
    }

    return {
        create,
        update,
        getAll
    };
})();

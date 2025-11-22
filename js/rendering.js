// Rendering system for ClashRun
const Rendering = (function() {
    let canvas;
    let ctx;

    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawGrid() {
        const world = Player.getWorldOffset();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        const gridSize = Config.get('map.gridSize');
        
        for (let x = -world.offsetX % gridSize; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = -world.offsetY % gridSize; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function drawHealthBar(screenX, screenY, hp, maxHp, width) {
        const barWidth = width;
        const barHeight = 5;
        const barY = screenY - 35;
        
        // Background
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);
        
        // Current health
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(screenX - barWidth / 2, barY, (hp / maxHp) * barWidth, barHeight);
    }

    function drawPlayer() {
        const player = Player.getPlayer();
        ctx.fillStyle = player.color;
        ctx.fillRect(
            player.x - player.width / 2,
            player.y - player.height / 2,
            player.width,
            player.height
        );
        
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(player.x, player.y - player.height / 2 - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(player.x - 5, player.y - player.height / 2 - 12, 4, 0, Math.PI * 2);
        ctx.arc(player.x + 5, player.y - player.height / 2 - 12, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(player.x - 5, player.y - player.height / 2 - 12, 2, 0, Math.PI * 2);
        ctx.arc(player.x + 5, player.y - player.height / 2 - 12, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawRobot(enemy) {
        const world = Player.getWorldOffset();
        const screenX = enemy.worldX - world.offsetX + canvas.width / 2;
        const screenY = enemy.worldY - world.offsetY + canvas.height / 2;
        
        // Robot body
        ctx.fillStyle = enemy.isAttacking ? '#c0392b' : (enemy.isSlow ? '#7f8c8d' : enemy.color);
        ctx.fillRect(
            screenX - enemy.width / 2,
            screenY - enemy.height / 2,
            enemy.width,
            enemy.height
        );
        
        // Robot head (square)
        ctx.fillStyle = '#34495e';
        ctx.fillRect(
            screenX - 15,
            screenY - enemy.height / 2 - 20,
            30,
            20
        );
        
        // Eyes (red LED - danger sign)
        ctx.fillStyle = enemy.isAttacking ? '#ff0000' : (enemy.isSlow ? '#e67e22' : '#e74c3c');
        ctx.fillRect(screenX - 10, screenY - enemy.height / 2 - 15, 6, 6);
        ctx.fillRect(screenX + 4, screenY - enemy.height / 2 - 15, 6, 6);
        
        // Antenna
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - enemy.height / 2 - 20);
        ctx.lineTo(screenX, screenY - enemy.height / 2 - 30);
        ctx.stroke();
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(screenX, screenY - enemy.height / 2 - 30, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Attack effect
        if (enemy.isAttacking) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(screenX, screenY, enemy.attackRange / 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Health
        drawHealthBar(screenX, screenY, enemy.hp, enemy.maxHp, enemy.width);
    }

    function drawArcher(ally) {
        const world = Player.getWorldOffset();
        const screenX = ally.worldX - world.offsetX + canvas.width / 2;
        const screenY = ally.worldY - world.offsetY + canvas.height / 2;
        
        if (ally.hp <= 0) return;
        
        // Body
        ctx.fillStyle = ally.color;
        ctx.fillRect(
            screenX - ally.width / 2,
            screenY - ally.height / 2,
            ally.width,
            ally.height
        );
        
        // Head
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(screenX, screenY - ally.height / 2 - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Bow
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX + 20, screenY, 15, -Math.PI / 2, Math.PI / 2, false);
        ctx.stroke();
        
        // Arrow
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX + 20, screenY);
        ctx.lineTo(screenX + 35, screenY);
        ctx.stroke();
        
        // Health
        drawHealthBar(screenX, screenY, ally.hp, ally.maxHp, ally.width);
    }

    function drawHealer(ally) {
        const world = Player.getWorldOffset();
        const screenX = ally.worldX - world.offsetX + canvas.width / 2;
        const screenY = ally.worldY - world.offsetY + canvas.height / 2;
        
        if (ally.hp <= 0) return;
        
        // Body
        ctx.fillStyle = ally.color;
        ctx.fillRect(
            screenX - ally.width / 2,
            screenY - ally.height / 2,
            ally.width,
            ally.height
        );
        
        // Head
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(screenX, screenY - ally.height / 2 - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Cross
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(screenX - 8, screenY - 5, 16, 5);
        ctx.fillRect(screenX - 2.5, screenY - 11, 5, 16);
        
        // Healing effect
        if (ally.healTimer > 0) {
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 30, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Health
        drawHealthBar(screenX, screenY, ally.hp, ally.maxHp, ally.width);
    }

    function drawProjectiles() {
        const projectiles = Projectiles.getAll();
        const world = Player.getWorldOffset();
        
        projectiles.forEach(proj => {
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;

            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawObstacles() {
        const obstacles = Obstacles.getAll();
        const world = Player.getWorldOffset();
        
        obstacles.forEach(obstacle => {
            const screenX = obstacle.worldX - world.offsetX + canvas.width / 2;
            const screenY = obstacle.worldY - world.offsetY + canvas.height / 2;

            // Obstacle body
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(
                screenX - obstacle.width / 2,
                screenY - obstacle.height / 2,
                obstacle.width,
                obstacle.height
            );

            // Border
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                screenX - obstacle.width / 2,
                screenY - obstacle.height / 2,
                obstacle.width,
                obstacle.height
            );
        });
    }

    function render() {
        clear();
        drawGrid();
        drawObstacles();
        drawProjectiles();

        const enemies = Units.getEnemies();
        const allies = Units.getAllies();
        
        // Draw units
        enemies.forEach(enemy => drawRobot(enemy));
        allies.forEach((ally, index) => {
            if (index === 0) drawArcher(ally);
            else drawHealer(ally);
        });

        drawPlayer();
    }

    return {
        init,
        render
    };
})();

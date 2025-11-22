// Rendering system for ClashRun
const Rendering = (function() {
    let canvas;
    let ctx;
    let minimap1Canvas, minimap2Canvas;
    let minimap1Ctx, minimap2Ctx;
    let minimap1CtxCreated = false, minimap2CtxCreated = false;

    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');

        // Create mini-map canvases
        minimap1Canvas = document.createElement('canvas');
        minimap2Canvas = document.createElement('canvas');
        
        minimap1Canvas.width = 120;
        minimap1Canvas.height = 80;
        minimap2Canvas.width = 120;
        minimap2Canvas.height = 80;
        
        // Add mini-maps to DOM
        minimap1Canvas.id = 'minimap1';
        minimap2Canvas.id = 'minimap2';
        minimap1Canvas.className = 'minimap';
        minimap2Canvas.className = 'minimap';
        
        const infoDiv = document.getElementById('info');
        if (infoDiv) {
            infoDiv.appendChild(minimap1Canvas);
            infoDiv.appendChild(minimap2Canvas);
        }
        
        minimap1Ctx = minimap1Canvas.getContext('2d');
        minimap2Ctx = minimap2Canvas.getContext('2d');
        minimap1CtxCreated = true;
        minimap2CtxCreated = true;
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
        const world = Player.getWorldOffset();
        const screenX = player.worldX - world.offsetX + canvas.width / 2;
        const screenY = player.worldY - world.offsetY + canvas.height / 2;
        
        if (player.hp <= 0) return;
        
        // Body (green for archer)
        ctx.fillStyle = player.color;
        ctx.fillRect(
            screenX - player.width / 2,
            screenY - player.height / 2,
            player.width,
            player.height
        );
        
        // Head
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(screenX, screenY - player.height / 2 - 10, 12, 0, Math.PI * 2);
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
        drawHealthBar(screenX, screenY, player.hp, player.maxHp, player.width);
    }

    function drawPlayer2() {
        const player2 = Player.getPlayer2();
        const world = Player.getWorldOffset();
        const screenX = player2.worldX - world.offsetX + canvas.width / 2;
        const screenY = player2.worldY - world.offsetY + canvas.height / 2;
        
        if (player2.hp <= 0) return;
        
        // Body (purple for healer)
        ctx.fillStyle = player2.color;
        ctx.fillRect(
            screenX - player2.width / 2,
            screenY - player2.height / 2,
            player2.width,
            player2.height
        );
        
        // Head
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(screenX, screenY - player2.height / 2 - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Medical cross
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(screenX - 8, screenY - 5, 16, 5);
        ctx.fillRect(screenX - 2.5, screenY - 11, 5, 16);
        
        // Health
        drawHealthBar(screenX, screenY, player2.hp, player2.maxHp, player2.width);
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
        const arrows = Projectiles.getArrows();
        const healProjectiles = Projectiles.getHealProjectiles();
        const world = Player.getWorldOffset();
        
        // Draw ally projectiles
        projectiles.forEach(proj => {
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;

            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw arrows (distinct appearance)
        arrows.forEach(proj => {
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;

            // Arrow shaft
            ctx.strokeStyle = '#8e44ad';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(screenX - proj.dx * 10, screenY - proj.dy * 10);
            ctx.lineTo(screenX + proj.dx * 10, screenY + proj.dy * 10);
            ctx.stroke();
            
            // Arrow head
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX - proj.dx * 8 - proj.dy * 4, screenY - proj.dy * 8 + proj.dx * 4);
            ctx.lineTo(screenX - proj.dx * 8 + proj.dy * 4, screenY - proj.dy * 8 - proj.dx * 4);
            ctx.closePath();
            ctx.fill();
        });

        // Draw heal projectiles (green, glowing effect)
        healProjectiles.forEach(proj => {
            const screenX = proj.worldX - world.offsetX + canvas.width / 2;
            const screenY = proj.worldY - world.offsetY + canvas.height / 2;

            // Glowing effect
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath();
            ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Core projectile
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#27ae60';
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Plus sign for healing
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX - 3, screenY);
            ctx.lineTo(screenX + 3, screenY);
            ctx.moveTo(screenX, screenY - 3);
            ctx.lineTo(screenX, screenY + 3);
            ctx.stroke();
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
        
        // Draw enemies
        enemies.forEach(enemy => drawRobot(enemy));
        
        // Draw all players
        drawPlayer();
        drawPlayer2();

        // Draw mini-maps
        drawMiniMaps();
    }

    function drawMiniMaps() {
        if (!minimap1CtxCreated || !minimap2CtxCreated) return;

        const player1 = Player.getPlayer();
        const player2 = Player.getPlayer2();
        const world = Player.getWorldOffset();

        // Draw mini-map 1 (for player 1)
        drawMinimap(minimap1Ctx, minimap1Canvas, player1, player2, world);
        
        // Draw mini-map 2 (for player 2)
        drawMinimap(minimap2Ctx, minimap2Canvas, player2, player1, world);
    }

    function drawMinimap(ctx, minimapCanvas, currentPlayer, otherPlayer, world) {
        const minimapScale = 0.15; // Scale factor for mini-map
        const minimapRange = 300; // World space range shown on mini-map
        
        // Clear mini-map
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < minimapCanvas.width; x += 10) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, minimapCanvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < minimapCanvas.height; y += 10) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(minimapCanvas.width, y);
            ctx.stroke();
        }

        // Draw enemies
        const enemies = Units.getEnemies();
        enemies.forEach(enemy => {
            if (enemy.hp <= 0) return;
            
            const dx = enemy.worldX - currentPlayer.worldX;
            const dy = enemy.worldY - currentPlayer.worldY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minimapRange) {
                const minimapX = minimapCanvas.width / 2 + (dx * minimapScale);
                const minimapY = minimapCanvas.height / 2 + (dy * minimapScale);
                
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(minimapX, minimapY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw projectiles
        const arrows = Projectiles.getArrows();
        const healProjectiles = Projectiles.getHealProjectiles();
        const allProjectiles = [...arrows, ...healProjectiles];
        
        allProjectiles.forEach(proj => {
            const dx = proj.worldX - currentPlayer.worldX;
            const dy = proj.worldY - currentPlayer.worldY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minimapRange) {
                const minimapX = minimapCanvas.width / 2 + (dx * minimapScale);
                const minimapY = minimapCanvas.height / 2 + (dy * minimapScale);
                
                if (proj.isHeal) {
                    ctx.fillStyle = '#2ecc71';
                } else {
                    ctx.fillStyle = '#9b59b6';
                }
                ctx.beginPath();
                ctx.arc(minimapX, minimapY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw current player (always in center)
        ctx.fillStyle = '#27ae60'; // Green for player 1
        ctx.beginPath();
        ctx.arc(minimapCanvas.width / 2, minimapCanvas.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw other player
        if (otherPlayer && otherPlayer.hp > 0) {
            const dx = otherPlayer.worldX - currentPlayer.worldX;
            const dy = otherPlayer.worldY - currentPlayer.worldY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minimapRange) {
                const minimapX = minimapCanvas.width / 2 + (dx * minimapScale);
                const minimapY = minimapCanvas.height / 2 + (dy * minimapScale);
                
                ctx.fillStyle = '#8e44ad'; // Purple for player 2
                ctx.beginPath();
                ctx.arc(minimapX, minimapY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw range indicator (visibility circle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(minimapCanvas.width / 2, minimapCanvas.height / 2, minimapRange * minimapScale, 0, Math.PI * 2);
        ctx.stroke();
    }

    return {
        init,
        render
    };
})();

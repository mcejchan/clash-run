// Obstacle system for ClashRun
const Obstacles = (function() {
    let obstacles = [];

    function generateObstacles(allies, enemies) {
        obstacles = [];
        
        const minObstacles = Config.get('obstacles.count.min');
        const maxObstacles = Config.get('obstacles.count.max');
        const obstacleCount = Math.floor(Math.random() * (maxObstacles - minObstacles + 1)) + minObstacles;
        
        const mapWidth = Config.get('map.worldWidth');
        const mapHeight = Config.get('map.worldHeight');
        const minWidth = Config.get('obstacles.minWidth');
        const maxWidth = Config.get('obstacles.maxWidth');
        const minHeight = Config.get('obstacles.minHeight');
        const maxHeight = Config.get('obstacles.maxHeight');
        const minDistance = Config.get('obstacles.minDistance');
        const minDistanceFromUnits = Config.get('obstacles.minDistanceFromUnits');
        const color = Config.get('obstacles.color');

        for (let i = 0; i < obstacleCount; i++) {
            let obstacle;
            let valid = true;

            do {
                valid = true;
                obstacle = {
                    worldX: Math.random() * mapWidth - (mapWidth / 2),
                    worldY: Math.random() * mapHeight - (mapHeight / 2),
                    width: minWidth + Math.random() * (maxWidth - minWidth),
                    height: minHeight + Math.random() * (maxHeight - minHeight),
                    color: color
                };

                // Check distance from other obstacles
                for (let obstacle2 of obstacles) {
                    const dx = obstacle.worldX - obstacle2.worldX;
                    const dy = obstacle.worldY - obstacle2.worldY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDistance) {
                        valid = false;
                        break;
                    }
                }

                // Check distance from allies
                if (valid) {
                    for (let ally of allies) {
                        const dx = obstacle.worldX - ally.worldX;
                        const dy = obstacle.worldY - ally.worldY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDistanceFromUnits) {
                            valid = false;
                            break;
                        }
                    }
                }

                // Check distance from enemies
                if (valid) {
                    for (let enemy of enemies) {
                        const dx = obstacle.worldX - enemy.worldX;
                        const dy = obstacle.worldY - enemy.worldY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDistanceFromUnits) {
                            valid = false;
                            break;
                        }
                    }
                }
            } while (!valid);

            obstacles.push(obstacle);
        }
    }

    function checkCollisionWithObstacles(x, y, radius) {
        for (let obstacle of obstacles) {
            // Closest point on rectangle to entity
            const closestX = Math.max(obstacle.worldX - obstacle.width / 2,
                                     Math.min(x, obstacle.worldX + obstacle.width / 2));
            const closestY = Math.max(obstacle.worldY - obstacle.height / 2,
                                     Math.min(y, obstacle.worldY + obstacle.height / 2));

            const dx = x - closestX;
            const dy = y - closestY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                return true; // Collision detected
            }
        }
        return false;
    }

    function getAll() {
        return obstacles;
    }

    return {
        generateObstacles,
        checkCollisionWithObstacles,
        getAll
    };
})();

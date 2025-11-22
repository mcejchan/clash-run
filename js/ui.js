// UI system for ClashRun
const UI = (function() {
    function update() {
        const allies = Units.getAllies();
        const enemies = Units.getEnemies();
        const world = Player.getWorldOffset();

        document.getElementById('archer-hp').textContent = Math.max(0, allies[0].hp);
        document.getElementById('healer-hp').textContent = Math.max(0, allies[1].hp);
        document.getElementById('robot-hp').textContent = Math.max(0, enemies[0].hp);
        document.getElementById('position').textContent = 
            `${Math.round(world.offsetX)}, ${Math.round(world.offsetY)}`;
    }

    return {
        update
    };
})();

// UI system for ClashRun
const UI = (function() {
    function update() {
        const enemies = Units.getEnemies();
        const world = Player.getWorldOffset();

        const player1 = Player.getPlayer();
        const player2 = Player.getPlayer2();

        // Update position
        document.getElementById('position').textContent = 
            `${Math.round(world.offsetX)}, ${Math.round(world.offsetY)}`;
        
        // Update robot HP
        document.getElementById('robot-hp').textContent = Math.max(0, enemies[0].hp);
        
        // Update UI for all players
        updatePlayerUI();
    }

    function updatePlayerUI() {
        const player1 = Player.getPlayer();
        const player2 = Player.getPlayer2();

        // Update or create player UI elements
        let playerStatsDiv = document.getElementById('player-stats');
        if (!playerStatsDiv) {
            playerStatsDiv = document.createElement('div');
            playerStatsDiv.id = 'player-stats';
            playerStatsDiv.innerHTML = `
                <div style="margin-top: 10px; border-top: 1px solid #555; padding-top: 10px;">
                    <strong style="color: #27ae60;">🏹 Hráč 1 (Lukostřelec):</strong> <span id="player1-hp">100</span> HP<br>
                    <strong style="color: #8e44ad;">💚 Hráč 2 (Lékař):</strong> <span id="player2-hp">80</span> HP<br>
                    <div style="margin-top: 5px; font-size: 12px;">
                        <span id="player1-cooldown">[MEZERNÍK] Hotov</span> | 
                        <span id="player2-cooldown">[Y] Hotov</span>
                    </div>
                </div>
            `;
            
            const infoDiv = document.getElementById('info');
            if (infoDiv) {
                infoDiv.appendChild(playerStatsDiv);
            }
        }

        // Update HP displays
        const player1HpEl = document.getElementById('player1-hp');
        const player2HpEl = document.getElementById('player2-hp');

        if (player1HpEl) player1HpEl.textContent = Math.max(0, player1.hp);
        if (player2HpEl) player2HpEl.textContent = Math.max(0, player2.hp);

        // Update cooldown displays
        updateCooldownDisplays();
    }

    function updateCooldownDisplays() {
        const cooldown1 = Player.getShootCooldown();
        const cooldown2 = Player.getShootCooldown2();

        const cooldown1El = document.getElementById('player1-cooldown');
        const cooldown2El = document.getElementById('player2-cooldown');

        if (cooldown1El) {
            if (cooldown1 > 0) {
                cooldown1El.textContent = `[MEZERNÍK] ${Math.ceil(cooldown1 / 60)}s`;
                cooldown1El.style.color = '#e74c3c';
            } else {
                cooldown1El.textContent = '[MEZERNÍK] Hotov';
                cooldown1El.style.color = '#2ecc71';
            }
        }

        if (cooldown2El) {
            if (cooldown2 > 0) {
                cooldown2El.textContent = `[Y] ${Math.ceil(cooldown2 / 60)}s`;
                cooldown2El.style.color = '#e74c3c';
            } else {
                cooldown2El.textContent = '[Y] Hotov';
                cooldown2El.style.color = '#2ecc71';
            }
        }
    }

    function init() {
        // Initialize UI elements
    }

    return {
        update,
        init,
        updatePlayerUI,
        updateCooldownDisplays
    };
})();

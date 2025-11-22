// UI system for ClashRun
const UI = (function() {
    function update() {
        const allies = Units.getAllies();
        const enemies = Units.getEnemies();
        const world = Player.getWorldOffset();

        const player1 = Player.getPlayer();
        const player2 = Player.getPlayer2();
        const player3 = Player.getPlayer3();

        // Update existing UI for allies and robot
        document.getElementById('archer-hp').textContent = Math.max(0, allies[0].hp);
        document.getElementById('healer-hp').textContent = Math.max(0, allies[1].hp);
        document.getElementById('robot-hp').textContent = Math.max(0, enemies[0].hp);
        document.getElementById('position').textContent = 
            `${Math.round(world.offsetX)}, ${Math.round(world.offsetY)}`;
        
        // Update shoot button for player 1
        const shootButton = document.getElementById('shoot-button');
        if (shootButton) {
            const cooldown = Player.getShootCooldown();
            
            if (cooldown > 0) {
                shootButton.disabled = true;
                shootButton.classList.add('on-cooldown');
                shootButton.textContent = `COOLDOWN ${Math.ceil(cooldown / 60)}s`;
            } else {
                shootButton.disabled = false;
                shootButton.classList.remove('on-cooldown');
                shootButton.textContent = 'STŘÍLIT [MEZERNÍK]';
            }
        }

        // Update UI for all players
        updatePlayerUI();
    }

    function updatePlayerUI() {
        const player1 = Player.getPlayer();
        const player2 = Player.getPlayer2();
        const player3 = Player.getPlayer3();

        // Update or create player UI elements
        let playerStatsDiv = document.getElementById('player-stats');
        if (!playerStatsDiv) {
            playerStatsDiv = document.createElement('div');
            playerStatsDiv.id = 'player-stats';
            playerStatsDiv.innerHTML = `
                <div style="margin-top: 10px; border-top: 1px solid #555; padding-top: 10px;">
                    <strong style="color: #3498db;">🎮 Hráč 1:</strong> <span id="player1-hp">100</span> HP<br>
                    <strong style="color: #27ae60;">🏹 Hráč 2 (Lukostřelec):</strong> <span id="player2-hp">100</span> HP<br>
                    <strong style="color: #8e44ad;">💚 Hráč 3 (Lékař):</strong> <span id="player3-hp">80</span> HP<br>
                    <div style="margin-top: 5px; font-size: 12px;">
                        <span id="player1-cooldown">[MEZERNÍK] Hotov</span> | 
                        <span id="player2-cooldown">[U] Hotov</span> | 
                        <span id="player3-cooldown">[Y] Hotov</span>
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
        const player3HpEl = document.getElementById('player3-hp');

        if (player1HpEl) player1HpEl.textContent = Math.max(0, player1.hp);
        if (player2HpEl) player2HpEl.textContent = Math.max(0, player2.hp);
        if (player3HpEl) player3HpEl.textContent = Math.max(0, player3.hp);

        // Update cooldown displays
        updateCooldownDisplays();
    }

    function updateCooldownDisplays() {
        const cooldown1 = Player.getShootCooldown();
        const cooldown2 = Player.getShootCooldown2();
        const cooldown3 = Player.getShootCooldown3();

        const cooldown1El = document.getElementById('player1-cooldown');
        const cooldown2El = document.getElementById('player2-cooldown');
        const cooldown3El = document.getElementById('player3-cooldown');

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
                cooldown2El.textContent = `[U] ${Math.ceil(cooldown2 / 60)}s`;
                cooldown2El.style.color = '#e74c3c';
            } else {
                cooldown2El.textContent = '[U] Hotov';
                cooldown2El.style.color = '#2ecc71';
            }
        }

        if (cooldown3El) {
            if (cooldown3 > 0) {
                cooldown3El.textContent = `[Y] ${Math.ceil(cooldown3 / 60)}s`;
                cooldown3El.style.color = '#e74c3c';
            } else {
                cooldown3El.textContent = '[Y] Hotov';
                cooldown3El.style.color = '#2ecc71';
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

// Shop UI system for ClashRun
const ShopUI = (function() {
    let isShopOpen = false;

    function init() {
        // Reset shop state for new game
        isShopOpen = false;

        const playAgainButton = document.getElementById('play-again-button');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', playAgain);
        }
    }

    function renderShop() {
        if (isShopOpen) return;

        const modal = document.getElementById('shop-modal');
        if (!modal) return;

        // Show game over message
        renderGameOverDisplay();

        // Render skins
        renderSkinsSection();

        // Render upgrades
        renderUpgradesSection();

        // Update coins display
        updateCoinsDisplay();

        // Show modal
        modal.classList.add('show');
        isShopOpen = true;
    }

    function renderGameOverDisplay() {
        const container = document.getElementById('game-over-display');
        if (!container) return;

        const coinsEarned = Shop.COINS_PER_GAME;
        const totalCoins = Shop.getTotalCoins();

        const html = `
            <div class="game-over-section">
                <h2>💀 Konec Hry!</h2>
                <div class="game-over-stats">
                    <div class="stat-box">
                        <div class="stat-label">Mince z hry</div>
                        <div class="stat-value">+${coinsEarned}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Celkem mincí</div>
                        <div class="stat-value">${totalCoins}</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    function renderSkinsSection() {
        const container = document.getElementById('skins-list');
        if (!container) return;

        const skins = Shop.getShopItems().skins;
        let html = '';

        skins.forEach(skin => {
            const isOwned = Shop.isItemOwned(skin.id);
            const isSelected = Shop.getSelectedSkin(skin.character) === skin.id;

            const ownedClass = isOwned ? 'owned' : '';
            const selectedClass = isSelected ? 'selected' : '';

            html += `
                <div class="shop-item ${ownedClass} ${selectedClass}">
                    <h3>${skin.name}</h3>
                    <p class="description">${skin.description}</p>
                    <div class="price">${isOwned ? '✓ Vlastněno' : skin.price + ' 💰'}</div>
                    ${isOwned && !isSelected ? `<button data-action="select-skin" data-id="${skin.id}" data-character="${skin.character}">Vybrat</button>` : ''}
                    ${!isOwned ? `<button data-action="purchase" data-id="${skin.id}" ${isOwned ? 'disabled' : ''}>Koupit</button>` : ''}
                    ${isSelected ? '<div style="color: #2ecc71; font-weight: bold; margin-top: 10px;">✓ Vybraný</div>' : ''}
                </div>
            `;
        });

        container.innerHTML = html;
        attachEventListeners();
    }

    function renderUpgradesSection() {
        const container = document.getElementById('upgrades-list');
        if (!container) return;

        const upgrades = Shop.getShopItems().upgrades;
        let html = '';

        upgrades.forEach(upgrade => {
            const isOwned = Shop.isItemOwned(upgrade.id);
            const ownedClass = isOwned ? 'owned' : '';

            html += `
                <div class="shop-item ${ownedClass}">
                    <h3>${upgrade.name}</h3>
                    <p class="description">${upgrade.description}</p>
                    <div class="price">${isOwned ? '✓ Vlastněno' : upgrade.price + ' 💰'}</div>
                    ${!isOwned ? `<button data-action="purchase" data-id="${upgrade.id}" ${isOwned ? 'disabled' : ''}>Koupit</button>` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
        attachEventListeners();
    }

    function updateCoinsDisplay() {
        const display = document.getElementById('shop-coins-display');
        if (display) {
            display.textContent = Shop.getTotalCoins();
        }

        const infoDisplay = document.getElementById('total-coins');
        if (infoDisplay) {
            infoDisplay.textContent = Shop.getTotalCoins();
        }
    }

    function purchaseItem(itemId) {
        const allItems = [...Shop.getShopItems().skins, ...Shop.getShopItems().upgrades];
        const item = allItems.find(i => i.id === itemId);
        const currentCoins = Shop.getTotalCoins();

        const success = Shop.purchaseItem(itemId);
        if (success) {
            // Re-render shop
            renderShop();
        } else {
            if (!item) {
                alert('Položka nebyla nalezena!');
            } else if (Shop.isItemOwned(itemId)) {
                alert('Tuto položku již vlastníš!');
            } else {
                alert(`Nemáš dost mincí!\nMáš: ${currentCoins} 💰\nPotřebuješ: ${item.price} 💰\nChybí ti: ${item.price - currentCoins} 💰`);
            }
        }
    }

    function selectSkin(itemId, character) {
        const success = Shop.selectSkin(itemId, character);
        if (success) {
            renderShop();
        }
    }

    function closeShop() {
        const modal = document.getElementById('shop-modal');
        if (modal) {
            modal.classList.remove('show');
            isShopOpen = false;
        }
    }

    function playAgain() {
        closeShop();
        // Reset game state and restart
        Shop.startNewGame();
        Shop.applyUpgrades();
        Game.restartGame();
    }

    function updateUIDisplay() {
        const totalCoinsEl = document.getElementById('total-coins');
        if (totalCoinsEl) {
            totalCoinsEl.textContent = Shop.getTotalCoins();
        }
    }

    function attachEventListeners() {
        const buttons = document.querySelectorAll('[data-action]');

        buttons.forEach(button => {
            button.removeEventListener('click', handleButtonClick);
            button.addEventListener('click', handleButtonClick);
        });
    }

    function handleButtonClick(event) {
        const button = event.target;
        const action = button.getAttribute('data-action');
        const id = button.getAttribute('data-id');
        const character = button.getAttribute('data-character');

        if (action === 'purchase') {
            purchaseItem(id);
        } else if (action === 'select-skin') {
            selectSkin(id, character);
        }
    }

    return {
        init,
        renderShop,
        closeShop,
        playAgain,
        purchaseItem,
        selectSkin,
        updateUIDisplay,
        attachEventListeners,
        handleButtonClick
    };
})();

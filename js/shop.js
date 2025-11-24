// Shop and progression system for ClashRun
const Shop = (function() {
    const STORAGE_KEY = 'clashrun_progress';
    const COINS_PER_GAME = 10;

    let gameState = {
        coins: 0,
        totalCoins: 0,
        gameActive: true,
        gameOverTime: 0,
        ownedSkins: [],
        upgrades: {},
        selectedSkins: {
            player1: 'default',
            player2: 'doctor'
        }
    };

    // Available shop items
    const SHOP_ITEMS = {
        skins: [
            {
                id: 'archer_ninja',
                name: 'Ninjský Lukostřelec',
                price: 125,
                type: 'skin',
                character: 'player1',
                description: 'Lukostřelec změní zbraň na shuriken'
            },
            {
                id: 'healer_doctor',
                name: 'Lékař Doktor',
                price: 125,
                type: 'skin',
                character: 'player2',
                description: 'Lékař s plnou lékařskou uniformou'
            }
        ],
        upgrades: [
            {
                id: 'archer_damage',
                name: 'Pokročilá Střelba',
                price: 150,
                type: 'upgrade',
                description: 'Zvýší poškození lukostřelce z 15 na 20',
                effect: { player: 'player1', stat: 'damage', value: 20 }
            },
            {
                id: 'healer_projectile_damage',
                name: 'Silná Injekce',
                price: 150,
                type: 'upgrade',
                description: 'Zvýší poškození léku z 15 na 20',
                effect: { player: 'player2', stat: 'projectileDamage', value: 20 }
            },
            {
                id: 'speed_boost',
                name: 'Posílená Tělo',
                price: 100,
                type: 'upgrade',
                description: 'Zvýší rychlost hráčů o 20%',
                effect: { stat: 'speedBoost', value: 1.2 }
            },
            {
                id: 'health_upgrade',
                name: 'Silné Tělo',
                price: 100,
                type: 'upgrade',
                description: 'Zvýší max HP hráčů o 20 bodů',
                effect: { stat: 'healthBoost', value: 20 }
            }
        ]
    };

    // Load game state from localStorage
    function loadProgress() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            gameState.totalCoins = data.totalCoins || 0;
            gameState.ownedSkins = data.ownedSkins || [];
            gameState.upgrades = data.upgrades || {};
            gameState.selectedSkins = data.selectedSkins || {
                player1: 'default',
                player2: 'doctor'
            };
        }
    }

    // Save game state to localStorage
    function saveProgress() {
        const data = {
            totalCoins: gameState.totalCoins,
            ownedSkins: gameState.ownedSkins,
            upgrades: gameState.upgrades,
            selectedSkins: gameState.selectedSkins
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Start new game
    function startNewGame() {
        gameState.coins = 0;
        gameState.gameActive = true;
        gameState.gameOverTime = 0;
        loadProgress(); // Load persistent upgrades and skins
    }

    // Mark game as over
    function endGame() {
        gameState.gameActive = false;
        gameState.gameOverTime = Date.now();
        // Award coins
        gameState.totalCoins += COINS_PER_GAME;
        saveProgress();
    }

    // Check if game is active
    function isGameActive() {
        return gameState.gameActive;
    }

    // Get current game coins
    function getCoins() {
        return gameState.coins;
    }

    // Get total coins
    function getTotalCoins() {
        return gameState.totalCoins;
    }

    // Purchase item
    function purchaseItem(itemId) {
        const allItems = [...SHOP_ITEMS.skins, ...SHOP_ITEMS.upgrades];
        const item = allItems.find(i => i.id === itemId);

        if (!item) return false;
        if (gameState.totalCoins < item.price) return false;

        // Check if already owned (for skins and one-time upgrades)
        if (item.type === 'skin' && gameState.ownedSkins.includes(itemId)) {
            return false;
        }

        // Purchase
        gameState.totalCoins -= item.price;

        if (item.type === 'skin') {
            gameState.ownedSkins.push(itemId);
        } else if (item.type === 'upgrade') {
            gameState.upgrades[itemId] = true;
        }

        saveProgress();
        applyUpgrades();
        return true;
    }

    // Check if item is owned
    function isItemOwned(itemId) {
        const item = [...SHOP_ITEMS.skins, ...SHOP_ITEMS.upgrades].find(i => i.id === itemId);
        if (!item) return false;

        if (item.type === 'skin') {
            return gameState.ownedSkins.includes(itemId);
        } else if (item.type === 'upgrade') {
            return gameState.upgrades[itemId] === true;
        }
        return false;
    }

    // Apply active upgrades to players
    function applyUpgrades() {
        const player1 = Player.getPlayer();
        const player2 = Player.getPlayer2();

        if (!player1 || !player2) return;

        // Reset to default values (stats only, not HP)
        player1.damage = 15;
        player1.speed = 3;
        player1.maxHp = 100;

        player2.healAmount = 15;
        player2.projectileDamage = 15;
        player2.speed = 2.5;
        player2.maxHp = 80;

        // Apply upgrades
        if (gameState.upgrades.archer_damage) {
            player1.damage = 20;
        }
        if (gameState.upgrades.healer_projectile_damage) {
            player2.projectileDamage = 20;
        }
        if (gameState.upgrades.speed_boost) {
            player1.speed *= 1.2;
            player2.speed *= 1.2;
        }
        if (gameState.upgrades.health_upgrade) {
            player1.maxHp = 120;
            player2.maxHp = 100;
        }

        // Restore HP to max on game start
        player1.hp = player1.maxHp;
        player2.hp = player2.maxHp;
    }

    // Select skin
    function selectSkin(itemId, character) {
        if (isItemOwned(itemId)) {
            gameState.selectedSkins[character] = itemId;
            saveProgress();
            return true;
        }
        return false;
    }

    // Get selected skin
    function getSelectedSkin(character) {
        return gameState.selectedSkins[character];
    }

    // Get all shop items
    function getShopItems() {
        return SHOP_ITEMS;
    }

    // Get game state for shop
    function getGameState() {
        return gameState;
    }

    // Initialize shop
    function init() {
        loadProgress();
        startNewGame();
    }

    return {
        init,
        startNewGame,
        endGame,
        isGameActive,
        getCoins,
        getTotalCoins,
        purchaseItem,
        isItemOwned,
        selectSkin,
        getSelectedSkin,
        applyUpgrades,
        getShopItems,
        getGameState,
        COINS_PER_GAME,
        loadProgress,
        saveProgress
    };
})();

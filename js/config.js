// Configuration manager for ClashRun
const Config = (function() {
    let CONFIG = {};

    // Default configuration fallback values
    const DEFAULT_CONFIG = {
        player: {
            width: 40,
            height: 50,
            speed: 4,
            color: '#e74c3c'
        },
        archer: {
            width: 35,
            height: 45,
            speed: 2.8,
            color: '#27ae60',
            hp: 100,
            maxHp: 100,
            attackCooldown: 60,
            attackRange: 200,
            damage: 15
        },
        healer: {
            width: 35,
            height: 45,
            speed: 3,
            color: '#3498db',
            hp: 80,
            maxHp: 80,
            healCooldown: 90,
            healAmount: 10
        },
        robot: {
            width: 45,
            height: 55,
            speed: 1.5,
            color: '#95a5a6',
            hp: 150,
            maxHp: 150,
            attackCooldown: 80,
            attackRange: 60,
            damage: 12,
            slowDownMinInterval: 100,
            slowDownMaxInterval: 300
        },
        obstacles: {
            count: {
                min: 15,
                max: 20
            },
            minWidth: 60,
            maxWidth: 100,
            minHeight: 60,
            maxHeight: 100,
            color: '#7f8c8d',
            minDistance: 200,
            minDistanceFromUnits: 250
        },
        map: {
            worldWidth: 2000,
            worldHeight: 2000,
            gridSize: 50
        },
        collision: {
            playerRadius: 20,
            allyRadius: 20,
            enemyRadius: 25
        }
    };

    function loadConfig() {
        // Start with default values
        CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

        // Try to load from config.properties
        try {
            fetch('config.properties')
                .then(response => response.text())
                .then(text => {
                    parseConfigText(text);
                    console.log('Config načten:', CONFIG);
                })
                .catch(error => {
                    console.warn('Config.properties nebyl nalezen, používám výchozí hodnoty:', error);
                });
        } catch (error) {
            console.warn('Chyba při načítání configu:', error);
        }
    }

    function parseConfigText(text) {
        const lines = text.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;

            const [key, value] = line.split('=');
            if (!key || !value) return;

            let parsedValue = value.trim();
            if (parsedValue === 'true') parsedValue = true;
            else if (parsedValue === 'false') parsedValue = false;
            else if (!isNaN(parsedValue) && parsedValue !== '') {
                parsedValue = parseFloat(parsedValue);
            }

            const keys = key.trim().split('.');
            let obj = CONFIG;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = parsedValue;
        });
    }

    function get(keyPath) {
        const keys = keyPath.split('.');
        let value = CONFIG;
        for (const key of keys) {
            if (value[key] === undefined) return undefined;
            value = value[key];
        }
        return value;
    }

    function getAll() {
        return CONFIG;
    }

    // Initialize configuration
    loadConfig();

    return {
        get,
        getAll
    };
})();

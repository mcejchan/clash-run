# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

ClashRun is a tactical strategy game built with HTML5 Canvas and vanilla JavaScript. No build system required.

### Quick Start

```bash
# Install dependencies
npm install

# Start development server (opens browser)
npm run dev

# Or start server without opening browser
npm start
```

The game will be available at `http://localhost:3000`

### Alternative Methods

```bash
# Serve with Python (if npm not available)
python3 -m http.server 3000
# Then navigate to http://localhost:3000

# Or open directly in browser
open index.html
```

## Project Structure

```
ClashRun/
├── .devcontainer/
│   └── devcontainer.json     # Dev container configuration
├── index.html                 # Game HTML, styling, and all game logic
├── package.json              # npm configuration
└── CLAUDE.md                 # This file
```

## Architecture Overview

ClashRun is a single-file HTML5 Canvas game where all code lives in `index.html`. The game implements a tactical combat system with a player-controlled camera, allied units, and enemy units.

### Game Systems

**Core Game Loop** (in `<script>`):
- Runs at 60 FPS using `requestAnimationFrame`
- Three phases per frame: update game state → render graphics → request next frame
- Input handling via `keydown`/`keyup` events

**Game State Objects**:
- `player`: Camera control character (always centered on screen)
- `world`: Camera offset state for infinite world effect
- `allies`: Array of friendly units (archer and healer) that follow the player
- `enemies`: Array of hostile units (robot) that pursue allies
- `projectiles`: Array of archer projectiles with collision detection

**World System**:
- Camera follows player movement (WASD/arrow keys)
- Units use `worldX`/`worldY` coordinates in infinite space
- Screen coordinates calculated as `worldPosition - cameraOffset + screenCenter`
- Grid overlay shows world position reference

**Unit AI**:
- **Allies**: Follow player, maintain formation, archer attacks enemies at range, healer restores health
- **Enemies**: Pathfind to nearest ally, attack when in range, periodically slow down
- Projectiles track targets and remove when hitting or leaving screen

**Rendering**:
- Grid background with camera offset
- Unit sprites drawn with health bars
- Projectiles rendered as simple circles
- UI overlay shows unit HP and player world position

## Editing Guidelines

### Adding New Features

1. **Game State**: Add new objects to the main script scope (e.g., `const items = []`)
2. **Update Logic**: Add to `update()` function to process state changes
3. **Rendering**: Add to `gameLoop()` or create helper draw functions
4. **UI**: Update the `#info` div or create new elements in the HTML

### Units and Sprites

Each unit has these core properties:
- `worldX`, `worldY`: Position in world space
- `width`, `height`: Collision/rendering dimensions
- `speed`: Movement speed per frame
- `hp`, `maxHp`: Health system
- `color`: Visual appearance

Draw functions (`drawArcher`, `drawHealer`, `drawRobot`) handle rendering with world-to-screen conversion.

### Modifying Combat

Combat values (damage, cooldown, range) are defined in unit object literals:
- Archer: `damage: 15`, `attackRange: 200`, `attackCooldown: 60`
- Healer: `healAmount: 10`, `healCooldown: 90`
- Robot: `damage: 12`, `attackRange: 60`, `attackCooldown: 80`

## Technical Notes

- **No build system or dependencies** - Pure HTML + vanilla JavaScript
- **Canvas dimensions**: 800x600 pixels (defined in `canvas.width`/`canvas.height`)
- **All code in one file**: Makes it simple but consider splitting into separate JS files if it grows
- **Czech language strings**: UI labels are in Czech (can be translated in HTML and variable names)

## Git Workflow

When committing changes:

```bash
git commit -m "Description of changes

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

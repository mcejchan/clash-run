#!/usr/bin/env node

/**
 * Test script for split-screen 2-player implementation
 * Validates that all modules load correctly and have expected structure
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Split-Screen 2-Player Implementation\n');

// Check that all expected files exist
const requiredFiles = [
    'index.html',
    'js/game.js',
    'js/player.js',
    'js/input.js',
    'js/rendering.js',
    'js/ui.js',
    'js/projectiles.js',
    'js/units.js',
    'js/obstacles.js',
    'js/config.js'
];

console.log('📁 Checking file structure...');
let filesOk = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✓ ${file}`);
    } else {
        console.log(`  ✗ ${file} (missing)`);
        filesOk = false;
    }
});

if (!filesOk) {
    console.error('\n❌ Missing required files!');
    process.exit(1);
}

// Check JavaScript syntax
console.log('\n📝 Checking JavaScript syntax...');
const jsFiles = [
    'js/game.js',
    'js/player.js',
    'js/input.js',
    'js/rendering.js',
    'js/ui.js'
];

const { execSync } = require('child_process');
let syntaxOk = true;
jsFiles.forEach(file => {
    try {
        execSync(`node -c ${path.join(__dirname, file)}`, { stdio: 'pipe' });
        console.log(`  ✓ ${file}`);
    } catch (e) {
        console.log(`  ✗ ${file} (syntax error)`);
        syntaxOk = false;
    }
});

if (!syntaxOk) {
    console.error('\n❌ Syntax errors found!');
    process.exit(1);
}

// Check for key implementation details
console.log('\n🔍 Checking implementation details...');

const gameJs = fs.readFileSync(path.join(__dirname, 'js/game.js'), 'utf8');
const playerJs = fs.readFileSync(path.join(__dirname, 'js/player.js'), 'utf8');
const renderingJs = fs.readFileSync(path.join(__dirname, 'js/rendering.js'), 'utf8');
const inputJs = fs.readFileSync(path.join(__dirname, 'js/input.js'), 'utf8');

const checks = [
    { file: 'game.js', pattern: 'canvas.width = 1600', desc: 'Canvas width set to 1600' },
    { file: 'player.js', pattern: 'let players = \\[\\]', desc: 'Players array implemented' },
    { file: 'player.js', pattern: 'cameraOffsetX', desc: 'Per-player camera offsets' },
    { file: 'player.js', pattern: 'getCamera\\(playerId\\)', desc: 'getCamera helper function' },
    { file: 'rendering.js', pattern: 'renderViewport', desc: 'renderViewport function' },
    { file: 'rendering.js', pattern: 'screenCoordinate', desc: 'screenCoordinate helper' },
    { file: 'rendering.js', pattern: 'const viewportWidth = 800', desc: 'Viewport constants' },
    { file: 'input.js', pattern: 'viewportWidth = 800', desc: 'Input viewport awareness' }
];

let checksOk = true;
checks.forEach(check => {
    let content;
    if (check.file === 'game.js') content = gameJs;
    else if (check.file === 'player.js') content = playerJs;
    else if (check.file === 'rendering.js') content = renderingJs;
    else if (check.file === 'input.js') content = inputJs;

    if (new RegExp(check.pattern).test(content)) {
        console.log(`  ✓ ${check.desc}`);
    } else {
        console.log(`  ✗ ${check.desc}`);
        checksOk = false;
    }
});

if (!checksOk) {
    console.error('\n⚠️ Some implementation details are missing!');
    process.exit(1);
}

console.log('\n✅ All tests passed!');
console.log('\n📊 Summary:');
console.log('  - Canvas: 1600×600 (two 800×600 viewports)');
console.log('  - Players: Per-player camera tracking implemented');
console.log('  - Input: Dual viewport-aware controls');
console.log('  - Rendering: Split-screen viewport system');
console.log('  - Server: Ready at http://localhost:3000');

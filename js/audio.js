// Audio system for ClashRun - generates sound effects using Web Audio API
const Audio = (function() {
    let audioContext;

    function init() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playSound(type) {
        if (!audioContext) init();

        try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);

            switch(type) {
                case 'shoot':
                    osc.frequency.value = 800;
                    osc.type = 'square';
                    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.1);
                    break;

                case 'hit':
                    osc.frequency.value = 200;
                    osc.type = 'sawtooth';
                    gain.gain.setValueAtTime(0.4, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.15);
                    break;

                case 'heal':
                    osc.frequency.value = 600;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.3);
                    break;

                case 'explosion':
                    osc.frequency.value = 100;
                    osc.type = 'sawtooth';
                    gain.gain.setValueAtTime(0.5, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.4);
                    break;

                case 'damage':
                    osc.frequency.value = 300;
                    osc.type = 'triangle';
                    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.2);
                    break;

                case 'win':
                    // Victory fanfare - multiple notes
                    [523, 659, 784, 1047].forEach((f, i) => {
                        const o = audioContext.createOscillator();
                        const g = audioContext.createGain();
                        o.connect(g);
                        g.connect(audioContext.destination);
                        o.frequency.value = f;
                        g.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
                        g.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                        o.start(audioContext.currentTime + i * 0.15);
                        o.stop(audioContext.currentTime + i * 0.15 + 0.3);
                    });
                    return;

                case 'lose':
                    osc.frequency.value = 400;
                    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                    osc.start();
                    osc.stop(audioContext.currentTime + 0.8);
                    break;
            }
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }

    return {
        init,
        playSound
    };
})();

// Initialize audio context on first user interaction
document.addEventListener('click', () => {
    Audio.init();
}, { once: true });

document.addEventListener('keydown', () => {
    Audio.init();
}, { once: true });

document.addEventListener('touchstart', () => {
    Audio.init();
}, { once: true });

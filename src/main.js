import { Engine } from './engine.js';
import { UI } from './ui.js';

const canvas = document.getElementById('main-canvas');
const engine = new Engine(canvas);
const ui = new UI(engine);

engine.init();
ui.init();

// High-performance render loop
function loop() {
    engine.render();
    requestAnimationFrame(loop);
}
loop();

export class UI {
    constructor(engine) {
        this.engine = engine;
        this.currentTool = 'move';
        this.isDrawing = false;
        this.lastPos = { x: 0, y: 0 };
        this.viewState = { zoom: 1, x: 0, y: 0 };
        
        this.init();
    }

    init() {
        // Toolbar
        const tools = {
            'tool-move': 'move',
            'tool-brush': 'brush',
            'tool-eraser': 'eraser',
            'tool-text': 'text'
        };
        
        Object.entries(tools).forEach(([id, tool]) => {
            document.getElementById(id).onclick = () => {
                this.currentTool = tool;
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                document.getElementById(id).classList.add('active');
            };
        });

        // Layers Panel
        document.getElementById('btn-add-layer').onclick = () => {
            this.engine.addLayer('New Layer');
            this.renderLayers();
        };
        document.getElementById('btn-del-layer').onclick = () => {
            this.engine.removeLayer(this.engine.doc.activeLayerIndex);
            this.renderLayers();
        };

        // File Menu
        document.getElementById('menu-open').onclick = () => document.getElementById('file-input').click();
        document.getElementById('file-input').onchange = async (e) => {
            await this.engine.loadImage(e.target.files[0]);
            this.renderLayers();
        };
        document.getElementById('menu-export').onclick = () => this.engine.export();

        // Workspace events
        const workspace = document.getElementById('workspace');
        const container = document.getElementById('canvas-container');
        const canvas = this.engine.canvas;

        workspace.onmousedown = (e) => {
            if (this.currentTool === 'move' && (e.button === 1 || e.shiftKey)) {
                this.isPanning = true;
                this.lastPos = { x: e.clientX, y: e.clientY };
                return;
            }
            
            const pos = this.screenToCanvas(e.clientX, e.clientY);
            const layer = this.engine.getActiveLayer();
            if (!layer) return;

            if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
                this.isDrawing = true;
                this.lastPos = pos;
                this.paint(pos, pos);
            }
        };

        window.onmousemove = (e) => {
            if (this.isPanning) {
                this.viewState.x += e.clientX - this.lastPos.x;
                this.viewState.y += e.clientY - this.lastPos.y;
                this.lastPos = { x: e.clientX, y: e.clientY };
                this.updateTransform();
            } else if (this.isDrawing) {
                const pos = this.screenToCanvas(e.clientX, e.clientY);
                this.paint(this.lastPos, pos);
                this.lastPos = pos;
            }
        };

        window.onmouseup = () => {
            this.isPanning = false;
            this.isDrawing = false;
        };

        workspace.onwheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.viewState.zoom *= delta;
            this.updateTransform();
        };

        this.centerCanvas();
        this.renderLayers();
        this.updateTransform();
    }

    screenToCanvas(clientX, clientY) {
        const rect = this.engine.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / this.viewState.zoom,
            y: (clientY - rect.top) / this.viewState.zoom
        };
    }

    paint(p1, p2) {
        const layer = this.engine.getActiveLayer();
        const ctx = layer.ctx;
        const color = document.getElementById('color-picker').value;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (this.currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        
        this.engine.render();
    }

    renderLayers() {
        const list = document.getElementById('layer-list');
        list.innerHTML = '';
        this.engine.doc.layers.slice().reverse().forEach((layer, i) => {
            const idx = this.engine.doc.layers.length - 1 - i;
            const div = document.createElement('div');
            div.className = `p-2 rounded text-xs cursor-pointer flex justify-between ${this.engine.doc.activeLayerIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`;
            div.innerHTML = `<span>${layer.name}</span>`;
            div.onclick = () => {
                this.engine.doc.activeLayerIndex = idx;
                this.renderLayers();
            };
            list.appendChild(div);
        });
    }

    centerCanvas() {
        const ws = document.getElementById('workspace');
        const rect = ws.getBoundingClientRect();
        this.viewState.x = (rect.width / 2) - (this.engine.doc.width / 2);
        this.viewState.y = (rect.height / 2) - (this.engine.doc.height / 2);
    }

    updateTransform() {
        const container = document.getElementById('canvas-container');
        container.style.transform = `translate(${this.viewState.x}px, ${this.viewState.y}px) scale(${this.viewState.zoom})`;
    }
}

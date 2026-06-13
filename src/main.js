import { Document } from './core/Document.js';
import { RasterLayer } from './core/Layer.js';
import { Renderer } from './core/Renderer.js';
import { HistoryManager } from './core/HistoryManager.js';
import { Workspace } from './ui/Workspace.js';
import { Toolbar } from './ui/Toolbar.js';
import { LayersPanel } from './ui/LayersPanel.js';
import { FileIO } from './utils/FileIO.js';
import { ToolManager } from './core/ToolManager.js';
import { ImageFilter } from './core/ImageFilter.js';
import { SelectionEngine } from './core/SelectionEngine.js';

class App {
    constructor() {
        // 1. Initialize Core Engine
        this.doc = new Document();
        this.history = new HistoryManager();
        this.selection = new SelectionEngine(this.doc);
        
        this.canvas = document.getElementById('main-canvas');
        this.canvas.width = this.doc.width;
        this.canvas.height = this.doc.height;
        
        this.renderer = new Renderer(this.canvas);
        this.transformLayer = null; // Layer currently in Ctrl+T mode
        
        // 2. Initialize UI
        this.workspace = new Workspace(this.canvas, document.getElementById('canvas-container'));
        this.toolbar = new Toolbar((tool) => console.log(`Tool switched to: ${tool}`));
        this.layersPanel = new LayersPanel(
            this.doc, 
            (index) => this.setActiveLayer(index),
            (id) => this.toggleLayerVisibility(id)
        );

        this.toolManager = new ToolManager(this);

        this.setupGlobalEvents();
        this.initDefaultDocument();
        this.centerCanvas();
        this.showToast("System Ready: Use Brush(B) to paint or Shift+Drag to pan");
        this.startRenderLoop();
    }

    centerCanvas() {
        const workspace = document.getElementById('workspace');
        const rect = workspace.getBoundingClientRect();
        this.workspace.viewState.offsetX = (rect.width / 2) - (this.doc.width / 2);
        this.workspace.viewState.offsetY = (rect.height / 2) - (this.doc.height / 2);
        this.workspace.updateTransform();
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    initDefaultDocument() {
        const bg = new RasterLayer('Background', this.doc.width, this.doc.height);
        bg.ctx.fillStyle = '#ffffff';
        bg.ctx.fillRect(0, 0, bg.width, bg.height);
        this.doc.addLayer(bg);
        this.layersPanel.render();
    }

    async openFile() {
        const input = document.getElementById('file-input-open');
        input.click();
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const imgData = await FileIO.loadImage(file, this.doc.width, this.doc.height);
                if (this.doc.layers.length === 0 || (this.doc.layers.length === 1 && this.doc.layers[0].name === 'Background')) {
                    this.resizeDocument(imgData.width, imgData.height);
                }
                const newLayer = new RasterLayer(file.name, imgData.width, imgData.height);
                newLayer.ctx.drawImage(imgData.img, 0, 0);
                this.doc.addLayer(newLayer);
                this.layersPanel.render();
            } catch (err) {
                alert("Error loading file: " + err.message);
            }
        };
    }

    async exportFile() {
        const fileName = this.doc.name || 'composition';
        await FileIO.exportImage(this.canvas, fileName);
    }

    resizeDocument(w, h) {
        this.doc.width = w;
        this.doc.height = h;
        this.canvas.width = w;
        this.canvas.height = h;
        this.doc.layers.forEach(layer => {
            if (layer.canvas) {
                layer.width = w;
                layer.height = h;
            }
        });
    }

    applyFilter(filterType) {
        const active = this.doc.getActiveLayer();
        if (!active || active.type !== 'raster') return;
        const imageData = active.ctx.getImageData(0, 0, active.width, active.height);
        let result;
        switch(filterType) {
            case 'blur': result = ImageFilter.convolve(imageData, ImageFilter.Kernels.GAUSSIAN_BLUR, 16); break;
            case 'sharpen': result = ImageFilter.convolve(imageData, ImageFilter.Kernels.SHARPEN); break;
            case 'edges': result = ImageFilter.convolve(imageData, ImageFilter.Kernels.EDGE_DETECTION); break;
            case 'brightness': result = ImageFilter.adjust(imageData, 30, 1); break;
        }
        if (result) active.ctx.putImageData(result, 0, 0);
    }

    setActiveLayer(index) {
        this.doc.setActiveLayer(index);
        this.layersPanel.render();
    }

    toggleLayerVisibility(id) {
        const layer = this.doc.layers.find(l => l.id === id);
        if (layer) {
            layer.visible = !layer.visible;
            this.layersPanel.render();
        }
    }

    setupGlobalEvents() {
        const menuItems = document.querySelectorAll('header div.cursor-pointer');
        if (menuItems[0]) menuItems[0].onclick = () => this.openFile(); 
        if (menuItems[1]) menuItems[1].onclick = () => this.exportFile(); 

        const filterMenu = document.createElement('div');
        filterMenu.className = "absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-gray-900 p-2 rounded-lg border border-gray-700 z-50";
        filterMenu.innerHTML = `
            <button class="px-3 py-1 bg-gray-800 rounded text-xs hover:bg-gray-700" id="f-blur">Blur</button>
            <button class="px-3 py-1 bg-gray-800 rounded text-xs hover:bg-gray-700" id="f-sharpen">Sharpen</button>
            <button class="px-3 py-1 bg-gray-800 rounded text-xs hover:bg-gray-700" id="f-edges">Edges</button>
            <button class="px-3 py-1 bg-gray-800 rounded text-xs hover:bg-gray-700" id="f-bright">Brightness</button>
        `;
        document.body.appendChild(filterMenu);
        document.getElementById('f-blur').onclick = () => this.applyFilter('blur');
        document.getElementById('f-sharpen').onclick = () => this.applyFilter('sharpen');
        document.getElementById('f-edges').onclick = () => this.applyFilter('edges');
        document.getElementById('f-bright').onclick = () => this.applyFilter('brightness');

        document.getElementById('btn-add-layer').addEventListener('click', () => {
            const newLayer = new RasterLayer(`Layer ${this.doc.layers.length + 1}`, this.doc.width, this.doc.height);
            this.doc.addLayer(newLayer);
            this.layersPanel.render();
        });

        document.getElementById('btn-del-layer').addEventListener('click', () => {
            const active = this.doc.getActiveLayer();
            if (active) {
                this.doc.removeLayer(active.id);
                this.layersPanel.render();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.transformLayer = this.doc.getActiveLayer();
            }
            if (e.key === 'Enter' && this.transformLayer) {
                this.transformLayer = null; 
            }
            if (e.key === 'Escape') {
                this.transformLayer = null; 
            }
        });
    }

    startRenderLoop() {
        const loop = () => {
            this.renderer.render(this.doc, this.selection, this.transformLayer, this.workspace.viewState);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Boot the application
window.app = new App();

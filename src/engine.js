export const BlendModes = {
    NORMAL: 'source-over',
    MULTIPLY: 'multiply',
    SCREEN: 'screen',
    OVERLAY: 'overlay'
};

export class Engine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.doc = {
            width: 1920,
            height: 1080,
            layers: [],
            activeLayerIndex: -1
        };
        this.history = [];
    }

    init() {
        this.canvas.width = this.doc.width;
        this.canvas.height = this.doc.height;
        this.addLayer('Background', true);
    }

    addLayer(name, isBg = false) {
        const layer = {
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            type: 'raster',
            x: 0, y: 0,
            width: this.doc.width,
            height: this.doc.height,
            opacity: 1,
            visible: true,
            blendMode: BlendModes.NORMAL,
            canvas: document.createElement('canvas'),
            ctx: null
        };
        layer.canvas.width = this.doc.width;
        layer.canvas.height = this.doc.height;
        layer.ctx = layer.canvas.getContext('2d');
        
        if (isBg) {
            layer.ctx.fillStyle = 'white';
            layer.ctx.fillRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
        
        this.doc.layers.push(layer);
        this.doc.activeLayerIndex = this.doc.layers.length - 1;
        return layer;
    }

    removeLayer(index) {
        if (this.doc.layers.length <= 1) return;
        this.doc.layers.splice(index, 1);
        this.doc.activeLayerIndex = Math.max(0, this.doc.activeLayerIndex - 1);
    }

    getActiveLayer() {
        return this.doc.layers[this.doc.activeLayerIndex];
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.doc.layers.forEach(layer => {
            if (layer.visible) {
                this.ctx.globalAlpha = layer.opacity;
                this.ctx.globalCompositeOperation = layer.blendMode;
                this.ctx.drawImage(layer.canvas, layer.x, layer.y);
            }
        });
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1.0;
    }

    async loadImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.doc.width = img.naturalWidth;
                    this.doc.height = img.naturalHeight;
                    this.canvas.width = img.naturalWidth;
                    this.canvas.height = img.naturalHeight;
                    
                    const layer = this.addLayer(file.name);
                    layer.canvas.width = img.naturalWidth;
                    layer.canvas.height = img.naturalHeight;
                    layer.ctx = layer.canvas.getContext('2d');
                    layer.ctx.drawImage(img, 0, 0);
                    
                    // Resize all existing layers to match
                    this.doc.layers.forEach(l => {
                        l.canvas.width = img.naturalWidth;
                        l.canvas.height = img.naturalHeight;
                        l.ctx = l.canvas.getContext('2d');
                    });
                    
                    resolve();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    export() {
        const link = document.createElement('a');
        link.download = 'composition.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

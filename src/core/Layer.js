import { LayerType, BlendMode, DefaultSettings } from './Constants.js';

/**
 * BaseLayer provides the common properties for all layer types.
 */
class BaseLayer {
    constructor(name = 'New Layer', width = DefaultSettings.CANVAS_WIDTH, height = DefaultSettings.CANVAS_HEIGHT) {
        this.id = this.generateUUID();
        this.name = name;
        this.type = null; 
        
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        
        this.opacity = DefaultSettings.DEFAULT_OPACITY;
        this.visible = true;
        this.blendMode = DefaultSettings.DEFAULT_BLEND_MODE;
        this.locked = false;
    }

    generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    updateTransform(x, y, scaleX, scaleY, rotation) {
        this.x = x;
        this.y = y;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.rotation = rotation;
    }

    /**
     * Explicitly release memory. 
     * Essential for avoiding browser crashes with large images.
     */
    dispose() {
        // To be overridden by subclasses
    }
}

export class RasterLayer extends BaseLayer {
    constructor(name, width, height) {
        super(name, width, height);
        this.type = LayerType.RASTER;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    dispose() {
        this.ctx = null;
        this.canvas.width = 0; // Force canvas buffer release
        this.canvas.height = 0;
        this.canvas = null;
    }
}

export class VectorLayer extends BaseLayer {
    constructor(name, width, height) {
        super(name, width, height);
        this.type = LayerType.VECTOR;
        this.paths = [];
    }

    addPath(pathData) {
        this.paths.push(pathData);
    }

    dispose() {
        this.paths = [];
    }
}

export class TextLayer extends BaseLayer {
    constructor(name, text = 'New Text', width = 200, height = 50) {
        super(name, width, height);
        this.type = LayerType.TEXT;
        this.text = text;
        this.fontSize = 24;
        this.fontFamily = 'Arial';
        this.fontWeight = 'normal';
        this.textAlign = 'left';
        this.color = '#000000';
    }

    updateText(newText) {
        this.text = newText;
    }

    dispose() {
        this.text = '';
    }
}

export class GroupLayer extends BaseLayer {
    constructor(name) {
        super(name);
        this.type = LayerType.GROUP;
        this.children = [];
    }

    addLayer(layer) {
        this.children.push(layer);
    }

    removeLayer(layerId) {
        const index = this.children.findIndex(l => l.id === layerId);
        if (index !== -1) {
            const layer = this.children[index];
            layer.dispose(); // Recursive disposal
            this.children.splice(index, 1);
        }
    }

    dispose() {
        this.children.forEach(child => child.dispose());
        this.children = [];
    }
}

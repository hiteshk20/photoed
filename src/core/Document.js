import { DefaultSettings } from './Constants.js';

/**
 * Document manages the overall state of the image file.
 * It handles the layer stack and document-wide properties.
 */
export class Document {
    constructor(width = DefaultSettings.CANVAS_WIDTH, height = DefaultSettings.CANVAS_HEIGHT, name = 'Untitled-1') {
        this.name = name;
        this.width = width;
        this.height = height;
        
        // The layer stack. Index 0 is the bottom-most layer.
        this.layers = [];
        this.activeLayerIndex = -1;
    }

    /**
     * Adds a layer to the top of the stack.
     */
    addLayer(layer) {
        this.layers.push(layer);
        this.activeLayerIndex = this.layers.length - 1;
        return layer;
    }

    /**
     * Removes a layer by its ID.
     */
    removeLayer(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index !== -1) {
            const layer = this.layers[index];
            layer.dispose(); // Explicitly release memory
            this.layers.splice(index, 1);
            this.updateActiveLayerIndex();
        }
    }

    /**
     * Moves a layer up or down in the stack.
     */
    moveLayer(index, direction) {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < this.layers.length) {
            const temp = this.layers[index];
            this.layers[index] = this.layers[newIndex];
            this.layers[newIndex] = temp;
            this.activeLayerIndex = newIndex;
        }
    }

    /**
     * Ensures the activeLayerIndex remains valid after deletions.
     */
    updateActiveLayerIndex() {
        if (this.layers.length === 0) {
            this.activeLayerIndex = -1;
        } else if (this.activeLayerIndex >= this.layers.length) {
            this.activeLayerIndex = this.layers.length - 1;
        }
    }

    getActiveLayer() {
        if (this.activeLayerIndex === -1) return null;
        return this.layers[this.activeLayerIndex];
    }

    setActiveLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            this.activeLayerIndex = index;
        }
    }
}

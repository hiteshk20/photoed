import { BlendMode } from './Constants.js';

/**
 * Renderer is responsible for taking the Document state and 
 * drawing it to the screen.
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    /**
     * The main render loop.
     */
    render(document, selectionEngine, transformLayer = null, viewState = null) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < document.layers.length; i++) {
            const layer = document.layers[i];
            if (!layer.visible) continue;

            // VIEWPORT CULLING: Skip rendering if the layer is outside the visible area
            if (viewState) {
                const isOffscreen = (
                    layer.x + layer.width < 0 || 
                    layer.x > this.canvas.width || 
                    layer.y + layer.height < 0 || 
                    layer.y > this.canvas.height
                );
                if (isOffscreen) continue;
            }

            this.ctx.save();
            this.ctx.translate(layer.x, layer.y);
            this.ctx.rotate(layer.rotation);
            this.ctx.scale(layer.scaleX, layer.scaleY);
            this.ctx.globalAlpha = layer.opacity;
            this.ctx.globalCompositeOperation = this.mapBlendMode(layer.blendMode);
            this.drawLayer(layer);
            this.ctx.restore();
        }

        // Render Selection "Marching Ants"
        if (selectionEngine) {
            this.renderSelectionMask(selectionEngine);
        }

        // Render Transform Bounding Box
        if (transformLayer) {
            this.renderTransformUI(transformLayer);
        }
    }

    renderSelectionMask(selectionEngine) {
        this.ctx.save();
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 1;
        
        // In a full version, we'd trace the edge of the mask
        // For now, we draw a simple border if something is selected
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height); 
        // Note: Actual marching ants would use the mask's edge detection
        this.ctx.restore();
    }

    renderTransformUI(layer) {
        this.ctx.save();
        this.ctx.translate(layer.x, layer.y);
        this.ctx.rotate(layer.rotation);
        
        const w = layer.width * layer.scaleX;
        const h = layer.height * layer.scaleY;
        
        this.ctx.strokeStyle = '#00BFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, 0, w, h);
        
        // Draw handles
        this.ctx.fillStyle = '#fff';
        const handleSize = 6;
        const handles = [
            [0, 0], [w, 0], [0, h], [w, h], // Corners
            [w/2, 0], [w/2, h], [0, h/2], [w, h/2] // Midpoints
        ];
        
        handles.forEach(([hx, hy]) => {
            this.ctx.fillRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
        });
        
        this.ctx.restore();
    }

    drawLayer(layer) {
        if (layer.type === 'raster') {
            this.ctx.drawImage(layer.canvas, 0, 0);
        } else if (layer.type === 'text') {
            this.ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
            this.ctx.fillStyle = layer.color;
            this.ctx.textAlign = layer.textAlign;
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(layer.text, 0, 0);
        } else if (layer.type === 'vector') {
            this.renderVectorPaths(layer);
        } else if (layer.type === 'group') {
            layer.children.forEach(child => this.drawLayer(child));
        }
    }

    renderVectorPaths(layer) {
        this.ctx.strokeStyle = '#000000'; // Default, should come from layer properties
        this.ctx.lineWidth = 2;
        
        layer.paths.forEach(path => {
            this.ctx.beginPath();
            path.forEach(cmd => {
                switch (cmd.type) {
                    case 'MOVE_TO':
                        this.ctx.moveTo(cmd.x, cmd.y);
                        break;
                    case 'LINE_TO':
                        this.ctx.lineTo(cmd.x, cmd.y);
                        break;
                    case 'CURVE_TO':
                        this.ctx.bezierCurveTo(cmd.cp1x, cmd.cp1y, cmd.cp2x, cmd.cp2y, cmd.x, cmd.y);
                        break;
                    case 'CLOSE_PATH':
                        this.ctx.closePath();
                        break;
                }
            });
            this.ctx.stroke();
        });
    }

    /**
     * Maps our internal BlendMode enum to HTML5 Canvas globalCompositeOperation values.
     */
    mapBlendMode(mode) {
        const mapping = {
            [BlendMode.NORMAL]: 'source-over',
            [BlendMode.MULTIPLY]: 'multiply',
            [BlendMode.SCREEN]: 'screen',
            [BlendMode.OVERLAY]: 'overlay',
            [BlendMode.DARKEN]: 'darken',
            [BlendMode.LIGHTEN]: 'lighten',
            [BlendMode.COLOR_DODGE]: 'color-dodge',
            [BlendMode.COLOR_BURN]: 'color-burn',
            [BlendMode.HARD_LIGHT]: 'hard-light',
            [BlendMode.SOFT_LIGHT]: 'soft-light',
            [BlendMode.DIFFERENCE]: 'difference',
            [BlendMode.EXCLUSION]: 'exclusion'
        };
        return mapping[mode] || 'source-over';
    }
}

/**
 * BrushEngine handles the mathematical calculation of brush strokes.
 */
export class BrushEngine {
    constructor() {
        this.settings = {
            size: 20,
            hardness: 0.5, // 0 = soft, 1 = hard
            flow: 1.0,     // Opacity of the stroke
            color: '#000000'
        };
    }

    /**
     * Draws a smooth stroke between two points using linear interpolation.
     * @param {CanvasRenderingContext2D} ctx - The context of the raster layer.
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     */
    drawStroke(ctx, x1, y1, x2, y2) {
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Interpolate points to avoid gaps in fast mouse movement
        const step = this.settings.size / 4; 
        for (let i = 0; i < dist; i += step) {
            const currX = x1 + Math.cos(angle) * i;
            const currY = y1 + Math.sin(angle) * i;
            this.drawStamp(ctx, currX, currY);
        }
        this.drawStamp(ctx, x2, y2);
    }

    /**
     * Draws a single brush "stamp" with hardness logic.
     */
    drawStamp(ctx, x, y) {
        const radius = this.settings.size / 2;
        const gradient = ctx.createRadialGradient(x, y, radius * this.settings.hardness, x, y, radius);
        
        // Convert hex color to RGBA for flow/opacity
        const rgba = this.hexToRgba(this.settings.color, this.settings.flow);
        
        gradient.addColorStop(0, rgba);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}

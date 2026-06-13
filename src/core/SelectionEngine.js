/**
 * SelectionEngine manages the selection mask and selection tools.
 */
export class SelectionEngine {
    constructor(doc) {
        this.doc = doc;
        // The selection mask is a grayscale canvas (White = selected, Black = empty)
        this.mask = document.createElement('canvas');
        this.mask.width = doc.width;
        this.mask.height = doc.height;
        this.ctx = this.mask.getContext('2d');
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.mask.width, this.mask.height);
    }

    clear() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.mask.width, this.mask.height);
    }

    /**
     * Magic Wand Algorithm (Queue-based Flood Fill)
     * @param {RasterLayer} layer - The layer to sample colors from.
     * @param {number} startX - Start X in image space.
     * @param {number} startY - Start Y in image space.
     * @param {number} tolerance - Color difference threshold (0-255).
     */
    magicWand(layer, startX, startY, tolerance = 30) {
        const imgData = layer.ctx.getImageData(0, 0, layer.width, layer.height);
        const pixels = imgData.data;
        const width = layer.width;
        const height = layer.height;
        
        const startIdx = (Math.floor(startY) * width + Math.floor(startX)) * 4;
        const startColor = {
            r: pixels[startIdx],
            g: pixels[startIdx + 1],
            b: pixels[startIdx + 2]
        };

        const queue = [[Math.floor(startX), Math.floor(startY)]];
        const visited = new Uint8Array(width * height);
        
        // Selection mask drawing context
        this.ctx.fillStyle = 'white';

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            const idx = (y * width + x);

            if (x < 0 || x >= width || y < 0 || y >= height || visited[idx]) continue;

            const pIdx = idx * 4;
            const r = pixels[pIdx];
            const g = pixels[pIdx + 1];
            const b = pixels[pIdx + 2];

            const diff = Math.sqrt(
                Math.pow(r - startColor.r, 2) + 
                Math.pow(g - startColor.g, 2) + 
                Math.pow(b - startColor.b, 2)
            );

            if (diff <= tolerance) {
                visited[idx] = 1;
                this.ctx.fillRect(x, y, 1, 1); // Mark as selected in mask
                
                queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
    }

    /**
     * Adds a path to the selection mask.
     */
    addPathToSelection(pathPoints) {
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 1; i < pathPoints.length; i++) {
            this.ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Returns a boolean if a specific pixel is selected.
     */
    isSelected(x, y) {
        const data = this.ctx.getImageData(x, y, 1, 1).data;
        return data[0] > 128;
    }
}

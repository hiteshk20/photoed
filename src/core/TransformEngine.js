/**
 * TransformEngine handles bounding boxes and affine transformations.
 */
export class TransformEngine {
    /**
     * Calculates the current world-space bounding box of a layer.
     */
    static getBoundingBox(layer) {
        // For simplicity in Phase 6, we assume axes-aligned bounding boxes
        // In a full pro version, we'd calculate the corners using the rotation matrix
        return {
            x: layer.x,
            y: layer.y,
            width: layer.width * layer.scaleX,
            height: layer.height * layer.scaleY,
            rotation: layer.rotation
        };
    }

    /**
     * Calculates the new transform based on a handle drag.
     * @param {BaseLayer} layer - The layer to transform.
     * @param {string} handle - Handle ID ('nw', 'ne', 'sw', 'se', 'rot').
     * @param {number} dx - Mouse delta X.
     * @param {number} dy - Mouse delta Y.
     */
    static applyHandleDrag(layer, handle, dx, dy) {
        switch (handle) {
            case 'se':
                layer.scaleX += dx / layer.width;
                layer.scaleY += dy / layer.height;
                break;
            case 'sw':
                layer.scaleX -= dx / layer.width;
                layer.scaleY += dy / layer.height;
                layer.x += dx;
                break;
            case 'ne':
                layer.scaleX += dx / layer.width;
                layer.scaleY -= dy / layer.height;
                layer.y += dy;
                break;
            case 'nw':
                layer.scaleX -= dx / layer.width;
                layer.scaleY -= dy / layer.height;
                layer.x += dx;
                layer.y += dy;
                break;
            case 'rot':
                // Calculate angle between center and mouse
                const centerX = layer.x + (layer.width * layer.scaleX) / 2;
                const centerY = layer.y + (layer.height * layer.scaleY) / 2;
                // This is a simplified rotation logic
                layer.rotation += dx * 0.01;
                break;
        }
    }
}

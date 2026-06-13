/**
 * Base Command interface.
 * All user actions must extend this class.
 */
export class Command {
    execute() { throw new Error("Execute method not implemented"); }
    undo() { throw new Error("Undo method not implemented"); }
}

/**
 * Command to change a layer's property (opacity, visibility, blend mode).
 */
export class ChangePropertyCommand extends Command {
    constructor(layer, property, oldValue, newValue) {
        super();
        this.layer = layer;
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    execute() {
        this.layer[this.property] = this.newValue;
    }

    undo() {
        this.layer[this.property] = this.oldValue;
    }
}

/**
 * Command to move/transform a layer.
 */
export class TransformCommand extends Command {
    constructor(layer, oldTransform, newTransform) {
        super();
        this.layer = layer;
        this.oldTransform = oldTransform; // {x, y, scaleX, scaleY, rotation}
        this.newTransform = newTransform;
    }

    execute() {
        this.applyTransform(this.newTransform);
    }

    undo() {
        this.applyTransform(this.oldTransform);
    }

    applyTransform(t) {
        this.layer.x = t.x;
        this.layer.y = t.y;
        this.layer.scaleX = t.scaleX;
        this.layer.scaleY = t.scaleY;
        this.layer.rotation = t.rotation;
    }
}

/**
 * Command for pixel-based modifications (the most memory intensive).
 * Instead of storing the whole image, we store the "Dirty Rectangle" (the area that changed).
 */
export class PaintCommand extends Command {
    constructor(layer, oldImageData, newImageData, region) {
        super();
        this.layer = layer;
        this.oldImageData = oldImageData; // ImageData object
        this.newImageData = newImageData; // ImageData object
        this.region = region; // {x, y, width, height}
    }

    execute() {
        this.layer.ctx.putImageData(this.newImageData, this.region.x, this.region.y);
    }

    undo() {
        this.layer.ctx.putImageData(this.oldImageData, this.region.x, this.region.y);
    }
}

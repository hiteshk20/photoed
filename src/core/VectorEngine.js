/**
 * VectorEngine handles the mathematical representation of shapes and paths.
 */
export const PathCommand = Object.freeze({
    MOVE_TO: 'MOVE_TO',
    LINE_TO: 'LINE_TO',
    CURVE_TO: 'CURVE_TO',
    CLOSE_PATH: 'CLOSE_PATH'
});

export class VectorEngine {
    /**
     * Creates a rectangle path.
     */
    static createRect(x, y, width, height) {
        return [
            { type: PathCommand.MOVE_TO, x, y },
            { type: PathCommand.LINE_TO, x: x + width, y },
            { type: PathCommand.LINE_TO, x: x + width, y: y + height },
            { type: PathCommand.LINE_TO, x, y: y + height },
            { type: PathCommand.CLOSE_PATH }
        ];
    }

    /**
     * Creates an ellipse path using Bezier approximations.
     */
    static createEllipse(cx, cy, rx, ry) {
        const k = 0.552284749831; // Constant for approximating circle with Beziers
        return [
            { type: PathCommand.MOVE_TO, x: cx + rx, y: cy },
            { type: PathCommand.CURVE_TO, cp1x: cx + rx, cp1y: cy + ry * k, cp2x: cx + rx * k, cp2y: cy + ry, x: cx, y: cy + ry },
            { type: PathCommand.CURVE_TO, cp1x: cx - rx * k, cp1y: cy + ry, cp2x: cx - rx, cp2y: cy + ry * k, x: cx - rx, y: cy },
            { type: PathCommand.CURVE_TO, cp1x: cx - rx, cp1y: cy - ry * k, cp2x: cx - rx * k, cp2y: cy - ry, x: cx, y: cy - ry },
            { type: PathCommand.CURVE_TO, cp1x: cx + rx * k, cp1y: cy - ry, cp2x: cx + rx, cp2y: cy - ry * k, x: cx + rx, y: cy },
            { type: PathCommand.CLOSE_PATH }
        ];
    }
}

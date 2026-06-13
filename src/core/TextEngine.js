/**
 * TextEngine handles typography metrics and layout.
 */
export class TextEngine {
    /**
     * Calculates the bounding box of a text string.
     */
    static measureText(ctx, text, fontSize, fontFamily, fontWeight) {
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        
        return {
            width: metrics.width,
            height: fontSize * 1.2 // Approximate line height
        };
    }

    /**
     * Splits text into lines based on a max width.
     */
    static wrapText(ctx, text, maxWidth, fontSize, fontFamily, fontWeight) {
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);
        return lines;
    }
}

/**
 * FileIO handles all client-side file operations.
 * It uses ArrayBuffers and Blobs to ensure no data leaves the browser.
 */
export class FileIO {
    /**
     * Loads an image file and returns a Promise that resolves to a RasterLayer.
     * @param {File} file - The file object from the input element.
     * @param {number} docWidth - Current document width.
     * @param {number} docHeight - Current document height.
     */
    static async loadImage(file, docWidth, docHeight) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Create a RasterLayer that fits the image
                    // In a real pro app, we'd check if the image is larger than the doc
                    // and potentially suggest resizing the doc.
                    const layer = {
                        img: img,
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    };
                    resolve(layer);
                };
                img.onerror = () => reject(new Error("Failed to load image content."));
                img.src = event.target.result;
            };

            reader.onerror = () => reject(new Error("Failed to read file."));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Simple PSD Signature Check.
     * PSD files start with the bytes: 38 50 53 (8BPS in ASCII).
     */
    static async isPSD(file) {
        const buffer = await file.slice(0, 4).arrayBuffer();
        const view = new DataView(buffer);
        // Check for '8BPS' (the PSD signature)
        return view.getUint8(0) === 0x38 && 
               view.getUint8(1) === 0x50 && 
               view.getUint8(2) === 0x53;
    }

    /**
     * Exports the current canvas state to a file.
     * @param {HTMLCanvasElement} canvas - The flattened canvas.
     * @param {string} fileName - Name of the file.
     * @param {string} format - 'image/png' or 'image/jpeg'.
     * @param {number} quality - 0.0 to 1.0 (for jpeg).
     */
    static exportImage(canvas, fileName, format = 'image/png', quality = 0.92) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error("Export failed");
                    return resolve(null);
                }
                
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                resolve(true);
            }, format, quality);
        });
    }
}

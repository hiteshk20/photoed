/**
 * ImageFilter provides pure mathematical operations on ImageData.
 */
export class ImageFilter {
    /**
     * Generic Convolution Filter.
     * @param {ImageData} imageData - The raw pixel data.
     * @param {number[][]} kernel - The 3x3 or 5x5 matrix.
     * @param {number} divisor - The normalization factor.
     * @param {number} offset - The brightness offset.
     */
    static convolve(imageData, kernel, divisor = 1, offset = 0) {
        const width = imageData.width;
        const height = imageData.height;
        const src = imageData.data;
        const output = new Uint8ClampedArray(src.length);
        
        const kSize = kernel.length;
        const kHalf = Math.floor(kSize / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;

                for (let ky = 0; ky < kSize; ky++) {
                    for (let kx = 0; kx < kSize; kx++) {
                        const scx = Math.min(Math.max(x + kx - kHalf, 0), width - 1);
                        const scy = Math.min(Math.max(y + ky - kHalf, 0), height - 1);
                        const srcIdx = (scy * width + scx) * 4;
                        const weight = kernel[ky][kx];
                        
                        r += src[srcIdx] * weight;
                        g += src[srcIdx + 1] * weight;
                        b += src[srcIdx + 2] * weight;
                    }
                }

                const dstIdx = (y * width + x) * 4;
                output[dstIdx] = (r / divisor) + offset;
                output[dstIdx + 1] = (g / divisor) + offset;
                output[dstIdx + 2] = (b / divisor) + offset;
                output[dstIdx + 3] = src[dstIdx + 3]; // Keep alpha
            }
        }
        return new ImageData(output, width, height);
    }

    /**
     * Brightness/Contrast adjustment using a linear mapping.
     */
    static adjust(imageData, brightness = 0, contrast = 1) {
        const data = imageData.data;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

        for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] + brightness - 128) + 128;     // R
            data[i+1] = factor * (data[i+1] + brightness - 128) + 128; // G
            data[i+2] = factor * (data[i+2] + brightness - 128) + 128; // B
        }
        return imageData;
    }

    // Pre-defined Kernels
    static Kernels = {
        GAUSSIAN_BLUR: [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ],
        SHARPEN: [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ],
        EDGE_DETECTION: [
            [-1, -1, -1],
            [-1, 8, -1],
            [-1, -1, -1]
        ],
        EMBOSS: [
            [-2, -1, 0],
            [-1, 1, 1],
            [0, 1, 2]
        ]
    };
}

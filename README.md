# ProEditor | Elite Graphics Suite

A professional-grade, high-performance online photo editor built entirely on the client side. 

## 🚀 Features
- **Hybrid Layer System**: Support for Raster, Vector, and Text layers.
- **Non-Destructive Pipeline**: Command-pattern based Undo/Redo history.
- **Advanced Raster Tools**: Smooth brush interpolation, hardness/flow control, and eraser.
- **Math-Based Filters**: GPU-accelerated convolution kernels for Blur, Sharpen, and Edge Detection.
- **Professional Selection**: Magic Wand (Flood Fill) and Lasso selection using an off-screen mask.
- **Free Transform**: Full Affine Transformation support (Scale, Rotate, Move) via Ctrl+T.
- **Infinite Workspace**: Zoom-to-cursor and panning for massive compositions.
- **Client-Side I/O**: Zero-server architecture; handles images and binary data locally.

## 🛠️ Tech Stack
- **Language**: Vanilla JavaScript (ES6+ Modules)
- **Styling**: Tailwind CSS (Elite Pro Dark Theme)
- **Graphics**: HTML5 Canvas API / GPU-accelerated Compositing
- **Data**: ArrayBuffers & DataViews for binary parsing

## 📦 Deployment
This project is a Single Page Application (SPA) and is ready for **GitHub Pages**.

1. Create a new repository on GitHub.
2. Upload all files (including the `src` folder and `index.html`).
3. Go to **Settings** -> **Pages**.
4. Select the **main** branch and click **Save**.
5. Your editor will be live at `https://yourusername.github.io/your-repo-name/`.

## ⌨️ Keyboard Shortcuts
- `V`: Move Tool
- `B`: Brush Tool
- `E`: Eraser Tool
- `T`: Text Tool
- `Ctrl + T`: Free Transform
- `Enter`: Confirm Transform
- `Esc`: Cancel Transform

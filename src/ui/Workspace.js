/**
 * Workspace manages the visual viewport, including zooming and panning.
 * It maps screen coordinates to document coordinates.
 */
export class Workspace {
    constructor(canvas, container) {
        this.canvas = canvas;
        this.container = container;
        this.workspaceElement = document.getElementById('workspace');

        this.viewState = {
            zoom: 1.0,
            offsetX: 0,
            offsetY: 0,
            isPanning: false
        };

        this.lastMousePos = { x: 0, y: 0 };

        this.initListeners();
        this.updateTransform();
    }

    initListeners() {
        // Panning logic
        this.workspaceElement.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                this.viewState.isPanning = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.workspaceElement.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.viewState.isPanning) {
                const dx = e.clientX - this.lastMousePos.x;
                const dy = e.clientY - this.lastMousePos.y;
                
                this.viewState.offsetX += dx;
                this.viewState.offsetY += dy;
                
                this.lastMousePos = { x: e.clientX, y: e.clientY };
                this.updateTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            this.viewState.isPanning = false;
            this.workspaceElement.style.cursor = 'grab';
        });

        // Zooming logic
        this.workspaceElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.001;
            const delta = -e.deltaY;
            const factor = Math.pow(1.1, delta / 100); 
            
            const newZoom = Math.min(Math.max(this.viewState.zoom * factor, 0.1), 50);
            
            // Zoom towards mouse cursor
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.viewState.offsetX -= (mouseX / this.viewState.zoom) * (newZoom - this.viewState.zoom);
            this.viewState.offsetY -= (mouseY / this.viewState.zoom) * (newZoom - this.viewState.zoom);
            
            this.viewState.zoom = newZoom;
            this.updateTransform();
        }, { passive: false });
    }

    updateTransform() {
        const { zoom, offsetX, offsetY } = this.viewState;
        this.container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`;
    }

    /**
     * Converts a screen pixel coordinate (clientX/Y) into a 
     * coordinate relative to the actual pixels of the canvas.
     */
    screenToCanvas(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left) / this.viewState.zoom;
        const y = (clientY - rect.top) / this.viewState.zoom;
        return { x, y };
    }
}

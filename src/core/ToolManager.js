import { PaintCommand } from './Commands.js';
import { BrushEngine } from './BrushEngine.js';
import { VectorEngine } from './VectorEngine.js';
import { TextLayer, VectorLayer } from './Layer.js';

/**
 * ToolManager handles mouse interaction and maps it to specific tool logic.
 */
export class ToolManager {
    constructor(app) {
        this.app = app;
        this.brush = new BrushEngine();
        this.isDrawing = false;
        this.lastPos = { x: 0, y: 0 };
        this.dirtyRegion = { x: 0, y: 0, w: 0, h: 0 };
        this.snapshot = null;

        this.initListeners();
    }

    initListeners() {
        const canvas = this.app.canvas;

        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    handleMouseDown(e) {
        const tool = this.app.toolbar.currentTool;
        if (tool === 'move') return; 

        const pos = this.app.workspace.screenToCanvas(e.clientX, e.clientY);
        
        if (tool === 'text') {
            this.handleTextTool(pos);
            return;
        }

        if (tool === 'shape') {
            this.handleShapeTool(pos);
            return;
        }

        const activeLayer = this.app.doc.getActiveLayer();
        if (!activeLayer || activeLayer.type !== 'raster') return;

        this.isDrawing = true;
        this.lastPos = pos;
        
        this.dirtyRegion = { 
            x: pos.x - this.brush.settings.size, 
            y: pos.y - this.brush.settings.size, 
            w: this.brush.settings.size * 2, 
            h: this.brush.settings.size * 2 
        };

        this.snapshot = activeLayer.ctx.getImageData(
            this.dirtyRegion.x, this.dirtyRegion.y, this.dirtyRegion.w, this.dirtyRegion.h
        );

        this.executeToolAction(tool, pos, pos);
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const pos = this.app.workspace.screenToCanvas(e.clientX, e.clientY);
        const tool = this.app.toolbar.currentTool;
        
        this.executeToolAction(tool, this.lastPos, pos);
        this.updateDirtyRegion(pos);
        this.lastPos = pos;
    }

    handleMouseUp() {
        if (!this.isDrawing) return;
        
        const activeLayer = this.app.doc.getActiveLayer();
        const finalImageData = activeLayer.ctx.getImageData(
            this.dirtyRegion.x, this.dirtyRegion.y, this.dirtyRegion.w, this.dirtyRegion.h
        );

        const paintCmd = new PaintCommand(
            activeLayer, 
            this.snapshot, 
            finalImageData, 
            { x: this.dirtyRegion.x, y: this.dirtyRegion.y }
        );
        
        this.app.history.execute(paintCmd);
        this.isDrawing = false;
        this.snapshot = null;
    }

    handleTextTool(pos) {
        const text = prompt("Enter text:", "New Text");
        if (!text) return;

        const textLayer = new TextLayer(`Text: ${text}`, text, 200, 50);
        textLayer.x = pos.x;
        textLayer.y = pos.y;
        textLayer.color = document.getElementById('color-picker').value;
        
        this.app.doc.addLayer(textLayer);
        this.app.layersPanel.render();
    }

    handleShapeTool(pos) {
        const shapeLayer = new VectorLayer('Rectangle', 100, 100);
        shapeLayer.x = pos.x;
        shapeLayer.y = pos.y;
        
        const rectPath = VectorEngine.createRect(0, 0, 100, 100);
        shapeLayer.addPath(rectPath);
        
        this.app.doc.addLayer(shapeLayer);
        this.app.layersPanel.render();
    }

    executeToolAction(tool, p1, p2) {
        const activeLayer = this.app.doc.getActiveLayer();
        if (!activeLayer || activeLayer.type !== 'raster') return;
        const ctx = activeLayer.ctx;

        if (tool === 'brush') {
            this.brush.updateSettings({ color: document.getElementById('color-picker').value });
            this.brush.drawStroke(ctx, p1.x, p1.y, p2.x, p2.y);
        } else if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            this.brush.drawStroke(ctx, p1.x, p1.y, p2.x, p2.y);
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    updateDirtyRegion(pos) {
        const s = this.brush.settings.size;
        const left = Math.min(this.dirtyRegion.x, pos.x - s);
        const top = Math.min(this.dirtyRegion.y, pos.y - s);
        const right = Math.max(this.dirtyRegion.x + this.dirtyRegion.w, pos.x + s);
        const bottom = Math.max(this.dirtyRegion.y + this.dirtyRegion.h, pos.y + s);
        
        this.dirtyRegion = {
            x: left,
            y: top,
            w: right - left,
            h: bottom - top
        };
    }
}

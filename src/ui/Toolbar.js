/**
 * Toolbar manages tool selection and visual state.
 */
export class Toolbar {
    constructor(onToolChange) {
        this.currentTool = 'move';
        this.onToolChange = onToolChange;
        this.initListeners();
    }

    initListeners() {
        const buttons = document.querySelectorAll('.tool-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveTool(btn.id.replace('tool-', ''));
            });
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'v': this.setActiveTool('move'); break;
                case 'm': this.setActiveTool('marquee'); break;
                case 'l': this.setActiveTool('lasso'); break;
                case 'b': this.setActiveTool('brush'); break;
                case 'e': this.setActiveTool('eraser'); break;
                case 't': this.setActiveTool('text'); break;
            }
        });
    }

    setActiveTool(toolId) {
        this.currentTool = toolId;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`tool-${toolId}`).classList.add('active');

        if (this.onToolChange) {
            this.onToolChange(toolId);
        }
    }
}

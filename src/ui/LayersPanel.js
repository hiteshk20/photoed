/**
 * LayersPanel manages the visualization of the document's layer stack.
 */
export class LayersPanel {
    constructor(document, onLayerSelect, onToggleVisibility) {
        this.document = document;
        this.onLayerSelect = onLayerSelect;
        this.onToggleVisibility = onToggleVisibility;
        this.container = document.getElementById('layer-list');
    }

    render() {
        this.container.innerHTML = '';
        
        // We render layers from top to bottom (Reverse order of the stack)
        for (let i = this.document.layers.length - 1; i >= 0; i--) {
            const layer = this.document.layers[i];
            const item = document.createElement('div');
            item.className = `flex items-center justify-between p-2 rounded cursor-pointer text-xs transition-colors ${this.document.activeLayerIndex === i ? 'bg-blue-900 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-800'}`;
            
            item.innerHTML = `
                <div class="flex items-center space-x-2 overflow-hidden">
                    <button class="visibility-toggle ${layer.visible ? 'text-gray-400' : 'text-gray-600'}" data-id="${layer.id}">
                        ${layer.visible ? '👁️' : '◌'}
                    </button>
                    <span class="truncate">${layer.name}</span>
                </div>
                <div class="text-[10px] opacity-50">${layer.type}</div>
            `;

            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('visibility-toggle')) {
                    this.onToggleVisibility(layer.id);
                } else {
                    this.onLayerSelect(i);
                }
            });

            this.container.appendChild(item);
        }
    }
}

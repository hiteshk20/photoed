/**
 * HistoryManager handles the Undo and Redo stacks.
 * It ensures that the application state can be rolled back and forward.
 */
export class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 50; // Limit memory usage
    }

    /**
     * Executes a command and pushes it onto the undo stack.
     * Also clears the redo stack because a new action breaks the redo chain.
     */
    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo on new action

        // Memory management: cap the history stack
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length === 0) return null;

        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
        return command;
    }

    redo() {
        if (this.redoStack.length === 0) return null;

        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
        return command;
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    getHistoryLog() {
        return this.undoStack.map((cmd, index) => ({
            index,
            type: cmd.constructor.name
        }));
    }
}

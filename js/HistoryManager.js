// HistoryManager.js

class HistoryManager {
    constructor(maxSize = 30) {
        this.undoStack = [];
        this.maxSize = maxSize;
    }

    /**
     * Save a snapshot of the current state.
     * @param {Object} state - { graphData: string, bgImage: string|null }
     */
    saveState(state) {
        // Only save if different from last state
        if (this.undoStack.length > 0) {
            const last = this.undoStack[this.undoStack.length - 1];
            if (last.graphData === state.graphData && last.bgImage === state.bgImage) {
                return;
            }
        }

        this.undoStack.push(state);
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
    }

    /**
     * Get the last state and remove it from stack.
     * @returns {Object|null}
     */
    undo() {
        if (this.undoStack.length > 0) {
            return this.undoStack.pop();
        }
        return null;
    }

    clear() {
        this.undoStack = [];
    }
}

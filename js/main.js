// main.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize core instances
    const graph = new Graph();
    const canvasManager = new CanvasManager('graph-canvas', graph);
    const uiManager = new UIManager(graph, canvasManager);

    console.log("Interactive Graph Solver Initialized Successfully.");
});

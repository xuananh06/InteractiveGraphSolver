# Graph Solver — Interactive Graph Algorithm Visualizer

**Live Demo:** [https://xuananh06.github.io/InteractiveGraphSolver/](https://xuananh06.github.io/InteractiveGraphSolver/)

An interactive web-based application designed to **render graphs on Canvas** and **visualize** fundamental graph algorithms. This tool allows users to build custom topologies, observe step-by-step executions, and analyze pathfinding logic in real-time.

---

## Key Features

### 1. Interactive Graph Builder
* **Dynamic Editing**: Add or remove **vertices** and **edges** with a simple click.
* **Flexible Edges**: Full support for **weighted**, **directed**, and **undirected** edges.
* **Drag-and-Drop**: Seamlessly reposition vertices on the canvas for optimal layout.

### 2. Execution & Control
* **Vertex Designation**: Set **Start** and **End** nodes for traversal and pathfinding algorithms.
* **Persistence**: **Save/Load** functionality to store your graph structures as JSON.
* **Undo/Redo**: Easily revert recent modifications to the graph.
* **Custom Background**: Upload images to the canvas for specialized tracing or visualization.

### 3. Advanced Visualization
* **Real-time Highlighting**: Visual feedback for the **Shortest Path** or **Minimum Spanning Tree (MST)**.
* **Step-by-Step Animation**: Controlled execution with a dedicated log panel displaying algorithm state changes.
* **Sequence Labeling**: Vertices and edges are numbered based on discovery order.
* **Analysis Panel**: Detailed results log and a **Clear Results** feature for debugging.

---

## Supported Algorithms

* **Traversals**: **DFS** (Depth First Search) and **BFS** (Breadth First Search).
* **Shortest Path**: **Dijkstra’s Algorithm** (Visualizes optimal paths).
* **Minimum Spanning Tree**: **Prim’s Algorithm** (Optimized for undirected graphs).
* **Eulerian Path & Circuit**:
    * Implements **Hierholzer’s Algorithm**.
    * Automatic validation of degree conditions and graph connectivity.
    * Support for both **Directed** and **Undirected** graph properties.
* **Hamiltonian Path & Circuit**:
    * Exploration via **Backtracking** (Finds valid paths in NP-Complete problems).

---

## Installation & Setup

Since this is a client-side project (HTML5/CSS3/Vanilla JS), no build process is required:
1. Clone the repository: `git clone https://github.com/xuananh06/InteractiveGraphSolver.git`
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, etc.).

---

## Quick Start Guide

1.  **Add Vertex**: Select the **Vertex tool** and click on the canvas.
2.  **Connect Edges**: Select the **Edge tool**, click two vertices, then input the **weight** and **direction**.
3.  **Run Algorithm**: 
    * Choose an algorithm from the dropdown menu.
    * Optional: Toggle **Animate (step-by-step)** for a guided walkthrough.
    * Click **Run Algorithm**.
4.  **Reset**: Use **Clear Results** to wipe the log or **Clear Graph** for a new workspace.

---

## Technical Notes

* **Dijkstra**: Requires **non-negative weights** for guaranteed accuracy.
* **Hamiltonian**: Performance may vary on complex graphs due to the exponential nature of backtracking.
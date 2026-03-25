// UIManager.js

class UIManager {
    constructor(graph, canvasManager) {
        this.graph = graph;
        this.canvasManager = canvasManager;
        this.mode = 'select'; // select, add-vertex, add-edge, delete

        // Canvas Interaction State
        this.isDragging = false;
        this.dragNodeId = null;
        this.edgeStartNodeId = null;
        this.pendingEdge = null;

        // New Dropdowns
        this.startVertexSelect = document.getElementById('start-vertex');
        this.endVertexSelect = document.getElementById('end-vertex');

        this.setupEventListeners();
        this.updateVertexSelects();
    }

    setupEventListeners() {
        // Mode Buttons
        const modeBtns = document.querySelectorAll('.tool-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                modeBtns.forEach(b => b.classList.remove('active-tool'));
                const target = e.currentTarget;
                target.classList.add('active-tool');
                this.setMode(target.dataset.mode);
            });
        });

        // Image Upload
        document.getElementById('image-upload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.canvasManager.setBackgroundImage(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('btn-clear-bg').addEventListener('click', () => {
            this.canvasManager.clearBackgroundImage();
            document.getElementById('image-upload').value = "";
        });

        document.getElementById('btn-clear-graph').addEventListener('click', () => {
             this.graph.clear();
             this.canvasManager.clearHighlights();
             this.canvasManager.draw();
             this.clearResults();
             this.updateVertexSelects();
        });

        // Algorithm Execution
        document.getElementById('btn-run').addEventListener('click', () => {
            this.runAlgorithm();
        });

        // Clear results panel
        document.getElementById('btn-clear-results').addEventListener('click', () => {
            this.clearResults();
        });

        // Canvas Events
        const canvas = this.canvasManager.canvas;
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        // Modal: Weight
        document.getElementById('btn-weight-cancel').addEventListener('click', () => {
            document.getElementById('weight-modal').classList.add('hidden');
        });
        
        document.getElementById('btn-weight-save').addEventListener('click', () => {
            this.finishAddingEdge();
        });

        // Modal: Vertex Rename
        document.getElementById('btn-vertex-cancel').addEventListener('click', () => {
            document.getElementById('vertex-modal').classList.add('hidden');
        });

        document.getElementById('btn-vertex-save').addEventListener('click', () => {
            this.finishRenamingVertex();
        });
    }

    setMode(newMode) {
        this.mode = newMode;
        this.edgeStartNodeId = null;
        this.canvasManager.selectedNodeId = null;
        this.canvasManager.canvas.className = newMode === 'select' ? 'select-mode' : '';
        this.canvasManager.draw();
    }

    onMouseDown(e) {
        if (e.button !== 0) return; // Only process left click
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const coords = this.canvasManager.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        
        const clickedNodeId = this.canvasManager.getNodeAt(e.clientX - rect.left, e.clientY - rect.top);

        if (this.mode === 'add-vertex') {
            if (!clickedNodeId) {
                this.graph.addVertex(coords.x, coords.y);
                this.canvasManager.draw();
                this.updateVertexSelects();
            }
        } else if (this.mode === 'select') {
            if (clickedNodeId) {
                this.isDragging = true;
                this.dragNodeId = clickedNodeId;
                this.canvasManager.selectedNodeId = clickedNodeId;
            } else {
                this.canvasManager.selectedNodeId = null;
            }
            this.canvasManager.draw();
        } else if (this.mode === 'delete') {
            if (clickedNodeId) {
                this.graph.removeVertex(clickedNodeId);
                this.canvasManager.draw();
                this.updateVertexSelects();
            }
        } else if (this.mode === 'add-edge') {
            if (clickedNodeId) {
                if (this.edgeStartNodeId === null) {
                    this.edgeStartNodeId = clickedNodeId;
                    this.canvasManager.selectedNodeId = clickedNodeId;
                } else if (this.edgeStartNodeId !== clickedNodeId) {
                    this.promptEdgeWeight(this.edgeStartNodeId, clickedNodeId);
                }
                this.canvasManager.draw();
            } else {
                this.edgeStartNodeId = null; // click empty space to cancel edge start
                this.canvasManager.selectedNodeId = null;
                this.canvasManager.draw();
            }
        }
    }

    onMouseMove(e) {
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const coords = this.canvasManager.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
        
        const hoveredNodeId = this.canvasManager.getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
        
        if (this.canvasManager.hoveredNodeId !== hoveredNodeId) {
            this.canvasManager.hoveredNodeId = hoveredNodeId;
            this.canvasManager.draw();
        }

        if (this.isDragging && this.dragNodeId !== null && this.mode === 'select') {
            const node = this.graph.getVertex(this.dragNodeId);
            node.x = coords.x;
            node.y = coords.y;
            this.canvasManager.draw();
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
        this.dragNodeId = null;
    }

    onDoubleClick(e) {
        const rect = this.canvasManager.canvas.getBoundingClientRect();
        const clickedNodeId = this.canvasManager.getNodeAt(e.clientX - rect.left, e.clientY - rect.top);

        if (clickedNodeId && this.mode === 'select') {
            this.promptVertexRename(clickedNodeId);
        }
    }

    promptEdgeWeight(u, v) {
        this.pendingEdge = { u, v };
        document.getElementById('edge-weight-input').value = 1;
        document.getElementById('edge-directed-input').checked = false;
        document.getElementById('weight-modal').classList.remove('hidden');
        document.getElementById('edge-weight-input').focus();
    }

    finishAddingEdge() {
        if (!this.pendingEdge) return;
        const weight = parseFloat(document.getElementById('edge-weight-input').value) || 1;
        const directed = document.getElementById('edge-directed-input').checked;
        
        this.graph.addEdge(this.pendingEdge.u, this.pendingEdge.v, weight, directed);
        
        document.getElementById('weight-modal').classList.add('hidden');
        this.pendingEdge = null;
        this.edgeStartNodeId = null;
        this.canvasManager.selectedNodeId = null;
        this.canvasManager.draw();
    }

    promptVertexRename(id) {
        const vertex = this.graph.getVertex(id);
        if (!vertex) return;

        this.pendingVertexRenameId = id;
        const input = document.getElementById('vertex-label-input');
        input.value = vertex.label;
        document.getElementById('vertex-modal').classList.remove('hidden');
        input.focus();
        input.select();
    }

    finishRenamingVertex() {
        if (this.pendingVertexRenameId === null) return;
        
        const newLabel = document.getElementById('vertex-label-input').value.trim();
        if (newLabel) {
            this.graph.renameVertex(this.pendingVertexRenameId, newLabel);
            this.updateVertexSelects();
            this.canvasManager.draw();
        }

        document.getElementById('vertex-modal').classList.add('hidden');
        this.pendingVertexRenameId = null;
    }

    updateVertexSelects() {
        if (!this.startVertexSelect || !this.endVertexSelect) return;

        const vertices = Array.from(this.graph.vertices.keys()).sort((a, b) => a - b);
        
        const updateSelect = (select, currentValue) => {
            select.innerHTML = '<option value="" disabled selected>-</option>';
            vertices.forEach(v => {
                const vertex = this.graph.getVertex(v);
                const opt = document.createElement('option');
                opt.value = v;
                opt.textContent = vertex ? vertex.label : v;
                if (v.toString() === currentValue.toString()) opt.selected = true;
                select.appendChild(opt);
            });
        };

        const currentStart = this.startVertexSelect.value;
        const currentEnd = this.endVertexSelect.value;

        updateSelect(this.startVertexSelect, currentStart);
        updateSelect(this.endVertexSelect, currentEnd);
    }

    showResult(title, content, type = 'info') {
        const container = document.getElementById('results-content');
        if (container.querySelector('.placeholder-text')) {
            container.innerHTML = '';
        }
        
        const div = document.createElement('div');
        div.className = type === 'error' ? 'error-item' : 'result-item';
        div.innerHTML = `<strong>${title}:</strong><br/>${content}`;
        container.prepend(div);
    }

    createStepLogger(title) {
        const container = document.getElementById('results-content');
        if (container.querySelector('.placeholder-text')) container.innerHTML = '';

        const logId = `step-log-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<strong>${title}:</strong><br/><div id="${logId}" style="margin-top:8px;line-height:1.4;"></div>`;
        container.prepend(div);
        return document.getElementById(logId);
    }

    clearResults() {
        document.getElementById('results-content').innerHTML = `
            <div class="placeholder-text">
                <i data-lucide="bar-chart-2"></i>
                <p>Run an algorithm or select elements to view analysis here.</p>
            </div>
        `;
        lucide.createIcons(); // refresh icons
    }

    runAlgorithm() {
        const algo = document.getElementById('algorithm-select').value;
        if (!algo) {
            this.showResult("Error", "Please select an algorithm first.", "error");
            return;
        }

        if (this.graph.vertices.size === 0) {
            this.showResult("Error", "Graph is empty.", "error");
            return;
        }

        this.canvasManager.clearHighlights();
        const animateToggle = document.getElementById('animate-toggle');
        const doAnimate = !!(animateToggle && animateToggle.checked);

        // Get selected vertices as numbers
        const startVal = this.startVertexSelect.value;
        const endVal = this.endVertexSelect.value;
        const start = startVal ? parseInt(startVal) : this.canvasManager.selectedNodeId;
        const end = endVal ? parseInt(endVal) : this.canvasManager.hoveredNodeId;

        switch (algo) {
            case 'dfs': {
                const feas = this.graph.checkFeasibility('dfs', start, null);
                if (!feas.feasible) {
                    this.showResult("DFS Traversal", feas.error, "error");
                    break;
                }
                const traversal = Algorithms.dfs(this.graph, start);
                if (doAnimate) {
                    const logEl = this.createStepLogger("DFS Steps");
                    this.canvasManager.animatePath(traversal, 300, {
                        numberVertices: true,
                        numberEdges: false,
                        onStep: ({ step, total, node }) => {
                            const label = this.graph.getVertex(node).label;
                            logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Visit ${label}</div>`);
                        }
                    });
                } else {
                    this.canvasManager.setPathHighlight(traversal);
                    this.canvasManager.setVertexOrderFromTraversal(traversal);
                }
                const pathStr = traversal.map(id => this.graph.getVertex(id).label).join(' &rarr; ');
                const startLabel = this.graph.getVertex(start).label;
                this.showResult("DFS Traversal", `Started at ${startLabel}.<br/>Path: ${pathStr}`);
                break;
            }
            case 'bfs': {
                const feas = this.graph.checkFeasibility('bfs', start, null);
                if (!feas.feasible) {
                    this.showResult("BFS Traversal", feas.error, "error");
                    break;
                }
                const traversal = Algorithms.bfs(this.graph, start);
                if (doAnimate) {
                    const logEl = this.createStepLogger("BFS Steps");
                    this.canvasManager.animatePath(traversal, 300, {
                        numberVertices: true,
                        numberEdges: false,
                        onStep: ({ step, total, node }) => {
                            const label = this.graph.getVertex(node).label;
                            logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Visit ${label}</div>`);
                        }
                    });
                } else {
                    this.canvasManager.setPathHighlight(traversal);
                    this.canvasManager.setVertexOrderFromTraversal(traversal);
                }
                const pathStr = traversal.map(id => this.graph.getVertex(id).label).join(' &rarr; ');
                const startLabel = this.graph.getVertex(start).label;
                this.showResult("BFS Traversal", `Started at ${startLabel}.<br/>Path: ${pathStr}`);
                break;
            }
            case 'shortest-path': {
                const feas = this.graph.checkFeasibility('dijkstra', start, end);
                if (!feas.feasible) {
                    this.showResult("Dijkstra", feas.error, "error");
                    break;
                }

                const vertices = Array.from(this.graph.vertices.keys());
                if (vertices.length < 2) {
                    this.showResult("Dijkstra", "Need at least 2 nodes.", "error");
                    break;
                }
                
                const { path, distance } = Algorithms.dijkstra(this.graph, start, end);
                if (distance === Infinity || path.length === 0) {
                    this.showResult("Dijkstra", `No path between ${start} and ${end}.`, "error");
                } else {
                    if (doAnimate) {
                        const logEl = this.createStepLogger("Dijkstra Steps");
                        this.canvasManager.animatePath(path, 350, {
                            numberVertices: false,
                            numberEdges: true,
                            onStep: ({ step, total, node, prev }) => {
                                if (prev === null) {
                                    const nodeLabel = this.graph.getVertex(node).label;
                                    logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Start at ${nodeLabel}</div>`);
                                } else {
                                    const nodeLabel = this.graph.getVertex(node).label;
                                    const prevLabel = this.graph.getVertex(prev).label;
                                    logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Move ${prevLabel} &rarr; ${nodeLabel}</div>`);
                                }
                            }
                        });
                    } else {
                        this.canvasManager.setPathHighlight(path);
                        this.canvasManager.setEdgeOrderFromPath(path);
                    }
                    const startLabel = this.graph.getVertex(start).label;
                    const endLabel = this.graph.getVertex(end).label;
                    const pathStr = path.map(id => this.graph.getVertex(id).label).join(' &rarr; ');
                    this.showResult("Dijkstra", `Shortest path from ${startLabel} to ${endLabel}.<br/>Cost: ${distance}<br/>Path: ${pathStr}`);
                }
                break;
            }
            case 'mst': {
                const feas = this.graph.checkFeasibility('mst', start, null);
                if (!feas.feasible) {
                    this.showResult("MST (Prim's)", feas.error, "error");
                    break;
                }
                const result = Algorithms.mstPrim(this.graph, start);
                if (!result.isConnected) {
                    this.showResult("MST (Prim's)", "Graph is disconnected! Shown edges form a forest.", "error");
                }
                this.canvasManager.setEdgesHighlight(result.edges);
                this.canvasManager.setEdgeOrderFromEdges(result.edges);
                this.showResult("Minimum Spanning Tree", `Total Weight: ${result.totalWeight}<br/>Edges: ${result.edges.length}`);
                break;
            }
            case 'euler': {
                const feas = this.graph.checkFeasibility('euler', start, null);
                if (!feas.feasible) {
                    this.showResult("Euler", feas.error, "error");
                    break;
                }
                const res = Algorithms.eulerHierholzer(this.graph, start);
                if (res.type === 'error') {
                    this.showResult("Euler", res.msg, "error");
                } else if (res.type === 'circuit') {
                    if (doAnimate) {
                        const logEl = this.createStepLogger("Euler Steps");
                        this.canvasManager.animatePath(res.path, 300, {
                            numberVertices: false,
                            numberEdges: true,
                            onStep: ({ step, total, node, prev }) => {
                                if (prev === null) {
                                    const nodeLabel = this.graph.getVertex(node).label;
                                    logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Start at ${nodeLabel}</div>`);
                                } else {
                                    const nodeLabel = this.graph.getVertex(node).label;
                                    const prevLabel = this.graph.getVertex(prev).label;
                                    logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Traverse ${prevLabel} &rarr; ${nodeLabel}</div>`);
                                }
                            }
                        });
                    } else {
                        this.canvasManager.setPathHighlight(res.path);
                        this.canvasManager.setEdgeOrderFromPath(res.path);
                    }
                    const pathStr = res.path.map(id => this.graph.getVertex(id).label).join(' &rarr; ');
                    this.showResult("Euler Circuit", `${res.msg}<br/>Tour: ${pathStr}`);
                } else if (res.type === 'path') {
                    if (doAnimate) {
                        const logEl = this.createStepLogger("Euler Steps");
                        this.canvasManager.animatePath(res.path, 300, {
                            numberVertices: false,
                            numberEdges: true,
                            onStep: ({ step, total, node, prev }) => {
                                if (prev === null) {
                                    const nodeLabel = this.graph.getVertex(node).label;
                                    logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Start at ${nodeLabel}</div>`);
                                } else {
                                    const nodeLabel = this.graph.getVertex(node).label;
                                    const prevLabel = this.graph.getVertex(prev).label;
                                    logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Traverse ${prevLabel} &rarr; ${nodeLabel}</div>`);
                                }
                            }
                        });
                    } else {
                        this.canvasManager.setPathHighlight(res.path);
                        this.canvasManager.setEdgeOrderFromPath(res.path);
                    }
                    const pathStr = res.path.map(id => this.graph.getVertex(id).label).join(' &rarr; ');
                    this.showResult("Euler Path", `${res.msg}<br/>Path: ${pathStr}`);
                } else {
                    this.showResult("Euler Result", res.msg, "error");
                }
                break;
            }
            case 'hamilton': {
                this.showResult("Hamiltonian", "Warning: NP-Complete algorithm. Computing...", "info");
                // Yield thread to show message
                setTimeout(() => {
                    const res = Algorithms.hamiltonian(this.graph, start);
                    if (res.circuit) {
                        if (doAnimate) {
                            const logEl = this.createStepLogger("Hamilton Steps");
                            this.canvasManager.animatePath(res.circuit, 300, {
                                numberVertices: false,
                                numberEdges: true,
                                onStep: ({ step, total, node, prev }) => {
                                    if (prev === null) {
                                        logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Start at ${node}</div>`);
                                    } else {
                                        logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Move ${prev} &rarr; ${node}</div>`);
                                    }
                                }
                            });
                        } else {
                            this.canvasManager.setPathHighlight(res.circuit);
                            this.canvasManager.setEdgeOrderFromPath(res.circuit);
                        }
                        this.showResult("Hamiltonian Circuit", `Found Circuit:<br/>${res.circuit.join(' &rarr; ')}`);
                    } else if (res.path) {
                        if (doAnimate) {
                            const logEl = this.createStepLogger("Hamilton Steps");
                            this.canvasManager.animatePath(res.path, 300, {
                                numberVertices: false,
                                numberEdges: true,
                                onStep: ({ step, total, node, prev }) => {
                                    if (prev === null) {
                                        logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Start at ${node}</div>`);
                                    } else {
                                        logEl.insertAdjacentHTML('beforeend', `<div><strong>Step ${step}/${total}:</strong> Move ${prev} &rarr; ${node}</div>`);
                                    }
                                }
                            });
                        } else {
                            this.canvasManager.setPathHighlight(res.path);
                            this.canvasManager.setEdgeOrderFromPath(res.path);
                        }
                        this.showResult("Hamiltonian Path", `Found Path based on backtracking:<br/>${res.path.join(' &rarr; ')}`);
                    } else {
                        this.showResult("Hamiltonian Result", "No Hamiltonian Path or Circuit exists.", "error");
                    }
                }, 10);
                break;
            }
        }
    }
}

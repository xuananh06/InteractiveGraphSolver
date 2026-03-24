// Graph.js

class Vertex {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }
}

class Edge {
    constructor(u, v, weight = 1, directed = false) {
        this.u = u; // Source Vertex ID
        this.v = v; // Target Vertex ID
        this.weight = weight;
        this.directed = directed;
    }
}

class Graph {
    constructor() {
        this.vertices = new Map(); // id -> Vertex
        this.edges = []; // array of Edge
        this.nextId = 1;
    }

    addVertex(x, y) {
        const id = this.nextId++;
        const vertex = new Vertex(id, x, y);
        this.vertices.set(id, vertex);
        return vertex;
    }

    removeVertex(id) {
        if (!this.vertices.has(id)) return false;
        
        // Remove all edges connected to this vertex
        this.edges = this.edges.filter(e => e.u !== id && e.v !== id);
        this.vertices.delete(id);
        return true;
    }

    addEdge(uId, vId, weight = 1, directed = false) {
        if (!this.vertices.has(uId) || !this.vertices.has(vId)) return null;
        
        // Check if edge already exists
        const existingEdgeIndex = this.edges.findIndex(e => 
            (e.u === uId && e.v === vId) || 
            (!e.directed && !directed && e.u === vId && e.v === uId)
        );

        if (existingEdgeIndex !== -1) {
            // Update existing edge
            this.edges[existingEdgeIndex].weight = weight;
            this.edges[existingEdgeIndex].directed = directed;
            return this.edges[existingEdgeIndex];
        }

        const edge = new Edge(uId, vId, weight, directed);
        this.edges.push(edge);
        return edge;
    }

    removeEdge(uId, vId) {
        const initialLen = this.edges.length;
        this.edges = this.edges.filter(e => {
            if (e.u === uId && e.v === vId) return false;
            if (!e.directed && e.u === vId && e.v === uId) return false; // Undirected match
            return true;
        });
        return this.edges.length < initialLen;
    }

    getVertex(id) {
        return this.vertices.get(id);
    }
    
    getNeighbors(id) {
        const neighbors = [];
        for (const edge of this.edges) {
            if (edge.u === id) {
                neighbors.push({ node: edge.v, weight: edge.weight, directed: edge.directed, isReverse: false });
            } else if (edge.v === id && !edge.directed) {
                neighbors.push({ node: edge.u, weight: edge.weight, directed: false, isReverse: true });
            }
        }
        return neighbors;
    }

    clear() {
        this.vertices.clear();
        this.edges = [];
        this.nextId = 1;
    }

    // Helper to get adjacency list
    getAdjacencyList() {
        const adj = new Map();
        for (const [id] of this.vertices) {
            adj.set(id, []);
        }
        for (const edge of this.edges) {
            adj.get(edge.u).push({ to: edge.v, weight: edge.weight, directed: edge.directed });
            if (!edge.directed) {
                adj.get(edge.v).push({ to: edge.u, weight: edge.weight, directed: false });
            }
        }
        return adj;
    }

    // Get total degree of a vertex
    getDegree(id) {
        if (!this.vertices.has(id)) return -1;
        let degree = 0;
        for (const edge of this.edges) {
            if (!edge.directed) {
                if (edge.u === id && edge.v === id) degree += 2; // Self-loop
                else if (edge.u === id || edge.v === id) degree += 1;
            } else {
                if (edge.u === id) degree += 1;
                if (edge.v === id) degree += 1;
            }
        }
        return degree;
    }

    // Get in-degree of a vertex
    getInDegree(id) {
        if (!this.vertices.has(id)) return -1;
        let inDegree = 0;
        for (const edge of this.edges) {
            if (!edge.directed) {
                if (edge.u === id && edge.v === id) inDegree += 1;
                else if (edge.u === id || edge.v === id) inDegree += 1;
            } else {
                if (edge.v === id) inDegree += 1;
            }
        }
        return inDegree;
    }

    // Get out-degree of a vertex
    getOutDegree(id) {
        if (!this.vertices.has(id)) return -1;
        let outDegree = 0;
        for (const edge of this.edges) {
            if (!edge.directed) {
                if (edge.u === id && edge.v === id) outDegree += 1;
                else if (edge.u === id || edge.v === id) outDegree += 1;
            } else {
                if (edge.u === id) outDegree += 1;
            }
        }
        return outDegree;
    }

    // Check weak connectivity (treat all edges as undirected)
    isConnected() {
        if (this.vertices.size <= 1) return true;
        
        const weakAdj = new Map();
        for (const [id] of this.vertices) {
            weakAdj.set(id, []);
        }
        for (const edge of this.edges) {
            weakAdj.get(edge.u).push(edge.v);
            if (edge.u !== edge.v) {
                weakAdj.get(edge.v).push(edge.u);
            }
        }

        let startNode = null;
        for (const [id] of this.vertices) {
            startNode = id;
            break;
        }

        const visited = new Set();
        const queue = [startNode];
        visited.add(startNode);

        while (queue.length > 0) {
            const node = queue.shift();
            for (const neighbor of weakAdj.get(node)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return visited.size === this.vertices.size;
    }

    // Check strong connectivity (for directed graphs) using simplified Kosaraju algorithm
    isStronglyConnected() {
        if (this.vertices.size <= 1) return true;
        
        const adj = this.getAdjacencyList();
        
        let startNode = null;
        for (const [id] of this.vertices) {
            startNode = id;
            break;
        }

        // Step 1: BFS on original graph
        let visited = new Set();
        let queue = [startNode];
        visited.add(startNode);
        
        while (queue.length > 0) {
            const node = queue.shift();
            for (const edge of adj.get(node)) {
                if (!visited.has(edge.to)) {
                    visited.add(edge.to);
                    queue.push(edge.to);
                }
            }
        }
        
        if (visited.size !== this.vertices.size) return false;

        // Step 2: BFS on reversed graph
        const revAdj = new Map();
        for (const [id] of this.vertices) {
            revAdj.set(id, []);
        }
        for (const edge of this.edges) {
            if (edge.directed) {
                revAdj.get(edge.v).push(edge.u);
            } else {
                revAdj.get(edge.u).push(edge.v);
                if (edge.u !== edge.v) {
                    revAdj.get(edge.v).push(edge.u);
                }
            }
        }

        visited = new Set();
        queue = [startNode];
        visited.add(startNode);
        
        while (queue.length > 0) {
            const node = queue.shift();
            for (const neighbor of revAdj.get(node)) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        return visited.size === this.vertices.size;
    }

    // Check feasibility of algorithms on the graph
    checkFeasibility(algorithmName, startNodeId = null, endNodeId = null) {
        if (this.vertices.size === 0) {
            return { feasible: false, error: "Graph is empty. Please add at least one vertex." };
        }

        switch (algorithmName.toLowerCase()) {
            case 'dfs':
            case 'bfs':
                if (startNodeId === null || !this.vertices.has(startNodeId)) {
                    return { feasible: false, error: "A valid start vertex is required." };
                }
                return { feasible: true, error: null };

            case 'shortest_path':
            case 'shortest path':
            case 'dijkstra':
                if (startNodeId === null || !this.vertices.has(startNodeId)) {
                    return { feasible: false, error: "A valid source vertex is required." };
                }
                if (endNodeId === null || !this.vertices.has(endNodeId)) {
                    return { feasible: false, error: "A valid target vertex is required." };
                }
                const hasNegativeWeight = this.edges.some(e => e.weight < 0);
                if (hasNegativeWeight) {
                    return { feasible: false, error: "Dijkstra's algorithm requires all edge weights to be non-negative." };
                }
                return { feasible: true, error: null };

            case 'mst':
            case 'kruskal':
            case 'prim':
                const hasDirectedEdge = this.edges.some(e => e.directed);
                if (hasDirectedEdge) {
                    return { feasible: false, error: "Minimum Spanning Tree (MST) requires an undirected graph." };
                }
                if (!this.isConnected()) {
                    return { feasible: false, error: "Graph must be connected to form a spanning tree." };
                }
                // Optionally enforce that all edges have weights (default is 1).
                return { feasible: true, error: null };

            case 'euler':
            case 'euler circuit':
            case 'euler_circuit':
                // Skip isolated vertices (degree = 0) when checking connectivity
                let activeVertices = 0;
                let startNode = null;
                for (const [id] of this.vertices) {
                    if (this.getDegree(id) > 0) {
                        activeVertices++;
                        if (!startNode) startNode = id;
                    }
                }

                if (activeVertices === 0) {
                     return { feasible: false, error: "Graph has no edges. At least one edge is required to find an Euler circuit." };
                }

                // BFS to check connectivity of vertices with edges
                const weakAdj = new Map();
                for (const [id] of this.vertices) { weakAdj.set(id, []); }
                for (const edge of this.edges) {
                    weakAdj.get(edge.u).push(edge.v);
                    if (edge.u !== edge.v) weakAdj.get(edge.v).push(edge.u);
                }

                const visited = new Set();
                const queue = [startNode];
                visited.add(startNode);
                while (queue.length > 0) {
                    const node = queue.shift();
                    for (const neighbor of weakAdj.get(node)) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push(neighbor);
                        }
                    }
                }

                let connectedCount = 0;
                for (const id of visited) {
                    if (this.getDegree(id) > 0) connectedCount++;
                }
                
                if (connectedCount !== activeVertices) {
                    return { feasible: false, error: "Graph is not connected (ignoring isolated vertices). All edges must belong to a single connected component." };
                }

                // Check degree conditions for directed vs undirected graphs
                const isDirectedGraph = this.edges.some(e => e.directed);
                if (isDirectedGraph) {
                    let unbalancedCount = 0;
                    for (const [id] of this.vertices) {
                        if (this.getDegree(id) > 0 && this.getInDegree(id) !== this.getOutDegree(id)) {
                            unbalancedCount++;
                        }
                    }
                    if (unbalancedCount > 0) {
                        return { feasible: false, error: `Euler circuit (directed) requires in-degree = out-degree for every vertex. ${unbalancedCount} vertices do not satisfy this condition.` };
                    }
                } else {
                    let oddDegreeCount = 0;
                    for (const [id] of this.vertices) {
                        if (this.getDegree(id) % 2 !== 0) {
                            oddDegreeCount++;
                        }
                    }
                    if (oddDegreeCount > 0) {
                         return { feasible: false, error: `Euler circuit (undirected) requires all vertices to have even degree. Currently, ${oddDegreeCount} vertices have odd degree.` };
                    }
                }

                return { feasible: true, error: null };

            default:
                // Other algorithms are considered feasible if not explicitly configured
                return { feasible: true, error: null };
        }
    }
}

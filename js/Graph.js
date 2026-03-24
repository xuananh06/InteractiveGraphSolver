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
}

// Algorithms.js

class Algorithms {
    
    // DFS
    static dfs(graph, startId) {
        const visited = new Set();
        const traversal = [];
        
        const dfsRecursive = (v) => {
            visited.add(v);
            traversal.push(v);
            const adjs = graph.getNeighbors(v);
            for (const neighbor of adjs) {
                if (!visited.has(neighbor.node)) {
                    dfsRecursive(neighbor.node);
                }
            }
        };

        dfsRecursive(startId);
        return traversal;
    }

    // BFS
    static bfs(graph, startId) {
        const visited = new Set();
        const traversal = [];
        const queue = [startId];
        visited.add(startId);

        while(queue.length > 0) {
            const current = queue.shift();
            traversal.push(current);
            const adjs = graph.getNeighbors(current);
            for (const neighbor of adjs) {
                if (!visited.has(neighbor.node)) {
                    visited.add(neighbor.node);
                    queue.push(neighbor.node);
                }
            }
        }
        return traversal;
    }

    // Shortest Path (Dijkstra)
    static dijkstra(graph, startId, endId) {
        const distances = new Map();
        const previous = new Map();
        const nodes = new Set();

        for (const [id] of graph.vertices) {
            distances.set(id, Infinity);
            nodes.add(id);
        }
        distances.set(startId, 0);

        while (nodes.size > 0) {
            // Unoptimized Priority Q
            let minNode = null;
            let minDistance = Infinity;
            for (const node of nodes) {
                if (distances.get(node) <= minDistance) {
                    minDistance = distances.get(node);
                    minNode = node;
                }
            }

            if (minNode === null || minDistance === Infinity) break;
            
            if (minNode === endId) break;

            nodes.delete(minNode);

            const adjs = graph.getNeighbors(minNode);
            for (const neighbor of adjs) {
                if (!nodes.has(neighbor.node)) continue;

                const alt = distances.get(minNode) + neighbor.weight;
                if (alt < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, alt);
                    previous.set(neighbor.node, minNode);
                }
            }
        }

        const path = [];
        let curr = endId;
        if (previous.has(curr) || curr === startId) {
            while (curr !== undefined) {
                path.unshift(curr);
                curr = previous.get(curr);
            }
        }
        return { path, distance: distances.get(endId) };
    }

    // Minimum Spanning Tree (Prim's) - Undirected
    static mstPrim(graph) {
        if (graph.vertices.size === 0) return { edges: [], totalWeight: 0 };
        
        // Find a start node
        const startId = Array.from(graph.vertices.keys())[0];
        const inMST = new Set([startId]);
        const edges = [];
        let totalWeight = 0;

        let added = true;
        while (added && inMST.size < graph.vertices.size) {
            added = false;
            let minWeight = Infinity;
            let minEdge = null;
            let minU = null, minV = null;

            for (const u of inMST) {
                const neighbors = graph.getNeighbors(u);
                for (const neighbor of neighbors) {
                    const v = neighbor.node;
                    if (!inMST.has(v) && neighbor.weight < minWeight) {
                        minWeight = neighbor.weight;
                        minEdge = graph.edges.find(e => 
                            (e.u === u && e.v === v) || (!e.directed && e.u === v && e.v === u)
                        );
                        minU = u;
                        minV = v;
                    }
                }
            }

            if (minV !== null) {
                inMST.add(minV);
                edges.push(minEdge);
                totalWeight += minWeight;
                added = true;
            }
        }

        return { edges, totalWeight, isConnected: inMST.size === graph.vertices.size };
    }

    // Euler Path / Circuit Check (Undirected logic mostly)
    static eulerCheck(graph) {
        const degrees = new Map();
        for (const [id] of graph.vertices) degrees.set(id, 0);

        for (const edge of graph.edges) {
            // Count degree for undirected
            degrees.set(edge.u, degrees.get(edge.u) + 1);
            if (!edge.directed) {
                degrees.set(edge.v, degrees.get(edge.v) + 1);
            } else {
                // If directed, euler paths are complex (in/out degree). For now, strict warning.
                return { type: 'error', msg: 'Euler algorithm currently only supports completely undirected graphs completely.' };
            }
        }
        
        // Check connectivity of non-zero degree vertices
        if (graph.vertices.size > 0 && !this.isConnectedUndirected(graph)) {
             return { type: 'none', msg: 'Graph is disconnected.' };
        }

        let oddCount = 0;
        let oddVertices = [];
        for (const [v, deg] of degrees.entries()) {
            if (deg % 2 !== 0) {
                oddCount++;
                oddVertices.push(v);
            }
        }

        if (oddCount === 0) {
            return { type: 'circuit', msg: 'Graph has an Euler Circuit (all vertices have even degree).', odds: [] };
        } else if (oddCount === 2) {
            return { type: 'path', msg: 'Graph has an Euler Path (exactly 2 vertices have odd degree).', odds: oddVertices };
        } else {
            return { type: 'none', msg: `No Euler Path or Circuit (found ${oddCount} odd degree vertices).` };
        }
    }

    static isConnectedUndirected(graph) {
        // Find a vertex with degree > 0
        let start = null;
        for (const [id] of graph.vertices) {
            const adjs = graph.getNeighbors(id);
            if (adjs.length > 0) {
                start = id;
                break;
            }
        }
        if (start === null) return true; // Empty or isolated vertices only

        const visited = new Set();
        const queue = [start];
        visited.add(start);

        while (queue.length > 0) {
            const curr = queue.shift();
            const adjs = graph.getNeighbors(curr);
            for (const n of adjs) {
                if (!visited.has(n.node)) {
                    visited.add(n.node);
                    queue.push(n.node);
                }
            }
        }

        // Check if all vertices with edges are visited
        for (const [id] of graph.vertices) {
            if (graph.getNeighbors(id).length > 0 && !visited.has(id)) {
                return false;
            }
        }
        return true;
    }

    // Hamilton Path - Backtracking
    static hamiltonian(graph) {
        if (graph.vertices.size === 0) return { path: null, circuit: null };
        const n = graph.vertices.size;
        let pathFound = null;
        let circuitFound = null;

        const verticesArray = Array.from(graph.vertices.keys());
        
        const backtrack = (path, visited) => {
            if (circuitFound) return; // Stop if already found exactly what we want

            if (path.length === n) {
                pathFound = [...path];
                // Check if it forms a circuit
                const last = path[path.length - 1];
                const first = path[0];
                const adjs = graph.getNeighbors(last);
                if (adjs.some(adj => adj.node === first)) {
                    circuitFound = [...path, first];
                }
                return;
            }

            const current = path[path.length - 1];
            const neighbors = graph.getNeighbors(current);
            for (const neighbor of neighbors) {
                const next = neighbor.node;
                if (!visited.has(next)) {
                    visited.add(next);
                    path.push(next);
                    
                    backtrack(path, visited);
                    
                    path.pop();
                    visited.delete(next);
                }
            }
        };

        for (const start of verticesArray) {
            backtrack([start], new Set([start]));
            if (circuitFound) break;
        }

        return {
            path: pathFound,
            circuit: circuitFound
        };
    }
}

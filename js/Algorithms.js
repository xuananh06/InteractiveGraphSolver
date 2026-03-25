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
    static mstPrim(graph, startId = null) {
        if (graph.vertices.size === 0) return { edges: [], totalWeight: 0 };
        
        // Find a start node if not provided
        if (startId === null || !graph.vertices.has(startId)) {
            startId = Array.from(graph.vertices.keys())[0];
        }
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

    // Euler Path / Circuit Construction (Hierholzer) - Undirected graphs only
    // Returns: { type: 'circuit'|'path'|'none'|'error', msg, path?: number[] }
    static eulerHierholzer(graph, startId = null) {
        if (graph.vertices.size === 0) {
            return { type: 'error', msg: 'Graph is empty.' };
        }

        const hasDirectedEdge = graph.edges.some(e => e.directed);
        const hasUndirectedEdge = graph.edges.some(e => !e.directed);
        if (hasDirectedEdge && hasUndirectedEdge) {
            return { type: 'error', msg: 'Euler path/circuit construction currently supports either fully undirected graphs or fully directed graphs (not a mix).' };
        }
        if (hasDirectedEdge) {
            return this.eulerHierholzerDirected(graph, startId);
        }

        // Degree + pick start
        const degree = new Map();
        for (const [id] of graph.vertices) degree.set(id, 0);
        for (const e of graph.edges) {
            if (e.u === e.v) {
                degree.set(e.u, degree.get(e.u) + 2);
            } else {
                degree.set(e.u, degree.get(e.u) + 1);
                degree.set(e.v, degree.get(e.v) + 1);
            }
        }

        // If no edges, no Euler traversal to show
        const edgeCount = graph.edges.length;
        if (edgeCount === 0) {
            return { type: 'none', msg: 'Graph has no edges.' };
        }

        // Connectivity check (ignore isolated vertices)
        if (!this.isConnectedUndirected(graph)) {
            return { type: 'none', msg: 'Graph is disconnected.' };
        }

        const oddVertices = [];
        for (const [id, deg] of degree.entries()) {
            if (deg % 2 !== 0) oddVertices.push(id);
        }

        if (!(oddVertices.length === 0 || oddVertices.length === 2)) {
            return { type: 'none', msg: `No Euler Path or Circuit (found ${oddVertices.length} odd degree vertices).` };
        }

        let start = null;
        if (oddVertices.length === 2) {
            if (startId !== null && oddVertices.includes(startId)) {
                start = startId;
            } else {
                start = oddVertices[0];
            }
        } else {
            // circuit: any vertex with degree > 0
            if (startId !== null && graph.getDegree(startId) > 0) {
                start = startId;
            } else {
                for (const [id, deg] of degree.entries()) {
                    if (deg > 0) {
                        start = id;
                        break;
                    }
                }
            }
        }
        if (start === null) {
            return { type: 'none', msg: 'No Euler Path or Circuit (no non-isolated vertices).' };
        }

        // Build local adjacency (multiset) for edge deletions
        const adj = new Map();
        for (const [id] of graph.vertices) adj.set(id, []);
        for (const e of graph.edges) {
            if (e.u === e.v) {
                // self-loop contributes 2 to degree, represent as two half-edges
                adj.get(e.u).push(e.v);
                adj.get(e.u).push(e.v);
            } else {
                adj.get(e.u).push(e.v);
                adj.get(e.v).push(e.u);
            }
        }

        const removeNeighbor = (list, value) => {
            const idx = list.lastIndexOf(value);
            if (idx !== -1) list.splice(idx, 1);
        };

        // Hierholzer
        const stack = [start];
        const circuit = [];

        while (stack.length > 0) {
            const v = stack[stack.length - 1];
            const neighbors = adj.get(v);
            if (neighbors && neighbors.length > 0) {
                const u = neighbors.pop();
                if (u === v) {
                    // self-loop: remove the matching half-edge too
                    removeNeighbor(neighbors, v);
                } else {
                    removeNeighbor(adj.get(u), v);
                }
                stack.push(u);
            } else {
                circuit.push(stack.pop());
            }
        }

        const path = circuit.reverse();
        if (path.length !== edgeCount + 1) {
            return { type: 'none', msg: 'No Euler Path/Circuit covering all edges (graph may be disconnected by edges).' };
        }

        if (oddVertices.length === 0) {
            return { type: 'circuit', msg: 'Euler Circuit found (Hierholzer).', path };
        }
        return { type: 'path', msg: 'Euler Path found (Hierholzer).', path };
    }

    // Euler Path / Circuit Construction (Hierholzer) - Directed graphs only
    static eulerHierholzerDirected(graph, startId = null) {
        if (graph.edges.length === 0) {
            return { type: 'none', msg: 'Graph has no edges.' };
        }

        // Ensure graph is fully directed
        if (graph.edges.some(e => !e.directed)) {
            return { type: 'error', msg: 'Directed Euler requires a fully directed graph.' };
        }

        const activeIds = [];
        for (const [id] of graph.vertices) {
            if (graph.getDegree(id) > 0) activeIds.push(id);
        }
        if (activeIds.length === 0) {
            return { type: 'none', msg: 'Graph has no non-isolated vertices/edges.' };
        }

        // Compute in/out degrees
        const inDeg = new Map();
        const outDeg = new Map();
        for (const [id] of graph.vertices) {
            inDeg.set(id, 0);
            outDeg.set(id, 0);
        }
        for (const e of graph.edges) {
            outDeg.set(e.u, outDeg.get(e.u) + 1);
            inDeg.set(e.v, inDeg.get(e.v) + 1);
        }

        const startCandidates = [];
        const endCandidates = [];
        for (const id of activeIds) {
            const diff = outDeg.get(id) - inDeg.get(id);
            if (diff === 1) startCandidates.push(id);
            else if (diff === -1) endCandidates.push(id);
            else if (diff === 0) {
                // ok
            } else {
                return { type: 'none', msg: `No Euler path/circuit: vertex ${id} has out-in = ${diff}.` };
            }
        }

        let type = null;
        let start = null;
        const isCircuit = startCandidates.length === 0 && endCandidates.length === 0;
        const isPath = startCandidates.length === 1 && endCandidates.length === 1;
        if (isCircuit) {
            type = 'circuit';
            start = activeIds[0];
        } else if (isPath) {
            type = 'path';
            start = startCandidates[0];
        } else {
            return {
                type: 'none',
                msg: `No Euler path/circuit: starts(diff=+1)=${startCandidates.length}, ends(diff=-1)=${endCandidates.length}.`
            };
        }

        // Connectivity check (strong reachability) by forward & reverse BFS
        const adj = new Map();
        const revAdj = new Map();
        for (const id of activeIds) {
            adj.set(id, []);
            revAdj.set(id, []);
        }
        for (const e of graph.edges) {
            if (!adj.has(e.u) || !revAdj.has(e.v)) continue;
            adj.get(e.u).push(e.v);
            revAdj.get(e.v).push(e.u);
        }

        let startForConn = start;
        let endForConn = null;
        if (type === 'path') {
            endForConn = endCandidates[0];
            // Augment with extra edge end -> start
            if (adj.has(endForConn)) adj.get(endForConn).push(startForConn);
            if (revAdj.has(startForConn)) revAdj.get(startForConn).push(endForConn);
        }

        const bfs = (gAdj) => {
            const visited = new Set();
            const q = [startForConn];
            visited.add(startForConn);
            while (q.length > 0) {
                const v = q.shift();
                for (const n of gAdj.get(v)) {
                    if (!visited.has(n)) {
                        visited.add(n);
                        q.push(n);
                    }
                }
            }
            return visited;
        };

        const visitedFwd = bfs(adj);
        if (visitedFwd.size !== activeIds.length) {
            return { type: 'none', msg: 'No Euler path/circuit: forward reachability condition failed.' };
        }
        const visitedRev = bfs(revAdj);
        if (visitedRev.size !== activeIds.length) {
            return { type: 'none', msg: 'No Euler path/circuit: reverse reachability condition failed.' };
        }

        // Hierholzer using edge-index multiset
        const m = graph.edges.length;
        const used = new Array(m).fill(false);
        const adjEdges = new Map();
        for (const id of graph.vertices.keys()) adjEdges.set(id, []);
        for (let i = 0; i < m; i++) {
            const e = graph.edges[i];
            adjEdges.get(e.u).push(i);
        }

        const ptr = new Map();
        for (const id of graph.vertices.keys()) ptr.set(id, 0);

        const stack = [start];
        const circuit = [];

        while (stack.length > 0) {
            const v = stack[stack.length - 1];
            const list = adjEdges.get(v) || [];
            let i = ptr.get(v) || 0;

            while (i < list.length && used[list[i]]) i++;
            ptr.set(v, i);

            if (i === list.length) {
                circuit.push(stack.pop());
            } else {
                const edgeIndex = list[i];
                used[edgeIndex] = true;
                ptr.set(v, i + 1);
                const nextV = graph.edges[edgeIndex].v;
                stack.push(nextV);
            }
        }

        const path = circuit.reverse();
        if (path.length !== m + 1) {
            return { type: 'none', msg: 'No Euler path/circuit covering all edges.' };
        }

        return { type, msg: type === 'circuit' ? 'Euler Circuit found (Hierholzer).' : 'Euler Path found (Hierholzer).', path };
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
    static hamiltonian(graph, startId = null) {
        if (graph.vertices.size === 0) return { path: null, circuit: null };
        const n = graph.vertices.size;
        let pathFound = null;
        let circuitFound = null;

        const verticesArray = (startId !== null && graph.vertices.has(startId)) 
            ? [startId] 
            : Array.from(graph.vertices.keys());
        
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

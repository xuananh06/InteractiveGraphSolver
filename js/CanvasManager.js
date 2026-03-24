// CanvasManager.js

class CanvasManager {
    constructor(canvasId, graph) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.graph = graph;
        
        this.bgImage = null;
        this.camera = { x: 0, y: 0, zoom: 1 };
        
        this.nodeRadius = 16;
        
        // Interaction state
        this.hoveredNodeId = null;
        this.selectedNodeId = null;
        this.hoveredEdge = null; // {u, v}
        this.activePath = null; // Array of node IDs representing a highlighted path
        this.activeEdges = null; // Array of edge objects to highlight

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }

    setBackgroundImage(imgSrc) {
        const img = new Image();
        img.onload = () => {
            this.bgImage = img;
            this.draw();
        };
        img.src = imgSrc;
    }

    clearBackgroundImage() {
        this.bgImage = null;
        this.draw();
    }

    clearHighlights() {
        this.activePath = null;
        this.activeEdges = null;
        this.draw();
    }

    setPathHighlight(path) {
        this.activePath = path;
        this.draw();
    }

    setEdgesHighlight(edges) {
        this.activeEdges = edges;
        this.draw();
    }

    // Convert screen coordinates to world/graph coordinates
    screenToWorld(x, y) {
        return {
            x: (x - this.camera.x) / this.camera.zoom,
            y: (y - this.camera.y) / this.camera.zoom
        };
    }

    // Convert world coordinates to screen coords
    worldToScreen(x, y) {
        return {
            x: x * this.camera.zoom + this.camera.x,
            y: y * this.camera.zoom + this.camera.y
        };
    }

    getNodeAt(sx, sy) {
        const {x, y} = this.screenToWorld(sx, sy);
        for (const [id, node] of this.graph.vertices) {
            const dx = node.x - x;
            const dy = node.y - y;
            if (dx*dx + dy*dy <= this.nodeRadius * this.nodeRadius) {
                return id;
            }
        }
        return null;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera transforms
        this.ctx.save();
        this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);

        // Draw background image
        if (this.bgImage) {
            // Draw image covering bounds or centered. For simplicity, we draw it at 0,0
            this.ctx.drawImage(this.bgImage, 0, 0);
        }

        // Draw edges
        for (const edge of this.graph.edges) {
            this.drawEdge(edge);
        }

        // Draw vertices
        for (const [id, node] of this.graph.vertices) {
            this.drawNode(node);
        }

        this.ctx.restore();
    }

    drawEdge(edge) {
        const u = this.graph.getVertex(edge.u);
        const v = this.graph.getVertex(edge.v);
        if (!u || !v) return;

        let isHighlighted = false;
        if (this.activePath) {
            for (let i = 0; i < this.activePath.length - 1; i++) {
                if ((this.activePath[i] === u.id && this.activePath[i+1] === v.id) || 
                   (!edge.directed && this.activePath[i] === v.id && this.activePath[i+1] === u.id)) {
                    isHighlighted = true;
                    break;
                }
            }
        }
        if (this.activeEdges) {
            if (this.activeEdges.some(e => e.u === edge.u && e.v === edge.v)) {
                isHighlighted = true;
            }
        }

        this.ctx.beginPath();
        this.ctx.moveTo(u.x, u.y);
        this.ctx.lineTo(v.x, v.y);
        
        this.ctx.lineWidth = isHighlighted ? 4 : 2;
        this.ctx.strokeStyle = isHighlighted ? '#10b981' : '#9ca3af'; // theme highlight vs edge-color
        
        // If it's hovered
        if (this.hoveredEdge && this.hoveredEdge.u === edge.u && this.hoveredEdge.v === edge.v) {
            this.ctx.strokeStyle = '#f59e0b'; // warning color
            this.ctx.lineWidth = 3;
        }

        this.ctx.stroke();

        // Draw directional arrow if directed
        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;
        
        if (edge.directed) {
            const angle = Math.atan2(v.y - u.y, v.x - u.x);
            const arrowSize = 10;
            this.ctx.beginPath();
            this.ctx.moveTo(midX, midY);
            this.ctx.lineTo(midX - arrowSize * Math.cos(angle - Math.PI/6), midY - arrowSize * Math.sin(angle - Math.PI/6));
            this.ctx.lineTo(midX - arrowSize * Math.cos(angle + Math.PI/6), midY - arrowSize * Math.sin(angle + Math.PI/6));
            this.ctx.closePath();
            this.ctx.fillStyle = this.ctx.strokeStyle;
            this.ctx.fill();
        }

        // Draw weight badge
        if (edge.weight !== 1) {
            this.ctx.fillStyle = 'rgba(22, 27, 34, 0.9)'; // panel bg
            this.ctx.beginPath();
            this.ctx.roundRect(midX - 12, midY - 10, 24, 20, 4);
            this.ctx.fill();
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            this.ctx.fillStyle = '#e6edf3';
            this.ctx.font = '12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.weight, midX, midY);
        }
    }

    drawNode(node) {
        const isHovered = this.hoveredNodeId === node.id;
        const isSelected = this.selectedNodeId === node.id;
        const isActivePath = this.activePath && this.activePath.includes(node.id);
        
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
        
        if (isSelected) {
            this.ctx.fillStyle = '#f59e0b'; // Selected Color
        } else if (isActivePath) {
            this.ctx.fillStyle = '#10b981'; // Path highlight color
        } else {
            this.ctx.fillStyle = '#2563eb'; // Default vertex color
        }

        if (isHovered) {
             this.ctx.fillStyle = '#60a5fa'; // lighter blue
        }

        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#e6edf3';
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.id, node.x, node.y);
    }
}

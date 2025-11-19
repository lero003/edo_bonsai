class Bonsai {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.branches = [];
        this.reset();
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
        this.draw();
    }

    reset() {
        this.branches = [];
        // Initial trunk
        this.addBranch(this.canvas.width / 2, this.canvas.height, -90, 80, 10);
    }

    addBranch(x, y, angle, length, width) {
        this.branches.push({ x, y, angle, length, width, growing: true, currentLength: 0 });
    }

    grow(factor = 1) {
        // Add new branches to the ends of existing finished branches
        const newBranches = [];

        // Only grow from the "tips" of the tree (leaf nodes in the graph)
        // For simplicity, we'll just pick random existing branches to fork if they are fully grown
        // But a better way is to track "tips".

        // Simple recursive step simulation:
        // Find the last few branches added
        const tips = this.branches.slice(-5); // Just take recent ones

        tips.forEach(branch => {
            if (Math.random() > 0.3) { // 70% chance to branch
                const angleDev = (Math.random() * 60 - 30);
                const newAngle = branch.angle + angleDev;
                const newLength = branch.length * 0.8;
                const newWidth = branch.width * 0.7;

                // Calculate end point of current branch
                const rad = branch.angle * Math.PI / 180;
                const endX = branch.x + Math.cos(rad) * branch.length;
                const endY = branch.y + Math.sin(rad) * branch.length;

                if (newLength > 5) {
                    this.addBranch(endX, endY, newAngle, newLength, newWidth);
                    // Maybe add a second fork
                    if (Math.random() > 0.5) {
                        this.addBranch(endX, endY, branch.angle - angleDev, newLength, newWidth);
                    }
                }
            }
        });

        this.animate();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all branches
        this.branches.forEach(branch => {
            this.ctx.beginPath();
            this.ctx.moveTo(branch.x, branch.y);

            // Calculate end point based on current growth
            // For static drawing, use full length. For animation, we could use currentLength
            const len = branch.length;
            const rad = branch.angle * Math.PI / 180;
            const endX = branch.x + Math.cos(rad) * len;
            const endY = branch.y + Math.sin(rad) * len;

            this.ctx.lineTo(endX, endY);
            this.ctx.lineWidth = branch.width;
            this.ctx.lineCap = 'round';
            this.ctx.strokeStyle = '#1a1a1a'; // Ink color
            this.ctx.stroke();

            // Draw "Leaves" or "Glitch" at the end if it's a tip
            if (branch.width < 2) {
                this.ctx.fillStyle = Math.random() > 0.9 ? '#00ff41' : '#2a2a2a'; // Occasional cyber leaf
                this.ctx.beginPath();
                this.ctx.arc(endX, endY, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    animate() {
        // Simple redraw for now. 
        // In a full version, we would animate 'currentLength' from 0 to length.
        this.draw();
    }
}

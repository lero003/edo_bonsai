const canvas = document.getElementById('bonsaiCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Configuration for the Wabi-Sabi + Digital aesthetic
const config = {
    trunkColor: '#2c2c2c', // Sumi ink
    leafColor: 'rgba(74, 108, 74, 0.8)', // Moss green
    digitalColor: '#00ff00', // Matrix green
    bgColor: '#fcfbf9',
    maxDepth: 12,
    branchAngle: 0.4,
    growthFactor: 0.8,
};

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function drawDigitalLeaf(x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Digital Glitch / Binary Leaf
    const isBinary = Math.random() > 0.5;

    if (isBinary) {
        // Increased font size for more visibility
        ctx.font = `${randomRange(10, 14)}px monospace`;
        ctx.fillStyle = Math.random() > 0.7 ? config.digitalColor : config.leafColor;
        ctx.fillText(Math.random() > 0.5 ? '0' : '1', 0, 0);
    } else {
        // Pixelated square leaf - Increased size
        const size = randomRange(5, 12);
        ctx.fillStyle = config.leafColor;
        ctx.fillRect(0, 0, size, size);
    }

    ctx.restore();
}

function drawBranch(x, y, length, angle, width, depth) {
    if (depth === 0) {
        // Draw a DENSE cluster of leaves at the end
        // Increased from 1-2 to 5-10 leaves for more volume
        const leafCount = Math.floor(randomRange(5, 10));
        for (let i = 0; i < leafCount; i++) {
            // Spread them out a bit more to create a "canopy" feel
            const offsetX = randomRange(-25, 25);
            const offsetY = randomRange(-25, 25);
            drawDigitalLeaf(x + offsetX, y + offsetY);
        }
        return;
    }

    // Calculate new end point with some organic curvature
    // Bezier curve control point
    const cpX = x + Math.cos(angle) * (length / 2) + randomRange(-10, 10);
    const cpY = y + Math.sin(angle) * (length / 2) + randomRange(-10, 10);

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Draw the branch (Sumi-e style: varying width)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);

    ctx.lineWidth = width;
    ctx.strokeStyle = config.trunkColor;
    ctx.lineCap = 'round';

    // Ink bleed effect (lower opacity for edges)
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Recursive calls
    // Slightly increased branching factor for fuller trees
    const branchCount = Math.floor(randomRange(2, 4));

    for (let i = 0; i < branchCount; i++) {
        const newAngle = angle + randomRange(-config.branchAngle, config.branchAngle);
        const newLength = length * config.growthFactor * randomRange(0.7, 1.0);
        const newWidth = width * 0.7;

        if (newLength > 5) {
            drawBranch(endX, endY, newLength, newAngle, newWidth, depth - 1);
        } else {
            // If branch is too small, draw a leaf cluster here too
            drawDigitalLeaf(endX, endY);
            if (Math.random() > 0.5) drawDigitalLeaf(endX + randomRange(-10, 10), endY + randomRange(-10, 10));
        }
    }
}

function generateBonsai() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Start from bottom center
    const startX = canvas.width / 2;
    const startY = canvas.height;

    // Initial trunk
    const trunkLength = randomRange(canvas.height * 0.15, canvas.height * 0.25);
    const trunkWidth = randomRange(15, 25);
    const startAngle = -Math.PI / 2 + randomRange(-0.1, 0.1);

    drawBranch(startX, startY, trunkLength, startAngle, trunkWidth, config.maxDepth);
}

window.generateBonsai = generateBonsai;

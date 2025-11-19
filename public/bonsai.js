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
        ctx.font = '10px monospace';
        ctx.fillStyle = Math.random() > 0.7 ? config.digitalColor : config.leafColor;
        ctx.fillText(Math.random() > 0.5 ? '0' : '1', 0, 0);
    } else {
        // Pixelated square leaf
        const size = randomRange(3, 8);
        ctx.fillStyle = config.leafColor;
        ctx.fillRect(0, 0, size, size);
    }

    ctx.restore();
}

function drawBranch(x, y, length, angle, width, depth) {
    if (depth === 0) {
        // Draw digital leaves at the end
        drawDigitalLeaf(x, y);
        if (Math.random() > 0.5) drawDigitalLeaf(x + randomRange(-15, 15), y + randomRange(-15, 15));
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
    const branchCount = Math.floor(randomRange(1, 3.5));

    for (let i = 0; i < branchCount; i++) {
        const newAngle = angle + randomRange(-config.branchAngle, config.branchAngle);
        const newLength = length * config.growthFactor * randomRange(0.7, 1.0);
        const newWidth = width * 0.7;

        if (newLength > 5) {
            drawBranch(endX, endY, newLength, newAngle, newWidth, depth - 1);
        } else {
            drawDigitalLeaf(endX, endY);
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

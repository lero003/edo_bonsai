const canvas = document.getElementById('bonsaiCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Configuration for the Wabi-Sabi aesthetic
const config = {
    trunkColor: '#2c2c2c', // Sumi ink
    leafColor: 'rgba(74, 108, 74, 0.6)', // Moss green with transparency
    leafColor2: 'rgba(143, 168, 143, 0.5)', // Pale green
    bgColor: '#fcfbf9',
    maxDepth: 12,
    branchAngle: 0.3, // Base angle variance
    growthFactor: 0.8, // How much branches shorten
};

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function drawLeaf(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(randomRange(0, Math.PI * 2));

    const size = randomRange(5, 15);

    // Draw a simple organic leaf/needle cluster
    ctx.fillStyle = Math.random() > 0.5 ? config.leafColor : config.leafColor2;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawBranch(x, y, length, angle, width, depth) {
    if (depth === 0) {
        // Draw leaves at the end
        drawLeaf(x, y);
        // Maybe draw a few more around it for volume
        if (Math.random() > 0.5) drawLeaf(x + randomRange(-10, 10), y + randomRange(-10, 10));
        return;
    }

    // Calculate new end point
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Draw the branch
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Quadratic curve for more organic look? Or simple line?
    // Let's stick to lines but maybe slight curves could be nice later.
    // For now, simple lines with varying width.
    ctx.lineTo(endX, endY);

    ctx.lineWidth = width;
    ctx.strokeStyle = config.trunkColor;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Recursive calls
    // Number of branches: usually 2, sometimes 1 or 3
    const branchCount = Math.floor(randomRange(1, 4));

    for (let i = 0; i < branchCount; i++) {
        // Variation in angle
        const newAngle = angle + randomRange(-config.branchAngle, config.branchAngle) + (Math.random() - 0.5);

        // Variation in length
        const newLength = length * config.growthFactor * randomRange(0.7, 1.0);

        // Variation in width
        const newWidth = width * 0.7;

        // Don't continue if too small
        if (newLength > 5) {
            // Add a slight delay for "growth" animation effect? 
            // For now, instant generation.
            drawBranch(endX, endY, newLength, newAngle, newWidth, depth - 1);
        } else {
            drawLeaf(endX, endY);
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

    // Slight lean
    const startAngle = -Math.PI / 2 + randomRange(-0.1, 0.1);

    drawBranch(startX, startY, trunkLength, startAngle, trunkWidth, config.maxDepth);
}

// Export for use in app.js
window.generateBonsai = generateBonsai;

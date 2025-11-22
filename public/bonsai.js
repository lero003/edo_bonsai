const canvas = document.getElementById('bonsaiCanvas');
const ctx = canvas.getContext('2d');

// Animation State
let animationId = null;
let staticSceneCanvas = null;
let particles = [];
let flyingObjects = [];
let currentSeason = 'summer';

// Set canvas size to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (staticSceneCanvas) {
        // If we resize, we might need to regenerate or at least re-center. 
        // For now, let's just clear the static scene to force a regenerate if needed, 
        // but strictly speaking the user might just want it to scale.
        // Simpler approach: just let the next generation fix it, or re-render if we stored the tree data.
        // For this iteration, we'll just accept it might look cropped until regenerated.
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Configuration for the Wabi-Sabi + Digital aesthetic
const config = {
    trunkColor: '#2c2c2c', // Sumi ink
    bgColor: '#fcfbf9',
    maxDepth: 12,
    branchAngle: 0.4,
    growthFactor: 0.8,
    seasons: {
        spring: {
            leafColors: ['rgba(255, 183, 197, 0.8)', 'rgba(255, 192, 203, 0.8)', '#ff69b4'], // Sakura pinks
            digitalColor: '#ff1493', // Deep pink
            particleColor: 'rgba(255, 105, 180, 0.8)', // HotPink, more visible
            particleType: 'petal'
        },
        summer: {
            leafColors: ['rgba(74, 108, 74, 0.8)'], // Moss green
            digitalColor: '#00ff00', // Matrix green
            particleColor: null, // No particles usually, or maybe fireflies?
            particleType: 'none'
        },
        autumn: {
            leafColors: ['rgba(204, 85, 0, 0.8)', 'rgba(218, 165, 32, 0.8)', 'rgba(165, 42, 42, 0.8)'], // Orange, Gold, Brown
            digitalColor: '#ff4500', // Orange Red
            particleColor: 'rgba(204, 85, 0, 0.8)', // Darker Orange
            particleType: 'leaf'
        },
        winter: {
            leafColors: ['rgba(255, 255, 255, 0.9)', 'rgba(240, 248, 255, 0.9)'], // White, AliceBlue
            digitalColor: '#00ffff', // Cyan
            particleColor: 'rgba(200, 220, 255, 0.9)', // Light Blue-ish for visibility
            particleType: 'snow'
        }
    }
};

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function drawDigitalLeaf(ctxToDraw, x, y, seasonConfig) {
    ctxToDraw.save();
    ctxToDraw.translate(x, y);

    // Digital Glitch / Binary Leaf
    const isBinary = Math.random() > 0.5;
    const leafColor = getRandomElement(seasonConfig.leafColors);

    if (isBinary) {
        // Increased font size for more visibility
        ctxToDraw.font = `${randomRange(10, 14)}px monospace`;
        ctxToDraw.fillStyle = Math.random() > 0.7 ? seasonConfig.digitalColor : leafColor;
        ctxToDraw.fillText(Math.random() > 0.5 ? '0' : '1', 0, 0);
    } else {
        // Pixelated square leaf - Increased size
        const size = randomRange(5, 12);
        ctxToDraw.fillStyle = leafColor;
        ctxToDraw.fillRect(0, 0, size, size);
    }

    ctxToDraw.restore();
}

function drawBranch(ctxToDraw, x, y, length, angle, width, depth, seasonConfig) {
    if (depth === 0) {
        // Draw a DENSE cluster of leaves at the end
        const leafCount = Math.floor(randomRange(5, 10));
        for (let i = 0; i < leafCount; i++) {
            const offsetX = randomRange(-25, 25);
            const offsetY = randomRange(-25, 25);
            drawDigitalLeaf(ctxToDraw, x + offsetX, y + offsetY, seasonConfig);
        }
        return;
    }

    // Calculate new end point with some organic curvature
    const cpX = x + Math.cos(angle) * (length / 2) + randomRange(-10, 10);
    const cpY = y + Math.sin(angle) * (length / 2) + randomRange(-10, 10);

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Draw the branch
    ctxToDraw.beginPath();
    ctxToDraw.moveTo(x, y);
    ctxToDraw.quadraticCurveTo(cpX, cpY, endX, endY);

    ctxToDraw.lineWidth = width;
    ctxToDraw.strokeStyle = config.trunkColor;
    ctxToDraw.lineCap = 'round';

    // Ink bleed effect
    ctxToDraw.globalAlpha = 0.8;
    ctxToDraw.stroke();
    ctxToDraw.globalAlpha = 1.0;

    // Recursive calls
    const branchCount = Math.floor(randomRange(2, 4));

    for (let i = 0; i < branchCount; i++) {
        const newAngle = angle + randomRange(-config.branchAngle, config.branchAngle);
        const newLength = length * config.growthFactor * randomRange(0.7, 1.0);
        const newWidth = width * 0.7;

        if (newLength > 5) {
            drawBranch(ctxToDraw, endX, endY, newLength, newAngle, newWidth, depth - 1, seasonConfig);
        } else {
            drawDigitalLeaf(ctxToDraw, endX, endY, seasonConfig);
            if (Math.random() > 0.5) drawDigitalLeaf(ctxToDraw, endX + randomRange(-10, 10), endY + randomRange(-10, 10), seasonConfig);
        }
    }
}

function drawInkMountain(ctxToDraw, baseY, color, amplitude) {
    // Create a path for the mountain ridge
    let points = [];
    let x = 0;
    points.push({ x: 0, y: baseY });

    while (x < canvas.width) {
        const nextX = x + randomRange(50, 150);
        const nextY = baseY - randomRange(0, amplitude);
        points.push({ x: nextX, y: nextY });
        x = nextX;
    }
    points.push({ x: canvas.width, y: baseY });
    points.push({ x: canvas.width, y: canvas.height });
    points.push({ x: 0, y: canvas.height });

    ctxToDraw.save();

    // Soft edge effect
    ctxToDraw.shadowColor = color;
    ctxToDraw.shadowBlur = 20;
    ctxToDraw.shadowOffsetX = 0;
    ctxToDraw.shadowOffsetY = 0;

    // Gradient Fill (Tarashikomi - dripping in effect)
    // Fade from color at top to transparent/mist at bottom
    const gradient = ctxToDraw.createLinearGradient(0, baseY - amplitude, 0, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Fade to mist

    ctxToDraw.fillStyle = gradient;

    // Draw the shape
    ctxToDraw.beginPath();
    ctxToDraw.moveTo(points[0].x, points[0].y);

    // Smooth curves for the ridge
    for (let i = 1; i < points.length - 2; i++) { // Start from 1 to use points[i-1] and points[i]
        const p1 = points[i - 1];
        const p2 = points[i];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctxToDraw.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    // Connect to corners
    const lastRidge = points[points.length - 3];
    ctxToDraw.lineTo(lastRidge.x, lastRidge.y);
    ctxToDraw.lineTo(points[points.length - 2].x, points[points.length - 2].y); // Bottom Right
    ctxToDraw.lineTo(points[points.length - 1].x, points[points.length - 1].y); // Bottom Left

    ctxToDraw.closePath();
    ctxToDraw.fill();

    // Layering: Draw a second, slightly offset layer for depth (Bokashi)
    ctxToDraw.globalCompositeOperation = 'source-atop';
    ctxToDraw.fillStyle = color;
    ctxToDraw.globalAlpha = 0.3;
    ctxToDraw.shadowBlur = 40;
    ctxToDraw.fill();

    ctxToDraw.restore();
}

function drawInkCloud(ctxToDraw, x, y, size) {
    ctxToDraw.save();
    ctxToDraw.translate(x, y);

    const puffs = Math.floor(randomRange(3, 6));

    for (let i = 0; i < puffs; i++) {
        const puffSize = size * randomRange(0.6, 1.2);
        const offsetX = randomRange(-size / 2, size / 2);
        const offsetY = randomRange(-size / 4, size / 4);

        // Radial Gradient for soft puff
        const gradient = ctxToDraw.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, puffSize);
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0.08)'); // Center
        gradient.addColorStop(0.6, 'rgba(200, 200, 200, 0.02)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)'); // Edge

        ctxToDraw.fillStyle = gradient;
        ctxToDraw.beginPath();
        ctxToDraw.arc(offsetX, offsetY, puffSize, 0, Math.PI * 2);
        ctxToDraw.fill();
    }

    ctxToDraw.restore();
}

function drawBackground(ctxToDraw) {
    // Distant mountains (Very faint, misty)
    drawInkMountain(ctxToDraw, canvas.height * 0.75, 'rgba(40, 40, 40, 0.08)', 120);

    // Mid-ground mountains
    drawInkMountain(ctxToDraw, canvas.height * 0.85, 'rgba(30, 30, 30, 0.12)', 80);

    // Clouds (Soft wash)
    const cloudCount = 4;
    for (let i = 0; i < cloudCount; i++) {
        drawInkCloud(
            ctxToDraw,
            randomRange(0, canvas.width),
            randomRange(0, canvas.height * 0.4),
            randomRange(80, 200)
        );
    }
}

// --- Animation Classes ---

class Particle {
    constructor(type, color) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height; // Start above
        this.size = randomRange(2, 5);
        this.speedY = randomRange(1, 3);
        this.speedX = randomRange(-1, 1);
        this.color = color;
        this.type = type;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = randomRange(-0.05, 0.05);
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5; // Swaying
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;

        if (this.type === 'snow') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            // Add subtle outline for snow to pop against white bg
            ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else {
            // Petal or Leaf shape
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Add subtle outline for petals too if needed, but color change might be enough
            if (this.type === 'petal') {
                ctx.strokeStyle = 'rgba(255, 105, 180, 0.3)';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

class FlyingObject {
    constructor() {
        this.reset();
    }

    reset() {
        this.type = Math.random() > 0.5 ? 'bird' : 'ufo';
        this.y = randomRange(50, canvas.height * 0.4);
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.x = this.direction === 1 ? -50 : canvas.width + 50;
        this.speed = randomRange(0.5, 1.5); // Slower speed
        this.active = false;
        this.cooldown = randomRange(200, 500); // Frames to wait
    }

    update() {
        if (!this.active) {
            this.cooldown--;
            if (this.cooldown <= 0) {
                this.active = true;
                // Randomize type again on respawn
                this.type = Math.random() > 0.8 ? 'ufo' : 'bird'; // UFOs are rarer
            }
            return;
        }

        this.x += this.speed * this.direction;

        if ((this.direction === 1 && this.x > canvas.width + 50) ||
            (this.direction === -1 && this.x < -50)) {
            this.reset();
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction === -1) ctx.scale(-1, 1); // Flip if going left

        if (this.type === 'bird') {
            ctx.strokeStyle = '#2c2c2c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Simple V shape bird
            ctx.moveTo(-10, -5);
            ctx.quadraticCurveTo(0, 5, 10, -5);
            ctx.stroke();
        } else if (this.type === 'ufo') {
            // Simple UFO
            ctx.fillStyle = '#a9a9a9';
            ctx.beginPath();
            ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Dome
            ctx.fillStyle = '#00ffff'; // Cyan dome
            ctx.beginPath();
            ctx.arc(0, -5, 8, Math.PI, 0);
            ctx.fill();
            // Lights
            ctx.fillStyle = 'yellow';
            for (let i = -10; i <= 10; i += 10) {
                ctx.beginPath();
                ctx.arc(i, 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}

function initAnimation(seasonConfig) {
    particles = [];
    flyingObjects = [];

    // Init Particles
    if (seasonConfig.particleType !== 'none') {
        const count = seasonConfig.particleType === 'snow' ? 100 : 30;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(seasonConfig.particleType, seasonConfig.particleColor));
        }
    }

    // Init Flying Object (just one for now that respawns)
    flyingObjects.push(new FlyingObject());
}

function animate() {
    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw static scene (background + tree)
    if (staticSceneCanvas) {
        ctx.drawImage(staticSceneCanvas, 0, 0);
    }

    // Update and Draw Particles
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    // Update and Draw Flying Objects
    flyingObjects.forEach(obj => {
        obj.update();
        obj.draw(ctx);
    });

    animationId = requestAnimationFrame(animate);
}

function generateBonsai() {
    // Stop previous animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    // Pick a random season
    const seasonKeys = Object.keys(config.seasons);
    const seasonKey = seasonKeys[Math.floor(Math.random() * seasonKeys.length)];
    currentSeason = seasonKey;
    const seasonConfig = config.seasons[seasonKey];

    console.log(`Generating Bonsai for season: ${seasonKey}`);

    // Create an offscreen canvas to hold the static scene
    staticSceneCanvas = document.createElement('canvas');
    staticSceneCanvas.width = canvas.width;
    staticSceneCanvas.height = canvas.height;
    const staticCtx = staticSceneCanvas.getContext('2d');

    // Draw Background to static canvas
    drawBackground(staticCtx);

    // Draw Tree to static canvas
    const startX = canvas.width / 2;
    const startY = canvas.height;
    const trunkLength = randomRange(canvas.height * 0.15, canvas.height * 0.25);
    const trunkWidth = randomRange(15, 25);
    const startAngle = -Math.PI / 2 + randomRange(-0.1, 0.1);

    drawBranch(staticCtx, startX, startY, trunkLength, startAngle, trunkWidth, config.maxDepth, seasonConfig);

    // Initialize Animation elements
    initAnimation(seasonConfig);

    // Start Animation Loop
    animate();
}

window.generateBonsai = generateBonsai;

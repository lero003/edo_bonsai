const canvas = document.getElementById('bonsaiCanvas');
const ctx = canvas.getContext('2d');

// Animation State
let animationId = null;
let staticSceneCanvas = null; // Holds the background
let treeCanvas = null; // Holds the fully grown tree (for optimization)
let particles = [];
let flyingObjects = [];
let currentSeason = 'summer';
let currentTreeData = null;

// Growth State
let isGrowing = false;
let growthProgress = 0; // 0.0 to 1.0
const GROWTH_SPEED = 0.005;

// Glitch State
let glitchIntensity = 0;
let glitchTimer = 0;

// Wind State
let windTime = 0;
const WIND_SPEED = 0.02;

// Interaction State
let mouseX = -1000;
let mouseY = -1000;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Set canvas size to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (staticSceneCanvas) {
        // Re-create static canvas
        const newStatic = document.createElement('canvas');
        newStatic.width = canvas.width;
        newStatic.height = canvas.height;
        staticSceneCanvas = newStatic;
        // Ideally we'd redraw background here, but we'll wait for next gen
    }
    if (treeCanvas) {
        const newTree = document.createElement('canvas');
        newTree.width = canvas.width;
        newTree.height = canvas.height;
        treeCanvas = newTree;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Configuration
const config = {
    trunkColor: '#2c2c2c',
    bgColor: '#fcfbf9',
    maxDepth: 12,
    branchAngle: 0.4,
    growthFactor: 0.8,
    seasons: {
        spring: {
            leafColors: ['rgba(255, 183, 197, 0.8)', 'rgba(255, 192, 203, 0.8)', '#ff69b4'],
            digitalColor: '#ff1493',
            particleColor: 'rgba(255, 105, 180, 0.8)',
            particleType: 'petal'
        },
        summer: {
            leafColors: ['rgba(74, 108, 74, 0.8)'],
            digitalColor: '#00ff00',
            particleColor: null,
            particleType: 'none'
        },
        autumn: {
            leafColors: ['rgba(204, 85, 0, 0.8)', 'rgba(218, 165, 32, 0.8)', 'rgba(165, 42, 42, 0.8)'],
            digitalColor: '#ff4500',
            particleColor: 'rgba(204, 85, 0, 0.8)',
            particleType: 'leaf'
        },
        winter: {
            leafColors: ['rgba(255, 255, 255, 0.9)', 'rgba(240, 248, 255, 0.9)'],
            digitalColor: '#00ffff',
            particleColor: 'rgba(200, 220, 255, 0.9)',
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

// --- Tree Data Structure ---

function generateLeafData(seasonConfig) {
    const isBinary = Math.random() > 0.5;
    const leafColor = getRandomElement(seasonConfig.leafColors);

    return {
        type: isBinary ? 'binary' : 'pixel',
        char: Math.random() > 0.5 ? '0' : '1',
        color: isBinary && Math.random() > 0.7 ? seasonConfig.digitalColor : leafColor,
        size: isBinary ? randomRange(10, 14) : randomRange(5, 12),
        offsetX: randomRange(-10, 10),
        offsetY: randomRange(-10, 10)
    };
}

function generateBranchData(length, width, depth, seasonConfig) {
    const node = {
        length: length,
        width: width,
        depth: depth,
        maxDepth: config.maxDepth, // Store max depth to calculate relative position
        curveOffsetX: randomRange(-10, 10),
        curveOffsetY: randomRange(-10, 10),
        children: [],
        leaves: []
    };

    if (depth === 0) {
        const leafCount = Math.floor(randomRange(5, 10));
        for (let i = 0; i < leafCount; i++) {
            node.leaves.push(generateLeafData(seasonConfig));
        }
        return node;
    }

    const branchCount = Math.floor(randomRange(2, 4));
    for (let i = 0; i < branchCount; i++) {
        const newLength = length * config.growthFactor * randomRange(0.7, 1.0);
        const newWidth = width * 0.7;
        const relativeAngle = randomRange(-config.branchAngle, config.branchAngle);

        if (newLength > 5) {
            const childNode = generateBranchData(newLength, newWidth, depth - 1, seasonConfig);
            childNode.relativeAngle = relativeAngle;
            node.children.push(childNode);
        } else {
            node.leaves.push(generateLeafData(seasonConfig));
            if (Math.random() > 0.5) {
                node.leaves.push(generateLeafData(seasonConfig));
            }
        }
    }
    return node;
}

// --- Rendering ---

function renderLeaf(ctx, x, y, leaf, alpha = 1) {
    ctx.save();
    ctx.translate(x + leaf.offsetX, y + leaf.offsetY);
    ctx.globalAlpha = alpha;

    if (leaf.type === 'binary') {
        ctx.font = `${leaf.size}px monospace`;
        ctx.fillStyle = leaf.color;
        ctx.fillText(leaf.char, 0, 0);
    } else {
        ctx.fillStyle = leaf.color;
        ctx.fillRect(0, 0, leaf.size, leaf.size);
    }

    ctx.restore();
}

// Recursive rendering with growth logic
function renderTree(ctx, node, startX, startY, parentAngle, progress) {
    // Determine if this branch should be drawn based on progress
    // We map progress (0-1) to the tree depth.
    // Root (depth 12) starts at 0. Tips (depth 0) end at 1.

    // Calculate the "start" and "end" progress for this specific branch layer
    // Total layers = config.maxDepth + 1
    // Inverted depth: level 0 is root, level 12 is tip.
    const level = config.maxDepth - node.depth;
    const totalLevels = config.maxDepth;

    const startP = level / totalLevels;
    const endP = (level + 1) / totalLevels;

    // If progress hasn't reached this level, don't draw
    if (progress < startP) return;

    // Calculate how much of this branch is grown (0.0 to 1.0)
    let localGrowth = (progress - startP) / (endP - startP);
    if (localGrowth > 1) localGrowth = 1;

    // Easing for pop effect
    // localGrowth = localGrowth * (2 - localGrowth); // Ease out

    const currentLength = node.length * localGrowth;
    const currentWidth = node.width * localGrowth;

    // Angle
    const currentAngle = parentAngle + (node.relativeAngle || 0);

    // End Point
    const endX = startX + Math.cos(currentAngle) * currentLength;
    const endY = startY + Math.sin(currentAngle) * currentLength;

    // Curve Control Point
    const cos = Math.cos(currentAngle);
    const sin = Math.sin(currentAngle);
    const rotCurveX = node.curveOffsetX * cos - node.curveOffsetY * sin;
    const rotCurveY = node.curveOffsetX * sin + node.curveOffsetY * cos;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const cpX = midX + rotCurveX * localGrowth; // Scale curve too
    const cpY = midY + rotCurveY * localGrowth;

    // Draw Branch
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.lineWidth = currentWidth;
    ctx.strokeStyle = config.trunkColor;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Draw Children only if this branch is fully grown (or close to it)
    if (localGrowth > 0.8) {
        if (node.children) {
            for (const child of node.children) {
                renderTree(ctx, child, endX, endY, currentAngle, progress);
            }
        }
    }

    // Draw Leaves (pop in at the end of branch growth)
    if (localGrowth > 0.9 && node.leaves) {
        const leafAlpha = (localGrowth - 0.9) * 10; // Fade in quickly
        for (const leaf of node.leaves) {
            renderLeaf(ctx, endX, endY, leaf, leafAlpha);
        }
    }
}

// --- Glitch Effects ---

// --- Glitch Effects (Refined for Wabi-Sabi) ---

function drawGlitch(ctx) {
    // Reduced frequency: only 1% chance per frame normally, higher during growth
    const chance = isGrowing ? 0.05 : 0.01;
    if (Math.random() > chance) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();

    // 1. RGB Shift (Chromatic Aberration) - Subtle and artistic
    if (Math.random() > 0.5) {
        const sliceY = randomRange(0, height);
        const sliceHeight = randomRange(2, 10); // Thinner slices
        const offset = randomRange(1, 3); // Smaller offset

        try {
            // Red Channel Shift
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Lower opacity
            ctx.fillRect(0, sliceY, width, sliceHeight);

            // Cyan Channel Shift
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.fillRect(offset, sliceY, width, sliceHeight);

        } catch (e) { }
    }

    // 2. Scanlines - "Data Processing" look
    if (Math.random() > 0.7) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.05)'; // Very faint
        const scanlineY = randomRange(0, height);
        ctx.fillRect(0, scanlineY, width, 1);
    }

    // 3. Digital Artifacts - "Digital Decay"
    if (Math.random() > 0.8) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = config.seasons[currentSeason].digitalColor;
        ctx.font = '10px monospace';
        const x = randomRange(0, width);
        const y = randomRange(0, height);
        // Occasionally draw a "dead pixel" block
        if (Math.random() > 0.5) {
            ctx.fillRect(x, y, 3, 3);
        } else {
            ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
        }
    }

    ctx.restore();
}

// --- Hanko (Seal) Animation ---
function drawHanko(ctx) {
    if (isGrowing) return; // Only draw when fully grown

    const size = 60;
    const x = canvas.width - 100;
    const y = canvas.height - 100;

    ctx.save();
    ctx.translate(x, y);

    // Slight rotation for natural feel
    ctx.rotate(-0.1);

    // Border
    ctx.strokeStyle = '#d93a3a'; // Vermilion
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.stroke();

    // Inner Text (Pseudo-Kanji / Digital Mix)
    ctx.fillStyle = '#d93a3a';
    ctx.font = '24px "Noto Serif JP", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('江戸', 0, -10);
    ctx.fillText('AI', 0, 15);

    // "Grunge" texture for the seal (Wabi-Sabi)
    for (let i = 0; i < 50; i++) {
        const gx = randomRange(-size / 2, size / 2);
        const gy = randomRange(-size / 2, size / 2);
        ctx.clearRect(gx, gy, 2, 2);
    }

    ctx.restore();
}

// --- Background (Same as before) ---
function drawInkMountain(ctxToDraw, baseY, color, amplitude) {
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
    ctxToDraw.shadowColor = color;
    ctxToDraw.shadowBlur = 20;
    const gradient = ctxToDraw.createLinearGradient(0, baseY - amplitude, 0, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctxToDraw.fillStyle = gradient;
    ctxToDraw.beginPath();
    ctxToDraw.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 2; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctxToDraw.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    const lastRidge = points[points.length - 3];
    ctxToDraw.lineTo(lastRidge.x, lastRidge.y);
    ctxToDraw.lineTo(points[points.length - 2].x, points[points.length - 2].y);
    ctxToDraw.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctxToDraw.closePath();
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
        const gradient = ctxToDraw.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, puffSize);
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0.08)');
        gradient.addColorStop(0.6, 'rgba(200, 200, 200, 0.02)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
        ctxToDraw.fillStyle = gradient;
        ctxToDraw.beginPath();
        ctxToDraw.arc(offsetX, offsetY, puffSize, 0, Math.PI * 2);
        ctxToDraw.fill();
    }
    ctxToDraw.restore();
}

function drawBackground(ctxToDraw) {
    drawInkMountain(ctxToDraw, canvas.height * 0.75, 'rgba(40, 40, 40, 0.08)', 120);
    drawInkMountain(ctxToDraw, canvas.height * 0.85, 'rgba(30, 30, 30, 0.12)', 80);
    const cloudCount = 4;
    for (let i = 0; i < cloudCount; i++) {
        drawInkCloud(ctxToDraw, randomRange(0, canvas.width), randomRange(0, canvas.height * 0.4), randomRange(80, 200));
    }
}

// --- Animation Classes ---
class Particle {
    constructor(type, color) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
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
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5;
        this.rotation += this.rotationSpeed;

        // Mouse Interaction
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
            const force = (100 - dist) / 100;
            this.x += (dx / dist) * force * 5;
            this.y += (dy / dist) * force * 5;
        }

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
        } else {
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class FlyingObject {
    constructor() { this.reset(); }
    reset() {
        this.type = Math.random() > 0.5 ? 'bird' : 'ufo';
        this.y = randomRange(50, canvas.height * 0.4);
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.x = this.direction === 1 ? -50 : canvas.width + 50;
        this.speed = randomRange(0.5, 1.5);
        this.active = false;
        this.cooldown = randomRange(200, 500);
    }
    update() {
        if (!this.active) {
            this.cooldown--;
            if (this.cooldown <= 0) {
                this.active = true;
                this.type = Math.random() > 0.8 ? 'ufo' : 'bird';
            }
            return;
        }
        this.x += this.speed * this.direction;
        if ((this.direction === 1 && this.x > canvas.width + 50) || (this.direction === -1 && this.x < -50)) {
            this.reset();
        }
    }
    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.direction === -1) ctx.scale(-1, 1);
        if (this.type === 'bird') {
            ctx.strokeStyle = '#2c2c2c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -5);
            ctx.quadraticCurveTo(0, 5, 10, -5);
            ctx.stroke();
        } else if (this.type === 'ufo') {
            ctx.fillStyle = '#a9a9a9';
            ctx.beginPath();
            ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(0, -5, 8, Math.PI, 0);
            ctx.fill();
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
    if (seasonConfig.particleType !== 'none') {
        const count = seasonConfig.particleType === 'snow' ? 100 : 30;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(seasonConfig.particleType, seasonConfig.particleColor));
        }
    }
    flyingObjects.push(new FlyingObject());
}

// --- Main Animation Loop ---

function animate() {
    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Background
    if (staticSceneCanvas) {
        ctx.drawImage(staticSceneCanvas, 0, 0);
    }

    // 2. Draw Tree (Growing or Static)
    if (currentTreeData) {
        if (isGrowing) {
            growthProgress += GROWTH_SPEED;
            if (growthProgress >= 1.0) {
                growthProgress = 1.0;
                isGrowing = false;

                // Cache the fully grown tree
                if (!treeCanvas) {
                    treeCanvas = document.createElement('canvas');
                    treeCanvas.width = canvas.width;
                    treeCanvas.height = canvas.height;
                }
                const treeCtx = treeCanvas.getContext('2d');
                treeCtx.clearRect(0, 0, canvas.width, canvas.height);
                renderTree(treeCtx, currentTreeData, canvas.width / 2, canvas.height, currentTreeData.angle, 1.0);
            }
            // Render growing tree directly to main canvas
            renderTree(ctx, currentTreeData, canvas.width / 2, canvas.height, currentTreeData.angle, growthProgress);
        } else {
            // Draw cached tree with Wind Simulation
            if (treeCanvas) {
                windTime += WIND_SPEED;
                // Simple wind effect: Skew the canvas slightly based on sine wave
                // We want the bottom to be fixed and top to sway.
                // Since we can't easily skew just the top in 2D canvas without complex transforms,
                // we'll rotate around the base slightly.

                const sway = Math.sin(windTime) * 0.015; // Subtle sway

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height); // Pivot at base
                ctx.rotate(sway);
                ctx.translate(-canvas.width / 2, -canvas.height);
                ctx.drawImage(treeCanvas, 0, 0);
                ctx.restore();

                // Draw Hanko (Seal)
                drawHanko(ctx);
            } else {
                // Fallback if cache missing
                renderTree(ctx, currentTreeData, canvas.width / 2, canvas.height, currentTreeData.angle, 1.0);
            }
        }
    }

    // 3. Draw Particles & Objects
    particles.forEach(p => { p.update(); p.draw(ctx); });
    flyingObjects.forEach(obj => { obj.update(); obj.draw(ctx); });

    // Glitch effects removed per user feedback for a cleaner, luxury aesthetic
    // drawGlitch(ctx);

    animationId = requestAnimationFrame(animate);
}

function generateBonsai() {
    if (animationId) cancelAnimationFrame(animationId);

    const seasonKeys = Object.keys(config.seasons);
    const seasonKey = seasonKeys[Math.floor(Math.random() * seasonKeys.length)];
    currentSeason = seasonKey;
    const seasonConfig = config.seasons[seasonKey];

    console.log(`Generating Bonsai 2.0 for season: ${seasonKey}`);

    // Generate Background
    staticSceneCanvas = document.createElement('canvas');
    staticSceneCanvas.width = canvas.width;
    staticSceneCanvas.height = canvas.height;
    const staticCtx = staticSceneCanvas.getContext('2d');
    drawBackground(staticCtx);

    // Generate Tree Data
    const trunkLength = randomRange(canvas.height * 0.15, canvas.height * 0.25);
    const trunkWidth = randomRange(15, 25);
    const startAngle = -Math.PI / 2 + randomRange(-0.1, 0.1);

    currentTreeData = generateBranchData(trunkLength, trunkWidth, config.maxDepth, seasonConfig);
    currentTreeData.angle = startAngle;

    // Reset State
    isGrowing = true;
    growthProgress = 0;
    treeCanvas = null; // Reset cache

    initAnimation(seasonConfig);
    animate();
}

window.generateBonsai = generateBonsai;

const canvas = document.getElementById('bonsaiCanvas');
const ctx = canvas.getContext('2d');

// Animation State
let animationId = null;
let staticSceneCanvas = null;
let particles = [];
let flyingObjects = [];
let currentSeason = 'summer';
let currentTreeData = null; // Store the tree structure
let time = 0; // Time accumulator for sway

// Set canvas size to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (staticSceneCanvas) {
        // Re-create static canvas on resize to match new dimensions
        // We might lose the old background, so ideally we'd regenerate or redraw it.
        // For now, we'll just let the next generation fix it fully, 
        // but to avoid errors we can resize the static canvas too.
        const newStatic = document.createElement('canvas');
        newStatic.width = canvas.width;
        newStatic.height = canvas.height;
        // We lose the content, but that's better than a crash or stretched image.
        staticSceneCanvas = newStatic;
        // If we have a tree, we should probably trigger a regenerate or just accept the background is gone until next click.
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

// --- Tree Data Generation ---

function generateLeafData(seasonConfig) {
    const isBinary = Math.random() > 0.5;
    const leafColor = getRandomElement(seasonConfig.leafColors);
    
    if (isBinary) {
        return {
            type: 'binary',
            char: Math.random() > 0.5 ? '0' : '1',
            color: Math.random() > 0.7 ? seasonConfig.digitalColor : leafColor,
            size: randomRange(10, 14),
            offsetX: randomRange(-10, 10),
            offsetY: randomRange(-10, 10)
        };
    } else {
        return {
            type: 'pixel',
            color: leafColor,
            size: randomRange(5, 12),
            offsetX: randomRange(-10, 10),
            offsetY: randomRange(-10, 10)
        };
    }
}

function generateBranchData(length, width, depth, seasonConfig) {
    const node = {
        length: length,
        width: width,
        depth: depth,
        curveOffsetX: randomRange(-10, 10),
        curveOffsetY: randomRange(-10, 10),
        children: [],
        leaves: []
    };

    if (depth === 0) {
        // Generate leaves
        const leafCount = Math.floor(randomRange(5, 10));
        for (let i = 0; i < leafCount; i++) {
            node.leaves.push(generateLeafData(seasonConfig));
        }
        return node;
    }

    // Generate children
    const branchCount = Math.floor(randomRange(2, 4));
    for (let i = 0; i < branchCount; i++) {
        const newLength = length * config.growthFactor * randomRange(0.7, 1.0);
        const newWidth = width * 0.7;
        
        // Store relative angle
        const relativeAngle = randomRange(-config.branchAngle, config.branchAngle);

        if (newLength > 5) {
            const childNode = generateBranchData(newLength, newWidth, depth - 1, seasonConfig);
            childNode.relativeAngle = relativeAngle;
            node.children.push(childNode);
        } else {
            // Terminal small branches become leaves too
            const leaf = generateLeafData(seasonConfig);
            // We attach these "terminal" leaves to the current node but maybe with an offset?
            // Or we treat them as a special child. 
            // Simpler: just add to leaves of this node, effectively making it a leaf cluster.
            node.leaves.push(leaf);
            if (Math.random() > 0.5) {
                node.leaves.push(generateLeafData(seasonConfig));
            }
        }
    }
    return node;
}

// --- Tree Rendering ---

function renderLeaf(ctx, x, y, leaf) {
    ctx.save();
    ctx.translate(x + leaf.offsetX, y + leaf.offsetY);

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

function renderTree(ctx, node, startX, startY, parentAngle, time) {
    // Calculate Sway
    // Sway is stronger at the top (lower depth in our recursion, but let's use depth value).
    // Actually, depth 12 is root, 0 is tip.
    // So sway should be proportional to (maxDepth - depth).
    // Also add some phase shift based on depth to make it look like a wave.
    
    // Wind force
    const windSpeed = 0.002;
    const swayAmount = 0.02; // Base sway angle
    
    // Calculate current angle
    // If this is the root, parentAngle is the base angle.
    // If this is a child, parentAngle is the angle of the parent branch.
    // We add the node's relative angle + sway.
    
    // We only apply sway if it's not the root (or maybe root sways a tiny bit too?)
    // Let's apply sway to every branch relative to its parent.
    
    const depthFactor = (config.maxDepth - node.depth); // 0 at root, 12 at tip
    const sway = Math.sin(time * windSpeed + depthFactor * 0.5) * swayAmount * (depthFactor * 0.1);
    
    // For the root, we don't have a relativeAngle stored in the node usually, 
    // but we can pass the base angle as parentAngle and treat relativeAngle as 0 if undefined.
    const currentAngle = parentAngle + (node.relativeAngle || 0) + sway;

    // Calculate End Point
    const endX = startX + Math.cos(currentAngle) * node.length;
    const endY = startY + Math.sin(currentAngle) * node.length;

    // Calculate Control Point for Curve (rotated by currentAngle)
    // We need to rotate the random offsets we stored to match the branch's new orientation
    // Or simpler: just add them to the midpoint calculated from the new start/end.
    // But if we just add fixed x/y offsets, the curve won't rotate with the branch.
    // Let's rotate the curve offset.
    const cos = Math.cos(currentAngle);
    const sin = Math.sin(currentAngle);
    const rotCurveX = node.curveOffsetX * cos - node.curveOffsetY * sin;
    const rotCurveY = node.curveOffsetX * sin + node.curveOffsetY * cos;

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const cpX = midX + rotCurveX;
    const cpY = midY + rotCurveY;

    // Draw Branch
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.lineWidth = node.width;
    ctx.strokeStyle = config.trunkColor;
    ctx.lineCap = 'round';
    
    // Ink bleed effect (simplified for performance)
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Draw Children
    if (node.children) {
        for (const child of node.children) {
            renderTree(ctx, child, endX, endY, currentAngle, time);
        }
    }

    // Draw Leaves
    if (node.leaves) {
        for (const leaf of node.leaves) {
            // Leaves move with the branch end
            renderLeaf(ctx, endX, endY, leaf);
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

    // Draw static scene (background)
    if (staticSceneCanvas) {
        ctx.drawImage(staticSceneCanvas, 0, 0);
    }

    // Draw Tree with Sway
    if (currentTreeData) {
        time += 16; // Approx 16ms per frame
        const startX = canvas.width / 2;
        const startY = canvas.height;
        const startAngle = currentTreeData.angle; // Root angle
        
        renderTree(ctx, currentTreeData, startX, startY, startAngle, time);
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

    // Create an offscreen canvas to hold the static scene (Background only now)
    staticSceneCanvas = document.createElement('canvas');
    staticSceneCanvas.width = canvas.width;
    staticSceneCanvas.height = canvas.height;
    const staticCtx = staticSceneCanvas.getContext('2d');

    // Draw Background to static canvas
    drawBackground(staticCtx);

    // Generate Tree Data
    const trunkLength = randomRange(canvas.height * 0.15, canvas.height * 0.25);
    const trunkWidth = randomRange(15, 25);
    const startAngle = -Math.PI / 2 + randomRange(-0.1, 0.1);

    currentTreeData = generateBranchData(trunkLength, trunkWidth, config.maxDepth, seasonConfig);
    // Store root properties that aren't in the recursive structure's relative logic
    currentTreeData.angle = startAngle; 
    
    // Reset time
    time = 0;

    // Initialize Animation elements
    initAnimation(seasonConfig);

    // Start Animation Loop
    animate();
}

window.generateBonsai = generateBonsai;

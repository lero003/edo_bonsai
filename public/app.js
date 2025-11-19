document.addEventListener('DOMContentLoaded', () => {
    const bonsai = new Bonsai('bonsaiCanvas');
    const input = document.getElementById('userInput');
    const btn = document.getElementById('growBtn');
    const responseBox = document.getElementById('aiResponse');
    const simToggle = document.getElementById('simToggle');

    let simulationInterval = null;

    const randomComments = [
        "The wind is gentle.", "Sunlight filters through.", "A digital bird sings.",
        "Growth is patience.", "Pixels turning into leaves.", "Cloudflare keeps me safe.",
        "Watering with data.", "Roots go deep.", "Branches reach high.",
        "Silence is golden.", "Code is poetry.", "Nature finds a way.",
        "Hello world.", "Bonsai life.", "Zen mode activated.",
        "Updating firmware...", "Photosynthesis running.", "Checking soil pH...",
        "Connection established.", "Peaceful afternoon."
    ];

    async function handleGrow(textOverride = null) {
        const text = textOverride || input.value.trim();
        if (!text && !textOverride) return;

        // Visual feedback
        if (!textOverride) {
            responseBox.textContent = "Planting...";
            input.value = '';
        }

        try {
            // Use mock data if fetch fails (fallback for better UX)
            let data;
            try {
                const res = await fetch('/api/grow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                if (!res.ok) throw new Error('API Error');
                data = await res.json();
            } catch (e) {
                console.warn("API failed, using local fallback", e);
                // Fallback logic so the tree still grows
                data = {
                    edoText: "The tree grows in silence.",
                    growth: {
                        branches: Math.floor(Math.random() * 3) + 1,
                        length: 15
                    }
                };
            }

            // Show response
            if (!textOverride) {
                responseBox.textContent = data.edoText;
            } else {
                showFloatingComment(text);
            }

            // Grow tree
            bonsai.grow(data.growth);

        } catch (err) {
            console.error(err);
            if (!textOverride) responseBox.textContent = "Error: Could not grow.";
        }
    }

    function showFloatingComment(text) {
        const el = document.createElement('div');
        el.className = 'floating-comment';
        el.textContent = text;

        // Random position
        const x = Math.random() * (window.innerWidth - 200) + 100;
        const y = Math.random() * (window.innerHeight / 2) + (window.innerHeight / 2);

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        document.body.appendChild(el);

        // Cleanup
        setTimeout(() => el.remove(), 4000);
    }

    function toggleSimulation() {
        if (simToggle.checked) {
            if (!simulationInterval) {
                // Immediate start
                handleGrow(randomComments[Math.floor(Math.random() * randomComments.length)]);

                simulationInterval = setInterval(() => {
                    const comment = randomComments[Math.floor(Math.random() * randomComments.length)];
                    handleGrow(comment);
                }, 800); // Fast growth!
            }
        } else {
            if (simulationInterval) {
                clearInterval(simulationInterval);
                simulationInterval = null;
            }
        }
    }

    btn.addEventListener('click', () => handleGrow());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGrow();
    });

    simToggle.addEventListener('change', toggleSimulation);

    // Initial draw
    bonsai.draw();
});

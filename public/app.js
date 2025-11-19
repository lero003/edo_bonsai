document.addEventListener('DOMContentLoaded', () => {
    const bonsai = new Bonsai('bonsaiCanvas');
    const input = document.getElementById('userInput');
    const btn = document.getElementById('growBtn');
    const responseBox = document.getElementById('aiResponse');

    async function handleGrow() {
        const text = input.value.trim();
        if (!text) return;

        // Visual feedback
        responseBox.textContent = "Consulting the spirits...";

        try {
            const res = await fetch('/api/grow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!res.ok) throw new Error('Network response was not ok');

            const data = await res.json();

            // Show response
            responseBox.textContent = data.edoText;

            // Grow tree
            bonsai.grow(data.growth);

            // Clear input
            input.value = '';

        } catch (err) {
            console.error(err);
            responseBox.textContent = "Error: Connection to the ether lost.";
        }
    }

    btn.addEventListener('click', handleGrow);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGrow();
    });

    // Initial draw
    bonsai.draw();
});

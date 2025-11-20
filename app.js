document.addEventListener('DOMContentLoaded', async () => {
    const regenerateBtn = document.getElementById('regenerateBtn');
    const haikuContainer = document.getElementById('haikuContainer');
    const haikuText = document.getElementById('haikuText');

    async function loadContent() {
        // Generate new visual
        if (window.generateBonsai) {
            window.generateBonsai();
        }

        // Fetch new wisdom
        try {
            const response = await fetch('/api/haiku');
            const data = await response.json();

            // Animate text in
            haikuText.style.opacity = 0;
            setTimeout(() => {
                haikuText.textContent = data.haiku;
                haikuText.style.opacity = 1;
            }, 500);

        } catch (error) {
            console.error('Failed to fetch haiku:', error);
            haikuText.textContent = "The connection is lost in the mist...";
        }
    }

    regenerateBtn.addEventListener('click', loadContent);

    // Initial load
    loadContent();
});

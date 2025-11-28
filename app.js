document.addEventListener('DOMContentLoaded', async () => {
    const regenerateBtn = document.getElementById('regenerateBtn');
    const haikuContainer = document.getElementById('haikuContainer');
    const haikuText = document.getElementById('haikuText');

    async function loadContent() {
        // Generate new visual
        if (window.generateBonsai) {
            console.log("Triggering bonsai generation...");
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

    // Scroll Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // Initial load
    loadContent();
});

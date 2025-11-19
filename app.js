document.addEventListener('DOMContentLoaded', () => {
    const regenerateBtn = document.getElementById('regenerateBtn');

    // Initial generation
    if (window.generateBonsai) {
        window.generateBonsai();
    }

    // Button listener
    regenerateBtn.addEventListener('click', () => {
        // Optional: Add a small rotation or fade effect here
        if (window.generateBonsai) {
            window.generateBonsai();
        }
    });
});

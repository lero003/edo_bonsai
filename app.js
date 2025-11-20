document.addEventListener('DOMContentLoaded', async () => {
    const regenerateBtn = document.getElementById('regenerateBtn');
    const haikuContainer = document.getElementById('haikuContainer');
    const haikuText = document.getElementById('haikuText');

    // ★ここが大事！ページ読み込まれた瞬間にアニメ開始
    // 50ms待つだけでCSSが100%適用された後にアニメ始まるからジャンプしないよ～
    setTimeout(() => {
        regenerateBtn.classList.add('appear');
    }, 50);

    async function loadContent() {
        if (window.generateBonsai) window.generateBonsai();

        try {
            const response = await fetch('/api/haiku');
            const data = await response.json();

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
    loadContent(); // 初回読み込み
});

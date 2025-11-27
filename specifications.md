# Edo-AI Bonsai Specification

## 1. Overview
**Edo-AI Bonsai** is a web-based digital art application that generates unique, procedurally grown bonsai trees. It merges the traditional Japanese aesthetic of "Wabi-Sabi" (beauty in imperfection) with modern digital concepts (glitches, binary code).

## 2. Core Features

### 2.1 Procedural Tree Generation
-   **Algorithm**: Uses a recursive fractal algorithm to simulate natural tree growth.
-   **Uniqueness**: Every tree is unique, determined by random variations in branch angle, length, and width.
-   **Digital Leaves**: Leaves are rendered not as simple shapes but as:
    -   **Pixels**: Colored squares representing digital noise.
    -   **Binary**: "0" and "1" characters representing the digital DNA of the tree.

### 2.2 Seasonal Themes
The application randomly selects a season for each generation, affecting the color palette and atmospheric effects:
-   **Spring**: Pink hues (Sakura), falling petal particles.
-   **Summer**: Deep moss greens, digital matrix green accents.
-   **Autumn**: Gold, orange, and brown hues, falling leaf particles.
-   **Winter**: White and pale blue, falling snow particles.

### 2.3 Atmospheric Background
-   **Ink Wash Style**: Background mountains and clouds are generated using procedural curves and gradients to mimic "Suibokuga" (ink wash painting).
-   **Tarashikomi**: Simulates the "dripping in" technique of traditional painting using canvas gradients and shadows.

### 2.4 Animation
-   **Particles**: Season-specific particles (snow, petals) drift across the screen.
-   **Flying Objects**: Occasional appearance of birds or UFOs to add a surreal touch.
-   **Static Tree**: The tree itself is static (for performance reasons), serving as a permanent anchor in the moving scene.

### 2.5 Haiku Integration
-   Fetches and displays a thematically appropriate Haiku from an API endpoint (`/api/haiku`).
-   Displayed vertically in traditional Japanese writing mode.

## 3. Technical Architecture

### 3.1 Stack
-   **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+).
-   **Rendering Engine**: HTML5 Canvas API (2D Context).
-   **No External Dependencies**: Built without heavy frameworks (React, Vue, etc.) to maintain a lightweight footprint and "Vanilla" purity.

### 3.2 Key Files
-   **`public/index.html`**: The semantic structure of the page.
-   **`public/style.css`**:
    -   Uses CSS Variables for color palettes.
    -   Implements "Washi" (Japanese paper) texture overlays.
    -   Handles responsive layout and UI animations (fade-ins).
-   **`public/bonsai.js`**:
    -   Contains the core logic for the generative art.
    -   `generateBonsai()`: Main entry point.
    -   `drawBranch()`: Recursive function for tree structure.
    -   `animate()`: RequestAnimationFrame loop for particles.
-   **`public/app.js`**:
    -   Manages DOM events (button clicks).
    -   Handles the IntersectionObserver for scroll animations.
    -   Fetches data from the backend API.

## 4. Design System
-   **Typography**: 'Noto Serif JP' for a dignified, traditional feel.
-   **Color Palette**: Muted, natural tones (Sumi ink black, Moss green, Washi white) accented by neon "digital" colors (Cyber pink, Matrix green).
-   **Layout**:
    -   **Desktop**: Split screen with the bonsai canvas as a fixed background and scrolling content overlay.
    -   **Mobile**: Stacked layout optimized for vertical scrolling.

## 5. Future Considerations
-   **Wind Animation**: Currently disabled due to performance costs of real-time tree redrawing. Future optimizations (e.g., WebGL shaders) could enable this.
-   **Save Functionality**: Ability to export the generated bonsai as an image.

---

# Edo-AI Bonsai 仕様書

## 1. 概要
**Edo-AI Bonsai** は、手続き型生成によってユニークな盆栽を描画するWebベースのデジタルアートアプリケーションです。日本の伝統的な美意識である「わび・さび（不完全の美）」と、現代のデジタルコンセプト（グリッチ、バイナリコード）を融合させています。

## 2. コア機能

### 2.1 手続き型樹木生成
-   **アルゴリズム**: 再帰的なフラクタルアルゴリズムを使用し、自然な樹木の成長をシミュレートします。
-   **独自性**: 枝の角度、長さ、太さのランダムな変化により、生成されるすべての木がユニークなものになります。
-   **デジタルな葉**: 葉は単純な図形ではなく、以下のように描画されます：
    -   **ピクセル**: デジタルノイズを表す色付きの正方形。
    -   **バイナリ**: 木のデジタルDNAを表す「0」と「1」の文字。

### 2.2 季節のテーマ
生成ごとにランダムに季節が選ばれ、カラーパレットや環境効果に影響を与えます：
-   **春**: ピンクの色調（桜）、舞い散る花びらのパーティクル。
-   **夏**: 深い苔の緑、デジタルマトリックスグリーンのアクセント。
-   **秋**: 金色、オレンジ、茶色の色調、舞い散る落ち葉のパーティクル。
-   **冬**: 白と淡い青、舞い散る雪のパーティクル。

### 2.3 情緒的な背景
-   **水墨画スタイル**: 背景の山や雲は、手続き的な曲線とグラデーションを使用して生成され、「水墨画」を模倣しています。
-   **たらし込み**: キャンバスのグラデーションと影を使用し、伝統的な絵画技法である「たらし込み」をシミュレートしています。

### 2.4 アニメーション
-   **パーティクル**: 季節特有のパーティクル（雪、花びら）が画面を漂います。
-   **飛行物体**: 時折、鳥やUFOが現れ、シュールなタッチを加えます。
-   **静的な木**: 木自体は（パフォーマンス上の理由から）静止しており、動く風景の中で永続的なアンカーとしての役割を果たします。

### 2.5 俳句の統合
-   APIエンドポイント（`/api/haiku`）から、テーマに合った俳句を取得して表示します。
-   日本の伝統的な縦書きモードで表示されます。

## 3. 技術アーキテクチャ

### 3.1 スタック
-   **フロントエンド**: HTML5, CSS3, Vanilla JavaScript (ES6+)。
-   **レンダリングエンジン**: HTML5 Canvas API (2D Context)。
-   **外部依存なし**: 軽量なフットプリントと「Vanilla（素のJS）」の純粋さを保つため、重いフレームワーク（React, Vueなど）を使用せずに構築されています。

### 3.2 主要ファイル
-   **`public/index.html`**: ページのセマンティック構造。
-   **`public/style.css`**:
    -   カラーパレットにCSS変数を使用。
    -   「和紙」のテクスチャオーバーレイを実装。
    -   レスポンシブレイアウトとUIアニメーション（フェードイン）を処理。
-   **`public/bonsai.js`**:
    -   ジェネレーティブアートのコアロジックを格納。
    -   `generateBonsai()`: メインエントリーポイント。
    -   `drawBranch()`: 樹木構造のための再帰関数。
    -   `animate()`: パーティクルのためのRequestAnimationFrameループ。
-   **`public/app.js`**:
    -   DOMイベント（ボタンクリック）を管理。
    -   スクロールアニメーションのためのIntersectionObserverを処理。
    -   バックエンドAPIからデータを取得。

## 4. デザインシステム
-   **タイポグラフィ**: 威厳のある伝統的な雰囲気のために「Noto Serif JP」を使用。
-   **カラーパレット**: 落ち着いた自然な色調（墨の黒、苔の緑、和紙の白）に、ネオンの「デジタル」カラー（サイバーピンク、マトリックスグリーン）をアクセントとして使用。
-   **レイアウト**:
    -   **デスクトップ**: 盆栽キャンバスを固定背景とし、スクロールするコンテンツをオーバーレイした分割画面。
    -   **モバイル**: 縦スクロールに最適化されたスタックレイアウト。

## 5. 今後の検討事項
-   **風のアニメーション**: リアルタイムの樹木再描画によるパフォーマンスコストのため、現在は無効化されています。将来的な最適化（WebGLシェーダーなど）により可能になるかもしれません。
-   **保存機能**: 生成された盆栽を画像としてエクスポートする機能。

# Edo-AI Bonsai (江戸電脳盆栽)

**デジタルと侘び寂びの融合。AIが織りなす一期一会の盆栽体験。**

Edo-AI Bonsaiは、江戸時代の美意識「侘び寂び」と現代のAI技術を融合させた、インタラクティブなWebアプリケーションです。
アクセスするたびに異なる姿を見せる盆栽、四季折々の情景、そしてAIが詠む俳句が、デジタル空間に安らぎのひとときを提供します。

![Edo Bonsai Preview](https://via.placeholder.com/800x400?text=Edo+Bonsai+Preview)

## ✨ 特徴 (Features)

### 🌸 四季の移ろい (Seasonal Variations)
盆栽は生成されるたびに、ランダムで四季を纏います。
- **春 (Spring)**: 桜色の葉と、舞い散る花びら。
- **夏 (Summer)**: 力強い緑の葉と、静寂。
- **秋 (Autumn)**: 紅葉した葉と、舞い落ちる枯れ葉。
- **冬 (Winter)**: 雪化粧を施した枝と、降りしきる雪。

### 🕊️ 背景の遊び心 (Background Animations)
水墨画風の背景には、時折不思議な物体が横切ります。
- **鳥 (Birds)**: 優雅に空を舞う墨絵の鳥。
- **UFO**: 江戸の空に迷い込んだ未確認飛行物体（レア出現）。

### 🤖 AI俳句 (AI Haiku)
盆栽の生成に合わせて、AIがその情景や「電脳」をテーマにした俳句を詠みます。
（※現在はモックアップまたは簡易APIで動作中）

## 🛠️ 技術スタック (Tech Stack)

- **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript
- **Canvas**: HTML5 Canvas API (Procedural Generation)
- **Backend/Edge**: Cloudflare Pages Functions (Hono framework)
- **Deployment**: Cloudflare Pages

## 📂 プロジェクト構成 (Project Layout)

```
.
├── public/           # 静的ファイル (HTML, CSS, JS)
│   ├── index.html    # メインページ
│   ├── style.css     # スタイル定義 (和紙テクスチャ, アニメーション)
│   ├── app.js        # UIロジック, API連携
│   └── bonsai.js     # 盆栽生成アルゴリズム, アニメーションループ
├── functions/        # Cloudflare Pages Functions (API)
│   └── api/          # APIルート
├── wrangler.toml     # Cloudflare設定ファイル
└── README.md         # 本ドキュメント
```

## 🚀 開発環境のセットアップ (Local Development)

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd edo_bonsai-last02
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   ブラウザで `http://localhost:8788` (または表示されたURL) を開いてください。

## 🌍 デプロイ (Deployment)

Cloudflare Pagesへのデプロイは以下のコマンドで行います。

```bash
npm run deploy
```

## 🎨 デザインコンセプト (Design Concept)

- **Wabi-Sabi (侘び寂び)**: 不完全さ、無常さを表現する非対称な枝ぶり。
- **Ma (間)**: 余白を活かしたレイアウト。
- **Edo-Cyber (江戸サイバー)**: 伝統的な色彩（墨、抹茶、桜）と、デジタルなグリッチ表現の融合。

---
*Created by Antigravity*

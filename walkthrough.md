# Edo-AI Bonsai Walkthrough

I have created the "Edo-AI Bonsai" application! Since I couldn't access `npm` in your environment, you will need to install dependencies and run it manually.

## 1. Installation

Open your terminal, navigate to the project folder, and install the dependencies:

```bash
cd /Users/keikei/マイドライブ/VScode/edo-ai-bonsai
npm install
```

## 2. Running Locally

To start the development server:

```bash
npm run dev
```

Then open [http://localhost:8787](http://localhost:8787) in your browser.

## 3. Features Implemented

- **Open Sumi-e Aesthetic**: A light, airy design inspired by traditional ink wash painting.
- **Interactive Bonsai**: A canvas-based tree that grows procedurally.
- **Simulation Mode**: Toggle "Auto-Watering" to watch the tree grow automatically with random comments.
- **"Edo-fication" API**: A Hono backend that "translates" your text into Haiku-style responses.

## 4. Deployment to Cloudflare Pages

### Option A: Direct Upload (CLI)
To deploy immediately from your terminal:

```bash
npm run deploy
```

### Option B: Git Integration (Dashboard)
If you push this code to GitHub/GitLab and connect it to Cloudflare Pages, use these settings:

- **Framework Preset**: `None`
- **Build Command**: `npm install`
- **Build Output Directory**: `public`
- **Environment Variables**: None needed yet.

> [!IMPORTANT]
> The error `Could not resolve "hono"` happens if dependencies aren't installed. Setting the Build Command to `npm install` ensures Cloudflare downloads the necessary libraries before building the functions.

The `functions` directory will be automatically detected by Cloudflare Pages to run the Hono backend.

## 5. Next Steps

- **Real AI**: Replace the mock responses in `functions/api/[[route]].ts` with a call to OpenAI or Gemini API.
- **Better Growth Algorithm**: Improve `bonsai.js` to make the tree look more realistic or artistic (e.g., L-systems).

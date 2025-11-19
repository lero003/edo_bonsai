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

- **Cyber-Edo Aesthetic**: A mix of dark mode, neon green, and traditional serif fonts.
- **Interactive Bonsai**: A canvas-based tree that grows procedurally.
- **"Edo-fication" API**: A Hono backend that "translates" your text into Haiku-style responses (mocked for now).
- **Glitch Effects**: Visual glitches on the title and tree leaves.

## 4. Deployment to Cloudflare Pages

To deploy this to the internet:

```bash
npm run deploy
```

This will use Wrangler to deploy your `public` folder and `functions` to Cloudflare Pages.

## 5. Next Steps

- **Real AI**: Replace the mock responses in `functions/api/[[route]].ts` with a call to OpenAI or Gemini API.
- **Better Growth Algorithm**: Improve `bonsai.js` to make the tree look more realistic or artistic (e.g., L-systems).

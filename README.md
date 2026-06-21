

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4942cb0b-74aa-4a1b-915c-87a0ef257ea7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

> To start on a different port, set `PORT` and `VITE_WS_PORT` before running dev. Example:
> ```powershell
> $env:PORT=3002
> $env:VITE_WS_PORT=24680
> npm run dev
> ```
=======

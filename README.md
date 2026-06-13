# 🌿 CarbonAware – Personal Carbon Footprint Coach

A climate-tech application that helps individuals understand and reduce their personal carbon footprint through lifestyle inputs, visual analytics, and AI-powered guidance.

---

## Problem Statement

Individuals often lack a clear, actionable way to estimate their annual carbon emissions from daily decisions like commuting, diet, energy use, and waste habits. This project solves that gap by providing a lightweight personal carbon footprint calculator with category-level insights, improvement suggestions, and an AI coach that offers tailored advice.

---

## Features

- Interactive 4-step carbon footprint calculator covering transport, diet, home energy, and waste
- Category breakdown and total annual CO₂e output
- Visual benchmarks comparing the user’s footprint to country averages
- Equivalency cards for trees planted, flights, and car travel
- Personalized action planner with projected savings
- AI-powered carbon coach backed by Hugging Face inference
- Secure backend proxy to keep API keys hidden from the client
- Local fallback response when AI inference is unavailable

---

## Architecture

This project is built as a hybrid frontend/backend application:

- `src/App.jsx` manages application state, navigation, and result rendering
- `src/components/Calculator.jsx` collects user inputs and calculates emissions
- `src/components/Dashboard.jsx` presents charts, benchmarks, and equivalencies
- `src/components/AIInsights.jsx` handles AI chat and action recommendations
- `server.js` acts as a secure proxy for Hugging Face inference
- JSON data files in `src/data/` provide emission factors and benchmark values

The frontend communicates with the Express backend over `/api/hf-chat`, and the backend forwards requests to Hugging Face using the secret token stored in `.env`.

---

## Tech Stack

- React 19
- Vite
- Express
- ESLint
- Vitest
- Hugging Face inference API
- Lucide React icons

---

## SHAP Explainability

While SHAP is not currently implemented in this repository, the application follows an explainable design pattern by:

- Breaking total emissions into interpretable categories: transport, food, energy, waste, and other
- Displaying the relative footprint contribution of each category
- Providing explicit action items with estimated annual savings
- Allowing users to understand which lifestyle changes affect the final score most

A future implementation could add SHAP values or feature importances to explain model-driven predictions in the AI insights layer.

---

## AI Insights

The AI insights feature provides conversational guidance tailored to the user profile. It:

- Sends a contextual prompt containing the user’s footprint, breakdown, and lifestyle inputs
- Requests an emoji-rich, practical response from the Hugging Face model
- Displays the AI answer in a chat-style interface
- Uses a local fallback strategy if the external call fails

This enables users to receive personalized carbon reduction advice in plain language.

---

## Installation

1. Install dependencies

```bash
cd "d:/carbon platform/carbon-platform"
npm install
```

2. Create a `.env` file with:

```env
HF_API_KEY=your_huggingface_token_here
VITE_HF_MODEL=gpt2
```

3. Start the backend proxy

```bash
npm run server
```

4. Start the frontend

```bash
npm run dev
```

5. Open the app at `http://localhost:5173`

---

## Future Scope

- Add SHAP-based explainability for AI-driven recommendations
- Integrate real emission factor datasets from public climate sources
- Add user authentication and saved profiles
- Provide personalized reduction plans across weeks/months
- Add offline mode or PWA support
- Add charts for historical footprint tracking
- Add screenshot export or report generation

---

## Screenshots

> Add screenshots here once available.

The following sections are useful for judges and reviewers:

- Home / calculator view
- Dashboard with category breakdown and equivalencies
- AI insights chat panel

If you add images, reference them like:

```md
![Calculator view](screenshots/calculator.png)
![Dashboard view](screenshots/dashboard.png)
![AI chat view](screenshots/ai-insights.png)
```

---

## Project Structure

```text
carbon-platform/
├── server.js              # Express backend proxy for Hugging Face
├── .env                   # Local secret config (do not commit)
├── package.json
├── vite.config.js         # Vite proxy config for /api/hf-chat
├── src/
│   ├── components/
│   │   ├── Calculator.jsx
│   │   ├── Dashboard.jsx
│   │   └── AIInsights.jsx
│   ├── data/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── scripts/               # Optional preprocessing pipeline
```

---

## License

MIT

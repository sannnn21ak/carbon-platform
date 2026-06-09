# 🌿 CarbonAware – Personal Carbon Footprint Coach

A climate-tech vertical app that helps individuals understand and reduce their personal carbon footprint through lifestyle inputs, visual analytics, and AI-powered guidance.

---

## Chosen Vertical

**Climate Tech / Personal Sustainability**

This app targets the sustainability vertical by helping an individual understand how daily behaviors like transport, diet, energy use, and waste contribute to personal greenhouse gas emissions.

---

## Approach and Logic

The solution was built with three main layers:

1. **Personal footprint calculation**
   - Collects user inputs across transport, diet, heating, energy efficiency, groceries, and recycling.
   - Uses simplified emission factors and rules to estimate annual CO₂e.
   - Breaks the result into category contributions so the user can see the biggest impact areas.

2. **Visualization and action planning**
   - Shows the footprint with charts, equivalency cards, and benchmark comparisons.
   - Provides a set of recommended actions and live projected savings when actions are selected.

3. **AI coaching**
   - Uses a secure backend proxy to call Hugging Face inference.
   - Sends the user profile and prompt to the model to generate tailored, friendly carbon reduction advice.
   - Includes a local fallback if the external AI is unavailable.

---

## How the Solution Works

### User flow

1. The user completes the 4-step calculator in `Calculator.jsx`.
2. The app computes the total footprint and breakdown in `App.jsx`.
3. `Dashboard.jsx` displays charts, benchmarks, and equivalency metrics.
4. The user asks a question in `AIInsights.jsx`.
5. The frontend posts the chat request to `/api/hf-chat`.
6. `server.js` forwards the request to Hugging Face using the secret `HF_API_KEY`.
7. The AI response is returned and displayed in the chat interface.

### Architecture

- **Frontend:** React + Vite
- **Backend proxy:** Express server in `server.js`
- **AI inference:** Hugging Face via secure backend call
- **Data:** JSON files in `src/data/`
- **Env settings:** `.env` stores `HF_API_KEY` and `VITE_HF_MODEL`

### Secure API flow

- The frontend does not expose the Hugging Face token.
- The client sends only the prompt and model name to the backend.
- The backend injects `HF_API_KEY` and calls the Hugging Face inference endpoint.

---

## Assumptions Made

- Footprint estimates are based on simplified emission factors rather than full life-cycle analysis.
- Transport emissions use vehicle type, fuel type, and monthly distance as proxies.
- Diet emissions are modeled using broad diet categories.
- Energy footprint is based on a primary heating source plus an efficiency flag.
- Waste savings are approximated from recycling and composting behavior.
- The Hugging Face token should have `Read` permission for inference.
- Network or DNS restrictions may block the AI feature even if the app code is correct.

---

## Running the Project

### 1. Install dependencies

```bash
cd "d:/carbon platform/carbon-platform"
npm install
```

### 2. Configure environment variables

Create `.env` with:

```env
HF_API_KEY=your_huggingface_token_here
VITE_HF_MODEL=gpt2
```

### 3. Start the backend proxy

```bash
npm run server
```

### 4. Start the frontend

```bash
npm run dev
```

### 5. Open the app

Visit `http://localhost:5173`

---

## Notes

- The UI can still operate if the AI model is unreachable because a local rule-based fallback is provided in `AIInsights.jsx`.
- For the AI chat to work, the machine must be able to access `api-inference.huggingface.co`.

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

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || 'gpt2';

if (!HF_API_KEY) {
  console.warn('Warning: HF_API_KEY is not configured. The Hugging Face proxy will fail until it is set.');
}

app.post('/api/hf-chat', async (req, res) => {
  if (!HF_API_KEY) {
    return res.status(500).json({ error: 'Server missing HF_API_KEY' });
  }

  const { prompt, modelName } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  const model = modelName || HF_MODEL;
  const url = `https://api-inference.huggingface.co/models/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HF_API_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 220,
          temperature: 0.8,
          return_full_text: false
        }
      })
    });

    const raw = await response.text();
    let data = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!response.ok) {
      const errorMessage = data?.error || data || `HTTP ${response.status}`;
      console.error('Hugging Face upstream error:', response.status, errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    if (typeof data === 'string') {
      return res.json({ generated_text: data });
    }

    if (data === null) {
      return res.status(502).json({ error: 'Empty response from Hugging Face' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Hugging Face proxy error:', error);
    return res.status(500).json({ error: error.message || 'Unknown proxy error' });
  }
});

const port = process.env.PORT || 5174;
app.listen(port, () => {
  console.log(`Hugging Face proxy server running on http://localhost:${port}`);
});

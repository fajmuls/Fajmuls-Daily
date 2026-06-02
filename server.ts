import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes
app.post("/api/finance/parse", async (req, res) => {
  const { prompt, categories } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Parse into financial records. 
      Text: "${prompt}"
      Categories: ${categories?.join(", ") || "Infer"}.
      JSON structure: { records: [{ amount: number, type: "income"|"expense", category: string, note: string, iconName: string }] }`,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Failed to parse text" });
  }
});

app.post("/api/ai/intent", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt" });

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Evaluate intent from: "${prompt}"
      Intents:
      1. ADD_FINANCE: { amount, type: "income"|"expense", category, note, iconName }
      2. ADD_NOTE: { title, content }
      3. NAVIGATE: { path } (one of: "/", "/finance", "/notes", "/history", "/docs")
      
      Return JSON: { intent: "ADD_FINANCE"|"ADD_NOTE"|"NAVIGATE"|"UNKNOWN", data: any }`,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    res.status(500).json({ error: "Fail" });
  }
});

app.post("/api/ai/finance-analysis", async (req, res) => {
  const { summary } = req.body;
  if (!summary) return res.status(400).json({ error: "No summary" });

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze these recent financial records and provide a one-sentence, punchy insight or piece of advice for the user (in Indonesian). Focus on spending patterns, potential savings, or comparisons if data suggests any.
      Data: ${JSON.stringify(summary)}
      
      Return JSON: { insight: string }`,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(result.text));
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Fail" });
  }
});

app.get("/api/maps/reverse-geocoding", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

  try {
    const key = process.env.GOOGLE_MAPS_PLATFORM_KEY;
    if (!key) return res.status(500).json({ error: "No API Key" });
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Fail" });
  }
});

app.post("/api/ai/ocr", async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "No image" });

  try {
    const model = ai.models.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Tolong rangkum teks yang ada di gambar ini secara detail dan informatif (dalam Bahasa Indonesia). Jika ini adalah struk, sebutkan item-itemnya. Jika ini dokumen, rangkum isinya.",
      { inlineData: { data: image.split(",")[1], mimeType: "image/jpeg" } }
    ]);

    res.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("AI OCR Error:", error);
    res.status(500).json({ error: "Gagal memproses gambar." });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

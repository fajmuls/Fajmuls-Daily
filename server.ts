import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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
      model: "gemini-2.5-flash",
      contents: `Parse the following text into financial records (income or expense). 
      Text: "${prompt}"
      Available categories: ${categories?.join(", ") || "None specified, please infer"}.
      
      Rules:
      - If user says "spent", "buy", "bayar", "keluar", it's an expense.
      - If user says "receive", "salary", "income", "dapat", "masuk", it's an income.
      - Extract amount, category, and a short note.
      - Try to match category from available ones if possible, otherwise create a sensible one.
      - Assign an icon name from Lucide React that fits the category (e.g., 'Utensils' for food, 'ShoppingBag' for belanja, 'Wallet' for salary, 'Zap' for electricity, 'Droplets' for water, 'Car' for fuel/travel, 'Smartphone' for credit/pulsa, 'Gift' for charity, 'Coffee' for snacks).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            records: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  amount: { type: Type.NUMBER },
                  type: { type: Type.STRING, description: "income or expense" },
                  category: { type: Type.STRING },
                  note: { type: Type.STRING },
                  iconName: { type: Type.STRING, description: "Lucide icon name (PascalCase)" }
                },
                required: ["amount", "type", "category", "iconName"]
              }
            }
          },
          required: ["records"]
        }
      }
    });

    let responseText = result.text || '{"records": []}';
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Failed to parse text" });
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

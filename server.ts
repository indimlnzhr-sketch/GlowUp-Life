import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// AI Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  // ... (existing code, unchanged) ...
});

// Detect Food Endpoint
app.post("/api/detect-food", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image required" });

    const prompt = "Identify the food in this image, give the food name and approximate calories. Return ONLY valid JSON in format: { \"foodName\": \"\", \"calories\": \"\" }";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: image.split(",")[1] } },
          { text: prompt }
        ]
      }],
    });
    
    // Clean response just in case
    const text = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(text);
    return res.json(result);
  } catch (error: any) {
    console.error("DetectFood Error:", error);
    return res.status(500).json({ error: "Failed to detect food" });
  }
});

// Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    // Menggunakan "as any" untuk menghindari error TypeScript dengan Express
    app.use(vite.middlewares as any);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(
        path.join(distPath, "index.html")
      );
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  });
}

startServer();
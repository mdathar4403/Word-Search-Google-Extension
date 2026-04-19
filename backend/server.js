const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Gemini SDK
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});

app.post("/meaning", async (req, res) => {
    const { word } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // ✅ safe stable model
            contents: `
                Explain the word "${word}" and return strictly in this format:

                Meaning: ...
                Rewrite: ...
                Tone: ...
                Hindi: ...
                            `
        });

        const text = response.text || "Meaning: Not found";

        res.json({ result: text });

    } catch (err) {
        console.error("🔥 ERROR:", err);

        res.status(200).json({
            result: "Meaning: Error\nRewrite: -\nTone: -\nHindi: -"
        });
    }
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
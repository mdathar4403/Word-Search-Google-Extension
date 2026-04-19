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

const meaningHistory = [];

function parseMeaningText(text) {
    const lines = text.split("\n").map(line => line.trim());
    return {
        meaning: lines[0]?.replace(/^Meaning:\s*/i, "").trim() || "",
        rewrite: lines[1]?.replace(/^Rewrite:\s*/i, "").trim() || "",
        tone: lines[2]?.replace(/^Tone:\s*/i, "").trim() || "",
        hindi: lines[3]?.replace(/^Hindi:\s*/i, "").trim() || ""
    };
}

app.post("/meaning", async (req, res) => {
    const { word } = req.body;
    console.log(process.env.GOOGLE_API_KEY);

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

        const text = response.text || "Meaning: Not found\nRewrite: -\nTone: -\nHindi: -";
        const parsed = parseMeaningText(text);

        const record = {
            word,
            rawText: text,
            ...parsed,
            createdAt: new Date().toISOString(),
            error: false
        };
        meaningHistory.push(record);

        res.json({ result: text });

    } catch (err) {
        console.error("🔥 ERROR:", err);

        const errorText = "Meaning: Error\nRewrite: -\nTone: -\nHindi: -";
        const errorRecord = {
            word,
            rawText: errorText,
            ...parseMeaningText(errorText),
            createdAt: new Date().toISOString(),
            error: true
        };
        meaningHistory.push(errorRecord);

        res.status(200).json({
            result: errorText
        });
    }
});

app.get("/meanings", (req, res) => {
    res.json({
        count: meaningHistory.length,
        meanings: meaningHistory
    });
});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
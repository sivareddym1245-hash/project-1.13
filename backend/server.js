const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENROUTER_API_KEY;

app.post('/api/simplify', async (req, res) => {
    const { documentationText } = req.body;

    if (!documentationText) {
        return res.status(400).json({ error: "Please provide text to simplify." });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an expert programming tutor. Explain the provided technical documentation in two short paragraphs. Paragraph 1: Explain it at a 5th-grade reading level. Paragraph 2: Provide a real-world, non-coding analogy (like cooking, driving, etc.) to make it easy to understand." 
                    },
                    { 
                        role: "user", 
                        content: documentationText 
                    }
                ]
            })
        });
        const data = await response.json();
        
        // Check if OpenRouter sent an error instead of a success response
        if (data.error) {
            console.error("OpenRouter Error Details:", data.error);
            return res.status(500).json({ error: `API Error: ${data.error.message}` });
        }

        const aiExplanation = data.choices[0].message.content;
        res.json({ result: aiExplanation });

    } catch (error) {
        console.error("Error calling AI:", error);
        res.status(500).json({ error: "Failed to generate explanation." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const MODEL = 'openai/gpt-4o-mini';
const MAX_DOCUMENTATION_LENGTH = 12000;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function createApp({ apiKey = process.env.OPENROUTER_API_KEY, fetchImpl = globalThis.fetch } = {}) {
    const app = express();

    app.use(cors());
    app.use(express.json({ limit: '64kb' }));

    app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });

    app.post('/api/simplify', async (req, res) => {
        const documentationText = req.body && req.body.documentationText;

        if (typeof documentationText !== 'string' || !documentationText.trim()) {
            return res.status(400).json({ error: 'Please provide documentation text to simplify.' });
        }

        const text = documentationText.trim();
        if (text.length > MAX_DOCUMENTATION_LENGTH) {
            return res.status(413).json({
                error: `Please keep the text under ${MAX_DOCUMENTATION_LENGTH.toLocaleString()} characters.`
            });
        }

        if (!apiKey) {
            return res.status(503).json({ error: 'The explanation service is not configured yet.' });
        }

        try {
            const response = await fetchImpl(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a programming tutor. Explain technical documentation in two short sections: first, a clear explanation for a beginner; second, a practical everyday analogy. Keep important technical details accurate.'
                        },
                        { role: 'user', content: text }
                    ]
                }),
                signal: AbortSignal.timeout(30000)
            });

            let data;
            try {
                data = await response.json();
            } catch {
                console.error('The AI provider returned an invalid response.');
                return res.status(502).json({ error: 'The explanation service returned an invalid response. Please try again.' });
            }

            const result = data.choices && data.choices[0] && data.choices[0].message &&
                data.choices[0].message.content;

            if (!response.ok || data.error || typeof result !== 'string' || !result.trim()) {
                console.error('The AI provider could not generate an explanation.', {
                    status: response.status,
                    message: data.error && data.error.message
                });
                return res.status(502).json({ error: 'The explanation service could not process this text. Please try again.' });
            }

            return res.json({ result: result.trim() });
        } catch (error) {
            console.error('AI provider request failed:', error.message);
            return res.status(502).json({ error: 'Could not reach the explanation service. Please try again shortly.' });
        }
    });

    app.use((error, req, res, next) => {
        if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
            return res.status(400).json({ error: 'Request body must contain valid JSON.' });
        }
        if (error.type === 'entity.too.large') {
            return res.status(413).json({ error: 'Request is too large. Please shorten the documentation and try again.' });
        }
        console.error('Unhandled request error:', error);
        return res.status(500).json({ error: 'An unexpected server error occurred.' });
    });

    return app;
}

if (require.main === module) {
    const port = process.env.PORT || 3000;
    createApp().listen(port, () => {
        console.log(`Doc Decoder API listening on port ${port}`);
    });
}

module.exports = { createApp };

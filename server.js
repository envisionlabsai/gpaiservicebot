require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Serve static HTML file for the chatbot interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle chatbot messages
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        // Check for weather-related questions or out-of-scope inquiries
        if (message.toLowerCase().includes('weather')) {
            return res.json({
                response: "I'm locked in the GrowthPros basement and can't check the weather outside, sorry! But let's get back to how AI can transform your business."
            });
        }

        // Call OpenAI API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
            max_tokens: 100,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        // Respond with OpenAI's answer
        const botResponse = response.data.choices[0].message.content;

        // Send response back to user
        res.json({
            response: botResponse,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            response: 'Oops! Something went wrong. Let’s try that again.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

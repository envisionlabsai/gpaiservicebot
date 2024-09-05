require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Load knowledgebase
const knowledgeBase = {};
for (let i = 1; i <= 5; i++) {
    const filePath = path.join(__dirname, `knowledgebase/part${i}.json`);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(knowledgeBase, fileContent);
}

// Root Route: Informative message for users
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle chatbot messages
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const lowerCaseMessage = message.toLowerCase();
        
        // Search in knowledgebase
        for (const key in knowledgeBase) {
            if (lowerCaseMessage.includes(key.toLowerCase())) {
                return res.json({ response: knowledgeBase[key] });
            }
        }

        // Call OpenAI API if not found in knowledgebase
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

        const botResponse = response.data.choices[0].message.content;
        res.json({ response: botResponse });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            response: 'Oops! Something went wrong. Let’s try that again.'
        });
    }
});

// Calendly booking endpoint
app.post('/schedule', async (req, res) => {
    const { name, email, date } = req.body;

    try {
        const calendlyResponse = await axios.post(
            'https://api.calendly.com/scheduled_events',
            {
                event_type: "https://calendly.com/event_types/175480232",
                invitees: [{
                    name: name,
                    email: email,
                }],
                start_time: date,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CALENDLY_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        res.json({
            response: `Meeting scheduled successfully for ${name} on ${date}.`,
            meeting_link: calendlyResponse.data.resource.uri
        });
    } catch (error) {
        console.error('Calendly API error:', error);
        res.status(500).json({
            response: 'Could not schedule the meeting. Please try again.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

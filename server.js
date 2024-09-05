require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' folder (where your HTML file will be)
app.use(express.static(path.join(__dirname, 'public')));

// Load the knowledgebase
let knowledgeBase = [];
const knowledgeBaseFolder = path.join(__dirname, 'knowledgebase');

// Load all JSON files in the knowledgebase folder
fs.readdir(knowledgeBaseFolder, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
        const filePath = path.join(knowledgeBaseFolder, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        knowledgeBase = knowledgeBase.concat(data);
    });
});

// Root Route: Serve the chatbot HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chatbot API to handle messages
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    // Check for off-topic questions like weather
    if (message.toLowerCase().includes('weather')) {
        return res.json({
            response: "I'm locked in the GrowthPros basement and can't check the weather outside, sorry! But let's get back to how AI can transform your business."
        });
    }

    // Search the knowledgebase for a response
    let responseFound = false;
    for (let entry of knowledgeBase) {
        if (message.toLowerCase().includes(entry.keyword.toLowerCase())) {
            responseFound = true;
            return res.json({ response: entry.response });
        }
    }

    // Use GPT-3.5 for dynamic responses if not in the knowledgebase
    if (!responseFound) {
        try {
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
            return res.json({ response: botResponse });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ response: 'Oops! Something went wrong. Let’s try that again.' });
        }
    }
});

// Calendly integration for scheduling meetings
app.post('/schedule', async (req, res) => {
    const { name, email, date } = req.body;

    try {
        const calendlyResponse = await axios.post(
            'https://api.calendly.com/scheduled_events',
            {
                event_type: "https://calendly.com/event_types/175480232", // Use your event type URL
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
            response: 'Could not schedule the meeting. Please try again later.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

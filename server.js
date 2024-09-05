<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GrowthPros AI Chatbot</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #081B46;
            color: white;
        }
        .chat-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #081B46;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .chat-header {
            background-color: #0065FF;
            color: white;
            padding: 10px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .chat-body {
            height: 400px;
            overflow-y: scroll;
            padding: 10px;
            background-color: #FFFFFF;
            color: black;
            border-radius: 0 0 8px 8px;
            position: relative;
        }
        .chat-bubble {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            width: fit-content;
        }
        .bot-bubble {
            background-color: #f0f0f0;
        }
        .user-bubble {
            background-color: #0065FF;
            color: white;
            margin-left: auto;
        }
        .chat-input-container {
            display: flex;
            padding: 10px;
            background-color: #081B46;
            border-radius: 0 0 8px 8px;
        }
        .chat-input {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: none;
        }
        .chat-send-button {
            background-color: #0065FF;
            border: none;
            padding: 10px;
            border-radius: 8px;
            color: white;
            margin-left: 5px;
            cursor: pointer;
        }
        /* Custom scrollbar */
        .chat-body::-webkit-scrollbar {
            width: 10px;
        }
        .chat-body::-webkit-scrollbar-thumb {
            background-image: url('scroll.png'); /* Replace with your custom scroll button image */
            background-color: #0065FF;
            border-radius: 10px;
        }
        .chat-body::-webkit-scrollbar-track {
            background-color: transparent;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            Welcome to GrowthPros AI Chatbot
        </div>
        <div class="chat-body" id="chat-body">
            <!-- Chat messages will be inserted here -->
        </div>
        <div class="chat-input-container">
            <input type="text" class="chat-input" id="chat-input" placeholder="Type a message..." />
            <button class="chat-send-button" id="send-btn">Send</button>
        </div>
    </div>

    <script>
        const chatBody = document.getElementById('chat-body');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        function appendMessage(content, isBot) {
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('chat-bubble');
            messageBubble.classList.add(isBot ? 'bot-bubble' : 'user-bubble');
            messageBubble.textContent = content;
            chatBody.appendChild(messageBubble);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        sendBtn.addEventListener('click', async () => {
            const userMessage = chatInput.value;
            if (!userMessage) return;

            appendMessage(userMessage, false);
            chatInput.value = '';

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await response.json();
            appendMessage(data.response, true);
        });
    </script>
</body>
</html>

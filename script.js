const API_KEY = 
'########################################'
; 
// Replace with your actual Gemini API key – this stores the API key to authenticate requests to the Gemini API.

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
// The base URL of the Gemini API used to generate content (for text-based responses).

const chatMessages = document.getElementById('chat-messages');
// Gets the DOM element with the ID 'chat-messages', where the chat messages (user and bot) will be displayed.

const userInput = document.getElementById('user-input');
// Gets the DOM element with the ID 'user-input', which is the input field where the user types their message.

const sendButton = document.getElementById('send-button');
// Gets the DOM element with the ID 'send-button', which is the button the user clicks to send their message.

async function generateResponse(prompt) {
// Defines an asynchronous function `generateResponse` that takes the user's input (prompt) and generates a response from the API.

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    // Sends a POST request to the Gemini API endpoint with the API key appended to the URL.
        method: 'POST',
        // Specifies the HTTP method (POST) to send data to the API.

        headers: {
            'Content-Type': 'application/json',
        },
        // Sets the request headers to indicate that the content being sent is in JSON format.

        body: JSON.stringify({
        // The body of the request, converting the user's message into the format required by the API.
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                            // The user's input (`prompt`) is inserted into the request payload.
                        }
                    ]
                }
            ]
        })
    });

    if (!response.ok) {
    // Checks if the API request was unsuccessful (i.e., the response is not OK).
        throw new Error('Failed to generate response');
        // If there's an error, an exception is thrown with an error message.
    }

    const data = await response.json();
    // Converts the API response to JSON format.

    return data.candidates[0].content.parts[0].text;
    // Returns the first generated response from the API (the text part of the response).
}

function cleanMarkdown(text) {
// Defines a function `cleanMarkdown` to remove any Markdown formatting (like headers, bold text, etc.) from the response.
    return text
        .replace(/#{1,6}\s?/g, '')
        // Removes any Markdown headers (e.g., #, ##, ###).

        .replace(/\*\*/g, '')
        // Removes bold formatting (double asterisks **).

        .replace(/\n{3,}/g, '\n\n')
        // Limits excessive newlines to a maximum of two (replaces more than two newlines with two).

        .trim();
        // Removes any whitespace from the start and end of the string.
}

function addMessage(message, isUser) {
// Defines a function `addMessage` to add a new message to the chat display. It takes the `message` (text) and `isUser` (boolean indicating whether the message is from the user or the bot).
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    // Creates a new `div` element for the message and adds the 'message' CSS class.

    messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
    // Adds a class based on whether the message is from the user ('user-message') or the bot ('bot-message').

    const profileImage = document.createElement('img');
    profileImage.classList.add('profile-image');
    // Creates an image element for the profile picture (either the user or the bot) and adds the 'profile-image' CSS class.

    profileImage.src = isUser ? 'user.jpg' : 'bot.jpg';
    // Sets the image source depending on whether it's a user or bot message ('user.jpg' or 'bot.jpg').

    profileImage.alt = isUser ? 'User' : 'Bot';
    // Sets the alternate text for the image (for accessibility), either 'User' or 'Bot'.

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    // Creates a `div` element to hold the text content of the message and adds the 'message-content' CSS class.

    messageContent.textContent = message;
    // Sets the text content of the message.

    messageElement.appendChild(profileImage);
    messageElement.appendChild(messageContent);
    // Appends the profile image and message content to the message element.

    chatMessages.appendChild(messageElement);
    // Appends the complete message (with profile image and text) to the chat messages section.

    chatMessages.scrollTop = chatMessages.scrollHeight;
    // Scrolls the chat to the bottom to ensure the latest message is visible.
}

async function handleUserInput() {
// Defines an asynchronous function `handleUserInput` to process and handle the user’s input.
    const userMessage = userInput.value.trim();
    // Retrieves the user input from the input field and trims any leading/trailing whitespace.

    if (userMessage) {
    // If the user has entered a message (i.e., it's not empty):
        addMessage(userMessage, true);
        // Adds the user's message to the chat (as a user message).

        userInput.value = '';
        // Clears the input field.

        sendButton.disabled = true;
        userInput.disabled = true;
        // Disables the send button and the input field to prevent multiple messages being sent while the bot responds.

        try {
            const botMessage = await generateResponse(userMessage);
            // Calls the `generateResponse` function to get the bot's reply.

            addMessage(cleanMarkdown(botMessage), false);
            // Adds the bot's cleaned response to the chat.
        } catch (error) {
            console.error('Error:', error);
            // Logs any error that occurs during the bot response.

            addMessage('Sorry, I encountered an error. Please try again.', false);
            // Displays an error message in the chat if something goes wrong.
        } finally {
            sendButton.disabled = false;
            userInput.disabled = false;
            userInput.focus();
            // Re-enables the send button and the input field, and puts the focus back on the input for further user interaction.
        }
    }
}

sendButton.addEventListener('click', handleUserInput);
// Adds an event listener to the send button that calls `handleUserInput` when clicked.

userInput.addEventListener('keypress', (e) => {
// Adds an event listener for when a key is pressed in the input field.
    if (e.key === 'Enter' && !e.shiftKey) {
    // Checks if the 'Enter' key is pressed and Shift is not held (to distinguish from Shift+Enter for newlines).
        e.preventDefault();
        // Prevents the default behavior of adding a newline.

        handleUserInput();
        // Calls `handleUserInput` to send the message.
    }
});

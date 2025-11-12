const { GoogleGenerativeAI } = require("@google/generative-ai");

// Init Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Choose model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * For single, self-contained prompts (like prescription analysis).
 * @param {string} prompt - The complete prompt to send.
 * @returns {Promise<string>} The generated text response.
 */
const generateSingleResponse = async (prompt) => {
    if (!prompt) {
        throw new Error("Prompt is required");
    }

    console.log('Sending single-response prompt to Gemini AI...');
    try {
        // Generate content
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return text;

    } catch (error) {
        console.error("Error generating single response:", error);
        throw new Error("Failed to get AI response. Check server logs.");
    }
};

/**
 * For conversational chats with history.
 * @param {string} systemInstruction - The base prompt that defines the AI's role.
 * @param {Array<Object>} history - The array of past messages.
 * @param {string} latestMessage - The new user message to respond to.
 * @returns {Promise<string>} The generated text response.
 */
const generateChatResponse = async (systemInstruction, history, latestMessage) => {
    if (!latestMessage) {
        throw new Error("Latest message is required");
    }

    console.log('Sending chat prompt to Gemini AI...');
    try {
        // Combine history with the new message
        const contents = [
            ...history,
            { role: 'user', parts: [{ text: latestMessage }] }
        ];

        const result = await model.generateContent({
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            }
        });

        const response = result.response;
        const text = response.text();
        return text;

    } catch (error) {
        console.error("Error generating chat response:", error);
        throw new Error("Failed to get AI response. Check server logs.");
    }
};

/**
 * Generates a short, relevant title for a chat based on the first exchange.
 * @param {string} userMessage - The user's first message.
 * @param {string} botMessage - The bot's first reply.
 * @returns {Promise<string>} A short title (3-5 words).
 */
const generateChatTitle = async (userMessage, botMessage) => {
    const prompt = `
        You are a title generation expert. Based on the following conversation exchange,
        create a very short and concise title (3-5 words maximum).
        Do not use quotes or any other formatting. Just return the title.

        User: "${userMessage}"
        Bot: "${botMessage}"

        Title:
    `;

    console.log('Generating chat title...');
    const title = await generateSingleResponse(prompt);
    // Clean up any extra formatting the AI might add
    return title.replace(/"/g, '').trim();
};

module.exports = {
    generateSingleResponse,
    generateChatResponse,
    generateChatTitle
};
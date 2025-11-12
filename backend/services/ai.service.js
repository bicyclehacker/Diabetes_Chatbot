const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Generates text using the Gemini AI model.
 * @param {string} prompt - The text prompt to send to the AI.
 * @returns {Promise<string>} The generated text response.
 */


const generateAIText = async (prompt) => {
    if (!prompt) {
        throw new Error("Prompt is required");
    }

    console.log('Sending prompt to Gemini AI...');
    try {
        // Generate content
        const result = await model.generateContent(prompt);
        const response = result.response;

        // Extract and return the text
        const text = response.text();
        return text;

    } catch (error) {
        console.error("Error generating AI text:", error);
        throw new Error("Failed to get AI response. Check server logs.");
    }
};

module.exports = { generateAIText };
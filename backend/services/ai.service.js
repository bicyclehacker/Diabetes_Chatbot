const { GoogleGenerativeAI } = require("@google/generative-ai");

// Init Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Choose model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


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

/**
 * Generates estimated nutrition info for a list of foods.
 * @param {string} foodString - A comma-separated string of food items.
 * @returns {Promise<{calories: number, carbs: number}>} - A JSON object with nutrition data.
 */
const generateNutritionInfo = async (foodString) => {
    const prompt = `
        You are a nutritional analysis expert.
        Analyze the following list of food items and return a structured JSON object
        with three keys:
        
        1. "name": A creative and descriptive meal name based on the ingredients.
           **Do not** just list the food items with commas.
           For example, if the foods are "Chicken, Rice, Broccoli, Soy Sauce", a good name would be "Chicken & Broccoli Stir-fry" or "Healthy Chicken Bowl".
           If the foods are "Bread, Peanut Butter, Jelly", a good name is "PB&J Sandwich".
           name must be short so that i can be human readable 

        2. "calories": The total estimated 'calories' as a number.
        3. "carbs": The total estimated 'carbs' as a number.

        Return *only* the raw JSON object. Do not add any text, formatting, or markdown backticks.

        Food Items: "${foodString}"

        Example Response:
        { "name": "Chicken & Broccoli Stir-fry", "calories": 550, "carbs": 60 }
    `;
    console.log('Sending nutrition prompt to Gemini AI...');
    try {
        const aiResponse = await generateSingleResponse(prompt);

        // Clean up the response to ensure it's valid JSON
        const jsonString = aiResponse
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        const nutritionData = JSON.parse(jsonString);

        // Ensure data is valid
        if (
            typeof nutritionData.name !== 'string' ||
            typeof nutritionData.calories !== 'number' ||
            typeof nutritionData.carbs !== 'number'
        ) {
            throw new Error('AI returned invalid data format.');
        }

        return nutritionData; // e.g., { calories: 450, carbs: 55 }

    } catch (error) {
        console.error("Failed to parse AI nutrition response:", error);
        throw new Error("Failed to parse AI nutrition data.");
    }
};

/**
 * For single-turn analysis of images (Vision).
 * @param {string} prompt - The specific instruction (e.g., "Parse this prescription").
 * @param {Buffer} imageBuffer - The raw image buffer (from req.file.buffer).
 * @param {string} mimeType - The mime type of the image (e.g., 'image/png').
 * @returns {Promise<string>} The generated text response.
 */
const generateResponseWithImage = async (prompt, imageBuffer, mimeType) => {
    if (!prompt || !imageBuffer) {
        throw new Error("Prompt and Image Buffer are required");
    }

    console.log('Sending vision prompt to Gemini AI...');
    try {
        // Convert Buffer to Generative AI Image Part format
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType
            }
        };

        // Combine the text prompt and the image into the user role
        const contents = [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    imagePart
                ]
            }
        ];

        // Generate content (Stateless - ideal for single images)
        const result = await model.generateContent({
            contents: contents,
        });

        const response = result.response;
        const text = response.text();
        return text;

    } catch (error) {
        console.error("Error generating vision response:", error);
        throw new Error("Failed to analyze image. Check server logs.");
    }
};

module.exports = {
    generateSingleResponse,
    generateChatResponse,
    generateChatTitle,
    generateNutritionInfo,
    generateResponseWithImage
};
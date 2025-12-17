const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/* -------------------- CONFIGURATION -------------------- */

// 1. Setup Groq (For Text, Chat, JSON)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Use the latest stable Llama model
const GROQ_MODEL = "llama-3.3-70b-versatile";

// 2. Setup Gemini (For Images/Vision)
// We use Gemini for images because it is generally more robust for OCR/Vision than Groq's LLaVA.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiVisionModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

/* -------------------- TEXT FUNCTIONS (GROQ) -------------------- */

/**
 * For single, self-contained prompts (like prescription analysis text).
 */
const generateSingleResponse = async (prompt) => {
    if (!prompt) throw new Error("Prompt is required");

    console.log("Sending single-response prompt to Groq AI...");
    try {
        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Groq single-response error:", error);
        throw new Error("Failed to get AI response.");
    }
};

/**
 * For conversational chats with history.
 * critical fix: Maps 'model' role to 'assistant' for Groq compatibility.
 */
const generateChatResponse = async (systemInstruction, history, latestMessage) => {
    if (!latestMessage) throw new Error("Latest message is required");

    console.log("Sending chat prompt to Groq AI...");
    try {
        // 1. Prepare messages array
        const messages = [];

        // 2. Add System Instruction (if provided)
        if (systemInstruction) {
            messages.push({ role: "system", content: systemInstruction });
        }

        // 3. Add & Map History
        // Groq/Llama requires roles to be strictly "user", "assistant", or "system".
        // Your DB likely has "model" or "bot", which causes the 400 error.
        const mappedHistory = history.map((msg) => ({
            role: (msg.role === "model" || msg.role === "bot") ? "assistant" : "user",
            content: msg.parts?.[0]?.text || msg.content || "",
        }));

        messages.push(...mappedHistory);

        // 4. Add Latest User Message
        messages.push({ role: "user", content: latestMessage });

        // 5. Send to Groq
        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: messages,
            temperature: 0.7,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Groq chat error:", error);
        throw new Error("Failed to get AI response.");
    }
};

/**
 * Generates a short, relevant title for a chat.
 */
const generateChatTitle = async (userMessage, botMessage) => {
    const prompt = `
    Create a very short title (3–5 words max) for this chat.
    No quotes, no formatting.

    User: "${userMessage}"
    Bot: "${botMessage}"

    Title:
  `;

    console.log("Generating chat title...");
    try {
        const title = await generateSingleResponse(prompt);
        return title.replace(/"/g, "").trim();
    } catch (error) {
        console.error("Title generation failed:", error);
        return "New Chat"; // Fallback
    }
};

/**
 * Generates estimated nutrition info for a list of foods.
 */
const generateNutritionInfo = async (foodString) => {
    const prompt = `
    You are a nutrition expert.
    Analyze the food list and return ONLY valid JSON with:
    - name (string): A short, descriptive meal name.
    - calories (number): Total calories.
    - carbs (number): Total carbs (g).

    Food Items: "${foodString}"

    Return ONLY raw JSON. No markdown formatting.
    Example:
    { "name": "Healthy Chicken Bowl", "calories": 550, "carbs": 60 }
  `;

    console.log("Sending nutrition prompt to Groq AI...");
    try {
        const aiResponse = await generateSingleResponse(prompt);

        // Sanitize response (remove markdown if model adds it)
        const jsonString = aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const nutritionData = JSON.parse(jsonString);

        if (
            typeof nutritionData.name !== "string" ||
            typeof nutritionData.calories !== "number" ||
            typeof nutritionData.carbs !== "number"
        ) {
            throw new Error("Invalid nutrition data format");
        }

        return nutritionData;
    } catch (error) {
        console.error("Failed to parse nutrition response:", error);
        throw new Error("Failed to parse AI nutrition data.");
    }
};

/* -------------------- IMAGE FUNCTIONS (GEMINI) -------------------- */
// We use Gemini here because Groq's Vision models (LLaVA) are often less consistent 
// for complex OCR/Medical tasks than Gemini 1.5 Flash.

/**
 * For single-turn analysis of images (Vision).
 */
const generateResponseWithImage = async (prompt, imageBuffer, mimeType) => {
    if (!prompt || !imageBuffer) {
        throw new Error("Prompt and Image Buffer are required");
    }

    console.log("Sending vision prompt to Gemini AI...");
    try {
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType,
            },
        };

        const contents = [
            {
                role: "user",
                parts: [{ text: prompt }, imagePart],
            },
        ];

        const result = await geminiVisionModel.generateContent({ contents });
        const response = result.response;

        return response.text();
    } catch (error) {
        console.error("Gemini vision error:", error);
        throw new Error("Failed to analyze image.");
    }
};

/* -------------------- EXPORTS -------------------- */

module.exports = {
    generateSingleResponse,
    generateChatResponse,
    generateChatTitle,
    generateNutritionInfo,
    generateResponseWithImage,
};
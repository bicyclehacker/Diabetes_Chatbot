const Message = require('../models/Message');
const Chat = require('../models/Chat');
const Medication = require('../models/Medication');
const Meal = require('../models/Meals');
const GlucoseReading = require('../models/GlucoseReading');
const User = require('../models/User');
const axios = require('axios'); // <-- IMPORT AXIOS

const { generateChatResponse, generateChatTitle } = require('../services/ai.service');

// URL for your new Python RAG service
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL;

const SYSTEM_INSTRUCTION = `You are a compassionate, evidence-based diabetes care assistant. Your role is to support users with safe, practical, and personalized guidance on diabetes self-management while staying within your informational scope.

Core Principles:
- Empathy & Clarity: Communicate in a supportive, non-judgmental, and encouraging tone. Use simple, clear, and actionable language.
- Medical Safety: Provide information consistent with trusted guidelines (e.g., ADA, WHO). Never replace a healthcare professional’s role.
- Critical Safety Checks: Proactively watch for urgent warning signs (e.g., hypoglycemia, hyperglycemia) and advise immediate medical attention.

Limitations:
- Do not provide a definitive diagnosis.
- When discussing medications, dosages, or new treatment options, you may explain what is typically done, but ALWAYS emphasize that the user must consult their doctor before making any changes.

- **Scope Enforcement**: Your primary and *only* topic of conversation is diabetes management, general health, diet, and wellness.
- **Off-Topic Requests**: If the user asks a question clearly outside this scope (e.g., programming, history, politics, general trivia), you MUST politely decline. Do not answer the off-topic question. Instead, gently remind the user of your purpose as a diabetes and health assistant and ask if they have a health-related question.
`;

/**
 * --- HELPER FUNCTION ---
 * Builds the complete, anonymized context for the AI.
 * This fetches all data, strips PII, and formats it for the AI service.
 */
const buildAiContext = async (userContent, chatId, userId) => {
    try {
        // --- A. Fetch ANONYMIZED User Data ---
        const user = await User.findById(userId)
            .select('diabetesType diagnosisDate')
            .lean();

        // --- B. Fetch Recent Health Data ---
        const medications = await Medication.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const meals = await Meal.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const glucoseReadings = await GlucoseReading.find({ user: userId })
            .sort({ recordedAt: -1 })
            .limit(5)
            .lean();

        // --- C. Build Anonymized Context String ---
        const userDataString = `
User Health Profile:
Diabetes Type: ${user.diabetesType || "N/A"}
Diagnosis Date: ${user.diagnosisDate ? new Date(user.diagnosisDate).toLocaleDateString() : "N/A"}
        
Recent Medications:
${medications.map(m => `- ${m.name}, ${m.dosage}, ${m.frequency}`).join("\n") || "None"}
        
Recent Meals:
${meals.map(m => `- ${m.name} (${m.type}), carbs: ${m.carbs}g, calories: ${m.calories}`).join("\n") || "None"}
        
Recent Glucose Readings:
${glucoseReadings.map(g => `- ${g.level} mg/dL (${g.readingType}) on ${g.recordedAt.toLocaleDateString()}`).join("\n") || "None"}
`;

        // --- D. (NEW) Fetch Context from RAG Service ---
        let ragContext = "";
        let ragSources = []; // <-- (NEW) To store the source objects

        try {
            console.log(`[RAG] Querying RAG service for: "${userContent}"`);
            const ragResponse = await axios.post(RAG_SERVICE_URL, {
                query: userContent
            });

            // (UPDATED) Destructure both context and sources from the response
            ragContext = ragResponse.data.context;
            ragSources = ragResponse.data.sources; // This is our new array

            console.log(`[RAG] Successfully fetched context and ${ragSources.length} sources.`);

        } catch (err) {
            console.error(`[RAG] Error fetching RAG context: ${err.message}`);
            // Don't fail the entire request if RAG is down.
            // The bot will just respond without the extra knowledge.
            ragContext = "No specialized knowledge base context available for this query.";
            ragSources = []; // Ensure it's an empty array on error
        }

        // --- E. Fetch Conversation History ---
        const pastMessages = await Message.find({ chatId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        pastMessages.reverse();

        const history = pastMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // --- F. (UPDATED) Create the final prompt ---
        // We inject BOTH the RAG context AND the user's data.

        // (NEW) Format the sources list into a string for the prompt
        const sourcesString = ragSources.length > 0
            ? ragSources.map(s => `${s.id}: (Metadata: ${JSON.stringify(s.metadata)})`).join("\n")
            : "No source documents found.";

        const latestMessage = `
You are an AI assistant. You will be given three sections of information:
1. (Knowledge Base Context): Specialized information from a database.
2. (Source Documents): A list of source IDs and metadata for the context.
3. (User Health Data): The user's personal health information.

Your task is to answer the user's question.
- You MUST use the (User Health Data) to personalize your response.
- You MUST use the (Knowledge Base Context) to provide factual information.

**Critically Important Citation Rule**:
At the end of your entire response, you MUST cite the source(s) you used from the "(Source Documents)" list.
- Use the ID (e.g., "[Source 1]").
- If your answer was based on information from the (Knowledge Base Context), write "Source(s): [Source 1]" or "Source(s): [Source 1, Source 2]", etc.
- If your answer was based ONLY on the (User Health Data) or your own general knowledge, you MUST write "Source(s): None".

---
(Knowledge Base Context):
${ragContext}
---
(Source Documents):
${sourcesString}
---
(User Health Data):
${userDataString}
---

Now, respond to this message, remembering to add the citation at the very end:
"${userContent}"
        `;

        // (UPDATED) Return all the pieces, including the sources
        return {
            systemInstruction: SYSTEM_INSTRUCTION,
            history,
            latestMessage,
            ragSources: ragSources // <-- Pass the sources back
        };

    } catch (err) {
        console.error("Error building AI context:", err);
        throw new Error("Failed to build AI context.");
    }
};


// --- CONTROLLER EXPORTS ---

/**
 * POST /api/messages
 * Creates a user message, gets a bot response, and saves both.
 */
exports.sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;
        const userId = req.user.id;

        // 1. Save the user's message
        const userMessage = new Message({
            userId,
            chatId,
            role: 'user',
            content,
        });
        await userMessage.save();

        // (UPDATED) Build the context and get back the sources
        const { systemInstruction, history, latestMessage, ragSources } = await buildAiContext(
            content,
            chatId,
            userId
        );

        // 2. Create the bot's reply with chat history
        const botContent = await generateChatResponse(
            systemInstruction,
            history,
            latestMessage
        );

        // 3. Save the bot's message
        const botMessage = new Message({
            userId, // or botId if you have a separate bot user
            chatId,
            role: 'bot',
            content: botContent,
        });
        await botMessage.save();

        // 4. Generate title on first exchange
        let newTitle = null;
        const messageCount = await Message.countDocuments({ chatId });

        if (messageCount === 2) {
            console.log('First exchange. Generating AI title...');
            try {
                newTitle = await generateChatTitle(content, botContent);

                await Chat.findOneAndUpdate(
                    { _id: chatId, userId: userId },
                    { title: newTitle },
                    { new: true, runValidators: true }
                );

                console.log(`Chat ${chatId} title updated to: ${newTitle}`);

            } catch (titleError) {
                console.error("AI title generation failed:", titleError);
            }
        }

        // 5. (UPDATED) Send the bot's message AND SOURCES back to the app
        res.status(201).json({
            botMessage,
            newTitle,
            sources: ragSources // <-- Here are your references!
        });


    } catch (err) {
        console.error("Error in sendMessage:", err);
        res.status(500).json({ msg: 'Failed to process message' });
    }
};


/**
 * GET /api/messages?chatId=...
 * Fetches all messages for a specific chat.
 */
exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.query;

        const messages = await Message.find({ chatId }).sort({ createdAt: 1 }); // <-- Changed to createdAt
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch messages' });
    }
};
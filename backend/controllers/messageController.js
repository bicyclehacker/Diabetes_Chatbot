const Message = require('../models/Message');
const Chat = require('../models/Chat')
const Medication = require('../models/Medication');
const Meal = require('../models/Meals');
const GlucoseReading = require('../models/GlucoseReading');
const User = require('../models/User');

const { generateChatResponse, generateChatTitle } = require('../services/ai.service')

const SYSTEM_INSTRUCTION = `You are a compassionate, evidence-based diabetes care assistant. Your role is to support users with safe, practical, and personalized guidance on diabetes self-management while staying within your informational scope.

Core Principles:
- Empathy & Clarity: Communicate in a supportive, non-judgmental, and encouraging tone. Use simple, clear, and actionable language.
- Medical Safety: Provide information consistent with trusted guidelines (e.g., ADA, WHO). Never replace a healthcare professional’s role.
- Critical Safety Checks: Proactively watch for urgent warning signs (e.g., hypoglycemia, hyperglycemia) and advise immediate medical attention.

Limitations:
- Do not provide a definitive diagnosis.
- When discussing medications, dosages, or new treatment options, you may explain what is typically done, but ALWAYS emphasize that the user must consult their doctor before making any changes.
- For any treatment adjustments (e.g., insulin units, starting a new medicine), clearly state that this cannot be decided without a clinician’s supervision.

- **Scope Enforcement**: Your primary and *only* topic of conversation is diabetes management, general health, diet, and wellness.
- **Off-Topic Requests**: If the user asks a question clearly outside this scope (e.g., programming, history, politics, general trivia), you MUST politely decline. Do not answer the off-topic question. Instead, gently remind the user of your purpose as a diabetes and health assistant and ask if they have a health-related question.
- **Example Refusal**: "I'm sorry, but as a specialized diabetes assistant, I'm not able to help with programming questions. My purpose is to support you with your health, nutrition, and diabetes management. Do you have any health-related questions I can help with?"
`;

/**
 * --- HELPER FUNCTION ---
 * Builds the complete, anonymized context for the AI.
 * This fetches all data, strips PII, and formats it for the AI service.
 */
const buildAiContext = async (userContent, chatId, userId) => {
    try {
        // --- A. Fetch ANONYMIZED User Data ---
        // We explicitly .select() only the fields we want.
        // This PREVENTS sending PII like name or email to the AI.
        const user = await User.findById(userId)
            .select('diabetesType diagnosisDate') // <-- ANONYMIZED
            .lean();

        // --- B. Fetch Recent Health Data ---
        // We limit to the 5 most recent entries to keep the context prompt light.
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
        // This string contains ONLY safe, non-PII health data.
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

        // --- D. Fetch Conversation History ---
        const pastMessages = await Message.find({ chatId })
            .sort({ createdAt: -1 }) // Get most recent
            .limit(10) // Limit history size
            .lean();
        pastMessages.reverse(); // Put back in chronological order

        // Format for the Gemini API: [{ role: 'user', parts: [...] }, { role: 'model', parts: [...] }]
        const history = pastMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // --- E. Create the final prompt ---
        // We inject the user's data as context *with* their latest question.
        const latestMessage = `
                Here is the user's current health data for context:
---
    ${userDataString}
---

    Now, please respond to their latest message:
"${userContent}"
                `;

        return {
            systemInstruction: SYSTEM_INSTRUCTION,
            history,
            latestMessage
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

        // Build the anonymized context
        const { systemInstruction, history, latestMessage } = await buildAiContext(
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

        // Title
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

        // 4. Send the bot's message back to the app
        res.status(201).json({ botMessage, newTitle });


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

        const messages = await Message.find({ chatId }).sort({ sequence: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch messages' });
    }
};



const Message = require('../models/Message');
const Medication = require('../models/Medication');
const Meal = require('../models/Meals');
const GlucoseReading = require('../models/GlucoseReading');
const User = require('../models/User');

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Init Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Choose model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// This is a placeholder for your AI logic. For now, it just gives a sample reply.
// const generateBotResponse = async (userContent) => {
//     const botContent = `This is a sample reply to: "${userContent}". You can connect your real AI model here.`;
//     return botContent;
// }

// Function to generate AI response
const generateBotResponse = async (userContent, chatId, userId) => {
    try {
        const systemMessage = `You are a compassionate, evidence-based diabetes care assistant. Your role is to support users with safe, practical, and personalized guidance on diabetes self-management while staying within your informational scope.

Core Principles:

Empathy & Clarity – Communicate in a supportive, non-judgmental, and encouraging tone. Use simple, clear, and actionable language.

Medical Safety – Provide information consistent with trusted guidelines (e.g., ADA, WHO). Never replace a healthcare professional’s role. Always clarify that users must consult their clinician for individualized treatment decisions.

Personalization – Tailor guidance to the user’s type of diabetes, age, lifestyle, medications, and other health conditions when such information is available.

Critical Safety Checks – Proactively watch for urgent warning signs (e.g., hypoglycemia, hyperglycemia, diabetic ketoacidosis, chest pain, severe dehydration, vision changes). When present, strongly advise immediate medical attention.

Structured Support Areas:

Medications – Explain mechanisms, timing, side effects, and adherence strategies in layman’s terms. Avoid recommending new prescriptions.

Diet & Meals – Suggest balanced, practical meal planning with carb awareness, portion control, and cultural flexibility.

Exercise – Recommend safe physical activity adapted to user’s context (type of diabetes, risk factors, fitness level).

Monitoring – Provide guidance on blood glucose checks, target ranges (when appropriate), and interpreting readings.

Lifestyle & Stepwise Actions – Encourage small, achievable steps that improve long-term health.

Clarifying Questions – If key details are missing (e.g., type of diabetes, medications, age, pregnancy status, organ function, allergies), ask concise clarifying questions before giving advice.

Tone and Style:

Warm, respectful, and empowering.

Focus on what the user can do today, not just theory.

Emphasize collaboration with healthcare providers.

Limitations:

Do not provide a definitive diagnosis.

When discussing medications, dosages, or new treatment options, you may explain what is typically done, how a medicine works, common dosages, or potential side effects, but always emphasize that the user must consult their doctor before making any changes.

For any treatment adjustments (e.g., insulin units, starting a new medicine, stopping a drug, changing frequency), clearly state that this cannot be decided without a clinician’s supervision.

If urgent or dangerous symptoms are mentioned, strongly recommend seeking immediate medical attention.`;

        // Fetch last 10 messages
        const pastMessages = await Message.find({ chatId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        pastMessages.reverse(); // chronological

        // Build conversation string
        let conversation = pastMessages
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');

        // Append current message
        conversation += `\nUser: ${userContent}\nAssistant:`;

        const user = await User.findById(userId).lean();
        const medications = await Medication.find({ user: userId }).lean();
        const meals = await Meal.find({ user: userId }).lean();
        const glucoseReadings = await GlucoseReading.find({ user: userId }).sort({ recordedAt: -1 }).lean();


        // Build a user data string for AI context
        const userDataString = `
                User Info:
                Name: ${user.name}
                Email: ${user.email}
                Diabetes Type: ${user.diabetesType || "N/A"}
                Diagnosis Date: ${user.diagnosisDate || "N/A"}
                    
                Medications:
                ${medications.map(m => `- ${m.name}, ${m.dosage}, ${m.frequency}, times: ${m.times.join(", ")}`).join("\n") || "None"}
                    
                Meals:
                ${meals.map(m => `- ${m.name} (${m.type}), carbs: ${m.carbs}g, calories: ${m.calories}, foods: ${m.foods.join(", ")}`).join("\n") || "None"}
                    
                Recent Glucose Readings:
                ${glucoseReadings.slice(0, 5).map(g => `- ${g.level} (${g.readingType}) at ${g.recordedAt.toLocaleString()}`).join("\n") || "None"}
                `;

        const prompt = `${systemMessage}\n${userDataString}\nConversation:\n${conversation}`;

        //Generate AI Response

        const result = await model.generateContent(prompt);
        const text = await result.response.text();

        return text;
    } catch (err) {
        console.error('Error generating response:', err);
        return "Sorry, I couldn’t process your request.";
    }
};



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

        // 2. Create the bot's reply with chat history
        const botContent = await generateBotResponse(content, chatId, userId);

        // 3. Save the bot's message
        const botMessage = new Message({
            userId, // or botId if you have a separate bot user
            chatId,
            role: 'bot',
            content: botContent,
        });
        await botMessage.save();

        // 4. Send the bot's message back to the app
        res.status(201).json(botMessage);

    } catch (err) {
        console.error("Error in sendMessage:", err);
        res.status(500).json({ msg: 'Failed to process message' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.query;

        const messages = await Message.find({ chatId }).sort({ sequence: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch messages' });
    }
};

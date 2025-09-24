const Message = require('../models/Message');

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
const generateBotResponse = async (userContent) => {
    try {
        const systemMessage =
            "You are a helpful assistant that gives information that is medically relevant and sound.";

        // Combine system + user message (like in Python)
        const prompt = `${systemMessage}\nUser: ${userContent}\nAssistant:`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("Error generating response:", err);
        return "Sorry, I couldn’t process your request.";
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;

        // 1. Save the user's message
        const userMessage = new Message({
            userId: req.user.id,
            chatId,
            role: 'user',
            content,
        });
        await userMessage.save();

        // 2. Create the bot's reply
        const botContent = await generateBotResponse(content);

        // 3. Save the bot's message
        const botMessage = new Message({
            userId: req.user.id,
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

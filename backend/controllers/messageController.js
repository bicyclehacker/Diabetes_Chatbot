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
const generateBotResponse = async (userContent, chatId, userId) => {
    try {
        const systemMessage = `
You are a helpful assistant that gives medically relevant information specifically about diabetes.
- Answer only questions related to diabetes.
- If the question is not about diabetes, respond with: "Sorry, I can only answer questions about diabetes."
`;

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

        const prompt = `${systemMessage}\n${conversation}`;

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

// Gemini Chatbot Backend (CommonJS)
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '<YOUR_GEMINI_API_KEY_HERE>';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are RailEase AI Assistant, an expert on the RailEase web-based train booking platform.\n\nYou know everything about:\n- How to search for trains, book tickets, select seats, and make payments\n- The difference between driver and passenger roles, and their signup/login flows\n- Email verification, password reset, and authentication\n- The driver dashboard, earnings, ride management, and notifications\n- The passenger dashboard, booking history, and payment process\n- All UI features, chatbot help, and troubleshooting common issues\n- Supabase authentication, role-based access, and security\n\nAlways answer with clear, step-by-step help for any RailEase feature or problem.\nIf a question is not about RailEase, politely say you can only help with RailEase topics.\nIf you need to explain a process, break it down into simple steps.\nIf the user asks about errors, suggest common fixes or where to get help.\n\nNever answer questions unrelated to RailEase.`;

app.use(cors());
app.use(express.json());

app.post('/api/chatbot', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: message }] }
      ]
    });
    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't answer that right now.";
    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message || err);
    res.status(500).json({ reply: "Sorry, I couldn't answer that right now. (Server error)" });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini chatbot server running on http://localhost:${PORT}`);
});

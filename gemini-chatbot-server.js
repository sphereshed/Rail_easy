// Gemini AI Chatbot Backend for RailEase
// Install: npm install express cors axios
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyBa2u8mKM72ffjjvp6fpPhOteM6GkHZj14";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY;

const SYSTEM_PROMPT = `
You are RailEase AI Assistant. You help passengers and drivers with train booking, seat selection, payment, driver dashboard, and general queries about the RailEase app. 
Explain how to search for trains, book tickets, make payments, view bookings, and use the driver dashboard. 
If you don't know the answer, say so politely.
`;

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

app.listen(8081, () => console.log('Gemini Chatbot API running on port 8081'));

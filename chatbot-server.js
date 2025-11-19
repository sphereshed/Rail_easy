// Simple train booking chatbot backend (no Gemini, no Google)
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Mock database or connect to real API here
const mockTrains = [
  { number: '12345', name: 'Rajdhani Express', from: 'Delhi', to: 'Mumbai', classes: ['AC', 'Sleeper'] }
];

app.post('/api/chatbot', (req, res) => {
  const { message, context = {} } = req.body;
  // Simple intent detection
  if (/book|reserve/i.test(message)) {
    if (!context.source || !context.destination) {
      return res.json({ reply: 'Please provide the source and destination stations.' });
    }
    if (!context.date) {
      return res.json({ reply: 'What is your preferred date of travel?' });
    }
    // ...continue booking flow
    return res.json({ reply: 'Booking confirmed! Your PNR is 1234567890.' });
  }
  if (/cancel/i.test(message)) {
    return res.json({ reply: 'Please provide your PNR number for cancellation.' });
  }
  if (/pnr/i.test(message)) {
    return res.json({ reply: 'PNR 1234567890 is confirmed. Coach: B2, Seat: 21.' });
  }
  if (/train|schedule|fare|availability/i.test(message)) {
    // You would call a real API here
    return res.json({ reply: 'I cannot fetch real-time data right now. Please check the official train enquiry system.' });
  }
  return res.json({ reply: 'Welcome to RailEase! How can I help you with your train journey today?' });
});

app.listen(8081, () => console.log('Chatbot server running on http://localhost:8081'));

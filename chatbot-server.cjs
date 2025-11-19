// Simple train booking chatbot backend (CommonJS, .cjs extension)
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());


// Mock database
const mockTrains = [
  { number: '12345', name: 'Rajdhani Express', from: 'Delhi', to: 'Mumbai', classes: ['AC', 'Sleeper'] }
];

// Supabase client for Node.js
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://tojbjsjpgkessgmgcuqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvamJqc2pwZ2tlc3NnbWdjdXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTQxODMsImV4cCI6MjA3NDUzMDE4M30.t1WW3eNK68xL3B5KaX28UQywaoR-5exkayB7eQ37Lzw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// NLP library for better intent/entity extraction
const nlp = require('compromise');






app.post('/api/chatbot', async (req, res) => {
  const { message, context = {} } = req.body;
  const lowerMsg = message.toLowerCase();
  const doc = nlp(message);
  const entities = {
    train: '',
    from: '',
    to: '',
    info: ''
  };

  // Extract train name/number
  const trainMatch = doc.match('#Noun+ Express|#Noun+ Mail|#Noun+ Superfast|#Noun+ Special|#Noun+ Passenger|#Noun+ SF|#Noun+ Exp|#Noun+').out('text');
  if (trainMatch) entities.train = trainMatch.trim();
  // Extract info intent
  if (/timing|time|schedule|when|departure|arrival/.test(lowerMsg)) entities.info = 'timing';
  else if (/fare|price|cost|ticket/.test(lowerMsg)) entities.info = 'fare';
  else if (/route|from|to|station|stops|path/.test(lowerMsg)) entities.info = 'route';
  else if (/class|ac|sleeper|coach/.test(lowerMsg)) entities.info = 'class';
  else if (/seat|availability|available/.test(lowerMsg)) entities.info = 'seats';

  // Extract from/to stations (simple)
  const fromMatch = doc.match('from #Noun+').out('text').replace('from ', '').trim();
  const toMatch = doc.match('to #Noun+').out('text').replace('to ', '').trim();
  if (fromMatch) entities.from = fromMatch;
  if (toMatch) entities.to = toMatch;

  // Friendly intent detection
  if (/book|reserve/.test(lowerMsg)) {
    if (!context.source || !context.destination) {
      return res.json({ reply: 'Sure! To book a ticket, please provide the source and destination stations.' });
    }
    if (!context.date) {
      return res.json({ reply: 'Great! What is your preferred date of travel?' });
    }
    return res.json({ reply: `Your ticket from ${context.source} to ${context.destination} is booked! Your PNR is 1234567890. Safe travels! 🚆` });
  }
  if (/cancel/.test(lowerMsg)) {
    return res.json({ reply: 'No problem! Please provide your PNR number to cancel your ticket.' });
  }
  if (/pnr/.test(lowerMsg)) {
    return res.json({ reply: 'Here is your PNR status: 1234567890 is confirmed. Coach: B2, Seat: 21. Anything else I can help with?' });
  }

  // Find train by name/number (mock or Supabase)
  let foundTrain = null;
  if (entities.train) {
    foundTrain = mockTrains.find(t => t.name.toLowerCase().includes(entities.train.toLowerCase()) || t.number === entities.train);
    if (!foundTrain) {
      try {
        const { data } = await supabase
          .from('trains')
          .select('*')
          .or(`name.ilike.%${entities.train}%,number.eq.${entities.train.replace(/\D/g, '')}`);
        if (data && data.length > 0) foundTrain = data[0];
      } catch (err) {
        return res.json({ reply: 'Sorry, I could not fetch train info right now.' });
      }
    }
  }

  // If a train is found, answer only the requested info, else ask for more info
  if (foundTrain) {
    // Timing
    if (entities.info === 'timing') {
      if (foundTrain.departure_time && foundTrain.arrival_time) {
        return res.json({ reply: `🕒 ${foundTrain.name} (${foundTrain.number}) departs at ${foundTrain.departure_time} and arrives at ${foundTrain.arrival_time}. Need fare or route info too?` });
      } else {
        return res.json({ reply: `Sorry, timing information is not available for this train. Want to know something else?` });
      }
    }
    // Fare
    if (entities.info === 'fare') {
      if (foundTrain.class_prices) {
        const fares = Object.entries(foundTrain.class_prices).map(([cls, price]) => `${cls}: ₹${price}`).join(', ');
        return res.json({ reply: `💸 The fare for ${foundTrain.name} (${foundTrain.number}) is: ${fares}. Need timings or want to book?` });
      } else if (foundTrain.price) {
        return res.json({ reply: `💸 The fare for ${foundTrain.name} (${foundTrain.number}) is ₹${foundTrain.price}. Want to know timings or route?` });
      } else {
        return res.json({ reply: `Sorry, fare information is not available for this train. Want to know something else?` });
      }
    }
    // Route
    if (entities.info === 'route') {
      let route = '';
      if (foundTrain.from && foundTrain.to) {
        route = `${foundTrain.from} to ${foundTrain.to}`;
      } else if (foundTrain.from_station_id && foundTrain.to_station_id) {
        route = `${foundTrain.from_station_id} to ${foundTrain.to_station_id}`;
      }
      return res.json({ reply: `🗺️ The route for ${foundTrain.name} (${foundTrain.number}) is: ${route}. Want timings or fare info?` });
    }
    // Classes
    if (entities.info === 'class') {
      if (foundTrain.classes) {
        return res.json({ reply: `🚃 Available classes for ${foundTrain.name} (${foundTrain.number}): ${foundTrain.classes.join(', ')}. Want fare or timing info?` });
      } else if (foundTrain.class_prices) {
        return res.json({ reply: `🚃 Available classes for ${foundTrain.name} (${foundTrain.number}): ${Object.keys(foundTrain.class_prices).join(', ')}. Want fare or timing info?` });
      } else {
        return res.json({ reply: `Sorry, class information is not available for this train. Want to know something else?` });
      }
    }
    // Seats
    if (entities.info === 'seats') {
      if (foundTrain.total_seats) {
        return res.json({ reply: `🪑 ${foundTrain.name} (${foundTrain.number}) has ${foundTrain.total_seats} seats. Want to book or know timings?` });
      } else {
        return res.json({ reply: `Sorry, seat information is not available for this train. Want to know something else?` });
      }
    }
    // If no specific info requested, give a friendly summary and suggest next steps
    return res.json({ reply: `🚆 ${foundTrain.name} (${foundTrain.number}) is available. You can ask for timings, fare, route, or book a ticket!` });
  }

  // If user gave from/to but not train, try to help
  if (entities.from && entities.to) {
    return res.json({ reply: `Looking for trains from ${entities.from} to ${entities.to}? Please provide the train name or number for more details, or ask to search trains for that route.` });
  }

  // Fallback for general train queries
  if (/train|schedule|fare|availability/.test(lowerMsg)) {
    const train = mockTrains[0];
    return res.json({
      reply: `Train: ${train.name} (${train.number})\nRoute: ${train.from} to ${train.to}\nClasses: ${train.classes.join(", ")}\nFare (mock): AC ₹2000, Sleeper ₹800\nSchedule: Departs 18:00, Arrives 08:00 next day.`
    });
  }

  // Default fallback
  return res.json({ reply: '👋 Welcome to RailEase! I can help you with train timings, fares, routes, booking, and more. Try asking about a train or route!' });
});

app.listen(8081, () => console.log('Chatbot server running on http://localhost:8081'));

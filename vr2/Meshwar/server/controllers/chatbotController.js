import OpenAI from 'openai';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

// Initialize Groq client using OpenAI-compatible API
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// ─── Build a rich inventory snapshot from real DB data ───────────────────────
const buildInventoryContext = (cars) => {
  if (!cars.length) return 'No cars are currently listed in the inventory.';

  const available = cars.filter(c => c.isAvaliable);
  const unavailable = cars.filter(c => !c.isAvaliable);

  // Stats
  const prices = cars.map(c => c.pricePerDay);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = (prices.reduce((s, p) => s + p, 0) / prices.length).toFixed(2);

  // Group helpers
  const groupBy = (arr, key) =>
    arr.reduce((acc, c) => { acc[c[key]] = (acc[c[key]] || 0) + 1; return acc; }, {});

  const byCategory = groupBy(cars, 'category');
  const byFuel = groupBy(cars, 'fuel_type');
  const byTransmission = groupBy(cars, 'transmission');

  // Category price ranges
  const categoryPrices = {};
  cars.forEach(c => {
    if (!categoryPrices[c.category]) categoryPrices[c.category] = [];
    categoryPrices[c.category].push(c.pricePerDay);
  });
  const categoryRanges = Object.entries(categoryPrices)
    .map(([cat, ps]) => `${cat}: ${Math.min(...ps)}EGP–${Math.max(...ps)}EGP/day`)
    .join(', ');

  // Full car list (concise per car)
  const carList = cars.map(c =>
    `  • ${c.brand} ${c.model} (${c.year}) | ${c.category} | ${c.fuel_type} | ${c.transmission} | ${c.seating_capacity} seats | ${c.pricePerDay}EGP/day | Location: ${c.location} | ${c.isAvaliable ? '✅ Available' : '❌ Not available'}`
  ).join('\n');

  return `
=== LIVE INVENTORY DATA (pulled from database right now) ===

SUMMARY:
- Total cars listed: ${cars.length}  (${available.length} available, ${unavailable.length} not available)
- Price range: ${minPrice}EGP – ${maxPrice}EGP per day
- Average price: ${avgPrice}EGP/day
- Categories and price ranges: ${categoryRanges}
- Fuel types: ${Object.entries(byFuel).map(([k, v]) => `${k} (${v})`).join(', ')}
- Transmissions: ${Object.entries(byTransmission).map(([k, v]) => `${k} (${v})`).join(', ')}
- Category breakdown: ${Object.entries(byCategory).map(([k, v]) => `${k} (${v})`).join(', ')}

FULL CAR LISTING:
${carList}
=== END INVENTORY ===
`;
};

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a knowledgeable and friendly car rental assistant for CarRental Pro.

IMPORTANT RULES:
1. Always answer using ONLY the real inventory data provided below — never invent prices or specs.
2. When asked about pricing, list actual cars with their exact prices from the data.
3. When asked about availability, only mention cars marked ✅ Available.
4. When asked about a specific brand/model/category, filter from the inventory and give exact details.
5. Format car listings cleanly! Do NOT use comma-separated run-on sentences for car details. Use structured bullet points for each car, like this:

**Brand Model (Year)**
* **Price:** X EGP/day
* **Specs:** Category | Fuel | Transmission | Seats
* **Location:** City
* **Status:** ✅ Available

6. Be concise, warm, and professional.
7. If something is not in the inventory data, say so honestly.
8. For booking questions, guide users: browse the Cars page → select a car → choose dates → confirm booking.

{INVENTORY}
`;

// ─── Main chat handler ────────────────────────────────────────────────────────
export const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch ALL cars fresh from DB every request (ensures live data)
    const cars = await Car.find({}).lean();

    // Build rich real-data context
    const inventoryContext = buildInventoryContext(cars);
    const systemPrompt = SYSTEM_PROMPT.replace('{INVENTORY}', inventoryContext);

    // Smart search: if user asks about something specific, find matching cars
    let extraContext = '';
    const lowerMsg = message.toLowerCase();

    // Detect intent keywords
    const isCarQuery = ['car', 'vehicle', 'rent', 'available', 'book', 'price', 'cost',
      'cheap', 'suv', 'sedan', 'luxury', 'economy', 'fuel', 'automatic', 'manual',
      'seat', 'brand', 'toyota', 'honda', 'bmw', 'mercedes', 'ford', 'hyundai',
      'electric', 'hybrid', 'diesel', 'petrol', 'location'].some(kw => lowerMsg.includes(kw));

    if (isCarQuery) {
      // Extract meaningful search terms
      const stopWords = new Set(['what', 'when', 'where', 'which', 'how', 'can',
        'does', 'have', 'this', 'that', 'with', 'from', 'your', 'show', 'tell',
        'about', 'much', 'many', 'list', 'give', 'are', 'the', 'and', 'for']);

      const searchTerms = lowerMsg
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

      if (searchTerms.length > 0) {
        const pattern = searchTerms.join('|');
        const matched = cars.filter(c =>
          new RegExp(pattern, 'i').test(
            `${c.brand} ${c.model} ${c.category} ${c.fuel_type} ${c.transmission} ${c.location} ${c.description}`
          )
        );

        if (matched.length > 0 && matched.length < cars.length) {
          extraContext = `\n\n[SEARCH MATCH for "${searchTerms.join(' ')}"]\n` +
            matched.map(c =>
              `• ${c.brand} ${c.model} (${c.year}) — ${c.category}, ${c.fuel_type}, ${c.transmission}, ${c.seating_capacity} seats, ${c.pricePerDay}EGP/day, ${c.location}, ${c.isAvaliable ? 'Available' : 'Not available'}\n  Description: ${c.description}`
            ).join('\n');
        }
      }
    }

    // Build message array for Groq
    const messages = [
      { role: 'system', content: systemPrompt + extraContext },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    // Call Groq API (OpenAI-compatible)
    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 700,
      temperature: 0.5,   // lower = more factual/accurate
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
};

// ─── Quick actions ────────────────────────────────────────────────────────────
export const getQuickActions = async (req, res) => {
  try {
    const quickActions = [
      { id: 'browse', label: 'Browse Cars', icon: '🚗', query: 'Show me all available cars with their prices' },
      { id: 'cheap', label: 'Cheapest Cars', icon: '💸', query: 'What are the cheapest cars available to rent?' },
      { id: 'categories', label: 'Categories', icon: '📋', query: 'What car categories do you offer and what are the prices?' },
      { id: 'support', label: 'How to Book', icon: '🎧', query: 'How do I book a car?' }
    ];
    res.json({ success: true, quickActions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load quick actions' });
  }
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const getFAQ = async (req, res) => {
  try {
    const faqs = [
      {
        question: 'How do I book a car?',
        answer: 'Browse our available cars, select your preferred vehicle, choose your rental dates, and complete the booking process with your details.'
      },
      {
        question: 'What documents do I need?',
        answer: "You'll need a valid driver's license, proof of identity, and a credit card for the security deposit."
      },
      {
        question: 'Can I cancel my booking?',
        answer: 'Yes, you can cancel your booking. Cancellation policies vary depending on the rental terms. Please check your booking details or contact support.'
      },
      {
        question: 'Is insurance included?',
        answer: 'Basic insurance is included with all rentals. Additional coverage options are available at an extra cost.'
      },
      {
        question: 'What is the mileage limit?',
        answer: 'Most rentals include unlimited mileage. Some specialty vehicles may have daily mileage limits. Check the car details for specific information.'
      }
    ];
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load FAQs' });
  }
};
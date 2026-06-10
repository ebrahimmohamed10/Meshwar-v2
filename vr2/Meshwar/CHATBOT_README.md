# CarRental AI Chatbot System

## Overview
A fully integrated AI-powered chatbot system for the CarRental application that provides real-time assistance to users for browsing cars, booking information, rental policies, and customer support.

## Features

### 🎯 Core Features
- **AI-Powered Responses**: Uses OpenAI's GPT-3.5 Turbo for intelligent, context-aware conversations
- **Real-time Car Inventory Integration**: Dynamically fetches and provides information about available cars
- **Quick Actions**: Pre-defined common queries for instant assistance
- **Conversation Memory**: Maintains context across multiple messages (last 10 messages)
- **Responsive UI**: Modern, animated chat widget that works on all screen sizes
- **Smart Search**: Automatically searches for relevant cars based on user queries

### 💡 Quick Actions
- 🚗 **Browse Cars**: View available vehicles
- 📋 **How to Book**: Step-by-step booking guidance
- 💰 **Pricing Information**: Rental costs and rates
- 🎧 **Customer Support**: Get help with issues

### 📋 FAQ System
Built-in frequently asked questions covering:
- Booking process
- Required documents
- Cancellation policies
- Insurance information
- Mileage limits

## Architecture

### Server-Side (Backend)
```
server/
├── controllers/
│   └── chatbotController.js    # Main chatbot logic and AI integration
├── routes/
│   └── chatbotRoutes.js        # API route definitions
└── .env                         # Environment variables (OpenAI API key)
```

**API Endpoints:**
- `POST /api/chatbot/chat` - Send message and get AI response
- `GET /api/chatbot/quick-actions` - Get quick action buttons
- `GET /api/chatbot/faq` - Get FAQ list

### Client-Side (Frontend)
```
client/src/
└── components/
    └── ChatBot.jsx              # Chat widget component
```

**Features:**
- Floating chat button with notification indicator
- Expandable chat window with smooth animations
- Real-time typing indicators
- Message history with timestamps
- Quick action buttons for common queries
- Reset conversation functionality

## Installation & Setup

### 1. Server Configuration

The OpenAI API key has been added to `server/.env`:
```env
OPENAI_API_KEY='ac75fd5089e14d719ec723fd7a78fe04.kNzCoQBg9TCBbg0I'
```

### 2. Dependencies

**Server dependencies** (already installed):
```bash
npm install openai
```

**Client dependencies** (already available):
- axios (for API calls)
- react (for component)

### 3. Environment Variables

No additional client-side environment variables needed. The chatbot automatically connects to the backend API.

## Usage

### Starting the Application

1. **Start the server:**
```bash
cd server
npm run server
```

2. **Start the client:**
```bash
cd client
npm run dev
```

### Using the Chatbot

1. **Open the chat widget**: Click the floating chat button (bottom-right corner)
2. **Choose a quick action** or type your question
3. **Get instant AI-powered responses**
4. **Continue the conversation** - the bot remembers context
5. **Reset** if needed using the refresh icon in the header

## Integration Points

### Database Models Used
- **Car Model**: For querying available cars and providing inventory information
- **Booking Model**: For booking-related queries (future enhancement)

### System Context
The chatbot receives real-time data about:
- Total available cars
- Popular car brands
- Average daily rental rates

This context enables more accurate and relevant responses.

## Customization

### Modifying the System Prompt

Edit `server/controllers/chatbotController.js`:
```javascript
const SYSTEM_PROMPT = `
You are a helpful car rental assistant...
// Add your custom instructions here
`;
```

### Adding Quick Actions

Modify the `getQuickActions` function in `chatbotController.js`:
```javascript
const quickActions = [
  { id: 'new', label: 'New Action', icon: '🎯', query: 'Your query here' }
];
```

### Adding FAQs

Update the `getFAQ` function in `chatbotController.js`:
```javascript
const faqs = [
  {
    question: 'Your question?',
    answer: 'Your answer'
  }
];
```

### Styling the Chat Widget

Modify `client/src/components/ChatBot.jsx` to:
- Change colors (gradient from blue-600 to purple-600)
- Adjust animations
- Update layout and spacing

## Security Notes

⚠️ **Important**: 
- The API key is stored server-side only (never exposed to client)
- All client-server communication goes through your backend API
- Consider implementing rate limiting for production use
- Add authentication if needed for booking-specific queries

## Troubleshooting

### Chat not responding?
1. Check server is running on correct port
2. Verify `VITE_BASE_URL` in client `.env`
3. Check browser console for errors

### API errors?
1. Verify OpenAI API key is correct in `server/.env`
2. Check server logs for detailed error messages
3. Ensure OpenAI account is active

### Styling issues?
1. Ensure Tailwind CSS is properly configured
2. Check for CSS conflicts with existing styles

## Future Enhancements

- [ ] Booking creation directly through chat
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Image car cards in chat
- [ ] Booking status checking
- [ ] Payment processing assistance
- [ ] Integration with email notifications
- [ ] Admin dashboard for chat analytics
- [ ] Chat history persistence
- [ ] User authentication integration

## Support

For issues or questions about the chatbot system, please refer to the main CarRental documentation or contact support.

---

**Version**: 1.0.0  
**Last Updated**: April 2026

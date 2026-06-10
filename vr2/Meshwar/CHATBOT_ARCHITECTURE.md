# CarRental Chatbot Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  ChatBot Component                        │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Floating Button (Bottom-Right)                    │  │   │
│  │  │  • Chat Icon                                       │  │   │
│  │  │  • Notification Badge                              │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Chat Window (When Opened)                         │  │   │
│  │  │  ┌──────────────────────────────────────────────┐  │  │   │
│  │  │  │  Header                                      │  │  │   │
│  │  │  │  • Title: "CarRental Assistant"              │  │  │   │
│  │  │  │  • Status: "Online"                          │  │  │   │
│  │  │  │  • Reset Button                              │  │  │   │
│  │  │  └──────────────────────────────────────────────┘  │  │   │
│  │  │  ┌──────────────────────────────────────────────┐  │  │   │
│  │  │  │  Messages Area                               │  │  │   │
│  │  │  │  • Welcome Screen                            │  │  │   │
│  │  │  │  • Quick Action Cards (2x2 Grid)             │  │  │   │
│  │  │  │  • Conversation Messages                     │  │  │   │
│  │  │  │  • Typing Indicator                          │  │  │   │
│  │  │  └──────────────────────────────────────────────┘  │  │   │
│  │  │  ┌──────────────────────────────────────────────┐  │  │   │
│  │  │  │  Input Area                                  │  │  │   │
│  │  │  │  • Text Input Field                          │  │  │   │
│  │  │  │  • Send Button                               │  │  │   │
│  │  │  └──────────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request (POST/GET)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND API                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express.js Server (server.js)                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Routes: chatbotRoutes.js                          │  │   │
│  │  │  • POST /api/chatbot/chat                          │  │   │
│  │  │  • GET  /api/chatbot/quick-actions                 │  │   │
│  │  │  • GET  /api/chatbot/faq                           │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Controller: chatbotController.js                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  1. chatWithBot()                                  │  │   │
│  │  │     • Extract message & history                    │  │   │
│  │  │     • Query Car database for context               │  │   │
│  │  │     • Build system prompt with real-time data      │  │   │
│  │  │     • Call OpenAI API                              │  │   │
│  │  │     • Return AI response                           │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  2. getQuickActions()                              │  │   │
│  │  │     • Return predefined quick action buttons       │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  3. getFAQ()                                       │  │   │
│  │  │     • Return FAQ list                              │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   MongoDB       │  │   OpenAI API     │  │  Environment    │
│   Database      │  │   (GPT-3.5)      │  │  Variables      │
│                 │  │                  │  │                 │
│ • Cars          │  │ • AI Responses   │  │ • OPENAI_KEY    │
│ • Bookings      │  │ • Context        │  │ • DB_URI        │
│ • Users         │  │ • Intelligence   │  │ • JWT_SECRET    │
└─────────────────┘  └──────────────────┘  └─────────────────┘
```

## Request Flow

### 1. User Sends Message
```
User Types → Click Send/Enter → POST /api/chatbot/chat
```

### 2. Server Processing
```
Controller receives message
    ↓
Query MongoDB for relevant cars
    ↓
Build context with real-time data
    ↓
Prepare conversation history (last 10 messages)
    ↓
Send to OpenAI API with system prompt
    ↓
Receive AI response
    ↓
Return to client
```

### 3. Client Receives Response
```
Response received
    ↓
Add to conversation array
    ↓
Display in chat window
    ↓
Auto-scroll to latest message
```

## Data Flow Example

### Scenario: User asks about SUV availability

**Client Request:**
```json
POST /api/chatbot/chat
{
  "message": "Do you have any SUVs available?",
  "conversationHistory": []
}
```

**Server Processing:**
1. Extract keywords: "SUV", "available"
2. Query MongoDB: `Car.find({ type: /SUV/i })`
3. Get car data:
   - Total cars: 15
   - Popular brands: Toyota, BMW, Mercedes
   - Average rate: $85/day
   - Found 3 SUVs

**Context Sent to OpenAI:**
```
System: You are a helpful car rental assistant...
Context: 
- Total cars: 15
- Popular brands: Toyota, BMW, Mercedes
- Average rate: $85/day
- Available SUVs:
  * Toyota RAV4 (SUV): $95/day
  * BMW X5 (SUV): $150/day
  * Mercedes GLE (SUV): $180/day

User: Do you have any SUVs available?
```

**AI Response:**
"Yes! We currently have 3 SUVs available:
- Toyota RAV4 at $95/day
- BMW X5 at $150/day  
- Mercedes GLE at $180/day

Would you like more details about any of these vehicles or would you like to make a booking?"

**Client Displays:**
Response shown in chat window with bot styling

## Security Layers

```
┌─────────────────────────────────────────────┐
│  Client-Side (Browser)                       │
│  • No API keys exposed                       │
│  • Only sends user messages                  │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Backend API (Express Server)                │
│  • Validates incoming requests               │
│  • Rate limiting (future)                    │
│  • API key stored in .env (server-only)      │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  External Services                           │
│  • OpenAI API (authenticated)                │
│  • MongoDB (authenticated)                   │
└─────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19**: Component framework
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **CSS Animations**: Smooth transitions

### Backend
- **Node.js**: Runtime
- **Express.js**: Web framework
- **OpenAI SDK**: AI integration
- **Mongoose**: MongoDB ODM

### AI/ML
- **OpenAI GPT-3.5-Turbo**: Language model
- **Context-aware prompting**: Dynamic system prompts

## File Structure

```
CarRental-fullstack/
├── server/
│   ├── .env                        ✏️ Added OPENAI_API_KEY
│   ├── server.js                   ✏️ Added chatbot route
│   ├── package.json                ✏️ Added openai dependency
│   ├── controllers/
│   │   └── chatbotController.js    ✨ NEW - Chatbot logic
│   └── routes/
│       └── chatbotRoutes.js        ✨ NEW - API routes
│
├── client/
│   ├── .env                        ℹ️  No changes needed
│   └── src/
│       ├── App.jsx                 ✏️ Added ChatBot component
│       └── components/
│           └── ChatBot.jsx         ✨ NEW - Chat widget
│
└── CHATBOT_README.md               ✨ NEW - Documentation
```

Legend:
- ✨ NEW = Newly created file
- ✏️ Modified = Existing file updated
- ℹ️  Info = No changes required

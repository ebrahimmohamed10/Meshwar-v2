# Chatbot System - Quick Setup & Test Guide

## ✅ Setup Checklist

### Prerequisites
- [ ] Node.js installed
- [ ] MongoDB connection string in server/.env
- [ ] OpenAI API key added to server/.env

### Step 1: Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### Step 2: Verify Configuration

**server/.env** should contain:
```env
OPENAI_API_KEY='ac75fd5089e14d719ec723fd7a78fe04.kNzCoQBg9TCBbg0I'
```

**client/.env** should contain:
```env
VITE_BASE_URL=http://localhost:3000
```

### Step 3: Start the Application

**Terminal 1 - Server:**
```bash
cd server
npm run server
```
Expected output: `Server running on port 3000`

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```
Expected output: Vite dev server URL (usually http://localhost:5173)

### Step 4: Test the Chatbot

1. Open browser to your Vite dev URL
2. Look for the **floating chat button** (bottom-right corner)
3. Click the button to open chat
4. Test the features:

---

## 🧪 Test Scenarios

### Test 1: Quick Actions
1. Open the chat widget
2. You should see 4 quick action cards:
   - 🚗 Browse Cars
   - 📋 How to Book
   - 💰 Pricing
   - 🎧 Support
3. Click "Browse Cars"
4. **Expected:** AI responds with information about available cars

### Test 2: Free-form Questions
Type these questions:
- "What cars do you have available?"
- "How do I book a car?"
- "What are your rental prices?"
- "Do you have any BMWs?"

**Expected:** Intelligent, context-aware responses

### Test 3: Conversation Memory
1. Ask: "What cars do you have?"
2. Then ask: "Tell me more about the first one"
3. **Expected:** Bot understands context from previous message

### Test 4: Reset Conversation
1. Have a conversation with multiple messages
2. Click the refresh icon in the header
3. **Expected:** Conversation clears, welcome screen returns

### Test 5: Typing Indicator
1. Send a message
2. **Expected:** Three-dot typing indicator appears while waiting
3. Response should appear when AI responds

---

## 🔍 API Endpoint Testing

### Test with Postman/cURL

#### 1. Test Chat Endpoint
```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Hello, what cars do you have?\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "AI response here...",
  "timestamp": "2026-04-15T..."
}
```

#### 2. Test Quick Actions Endpoint
```bash
curl http://localhost:3000/api/chatbot/quick-actions
```

**Expected Response:**
```json
{
  "success": true,
  "quickActions": [
    { "id": "browse", "label": "Browse Cars", "icon": "🚗", "query": "..." },
    ...
  ]
}
```

#### 3. Test FAQ Endpoint
```bash
curl http://localhost:3000/api/chatbot/faq
```

**Expected Response:**
```json
{
  "success": true,
  "faqs": [
    { "question": "...", "answer": "..." },
    ...
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: Chat button not visible
**Solution:** 
- Check browser console for errors
- Verify ChatBot component is imported in App.jsx
- Check if Tailwind CSS is working

### Issue: "Failed to process message" error
**Solutions:**
1. Check server is running
2. Verify VITE_BASE_URL in client/.env
3. Check server console for errors
4. Verify OpenAI API key is correct

### Issue: OpenAI API errors
**Solutions:**
1. Check API key in server/.env
2. Verify OpenAI account is active
3. Check API quota/limits
4. Review server console for detailed errors

### Issue: CORS errors
**Solution:**
- CORS is already enabled in server.js
- Check if cors package is installed
- Verify API URLs are correct

---

## 📊 Monitoring & Debugging

### Server-Side Logs
Watch the server terminal for:
```
Chatbot error: [error details]
```

### Client-Side Logs
Open browser DevTools (F12) → Console tab
Look for:
- `Chat error: [error details]`
- `Failed to load quick actions: [error details]`

### Network Tab
1. Open DevTools → Network tab
2. Filter by "chatbot"
3. Check requests to:
   - `/api/chatbot/chat`
   - `/api/chatbot/quick-actions`
   - `/api/chatbot/faq`

---

## ✨ Success Indicators

You'll know everything is working when:

✅ Chat button appears in bottom-right corner  
✅ Clicking button opens chat window  
✅ Welcome screen displays with quick actions  
✅ Clicking quick actions sends messages  
✅ AI responds with relevant information  
✅ Typing indicator shows during processing  
✅ Conversation history is maintained  
✅ Reset button clears conversation  

---

## 🎯 Sample Test Queries

Try these to test the AI's capabilities:

1. **General Inquiry:**
   - "Hello! What can you help me with?"
   - "What services do you offer?"

2. **Car Search:**
   - "Show me available cars"
   - "Do you have any luxury cars?"
   - "What SUVs do you have?"

3. **Booking Questions:**
   - "How do I book a car?"
   - "What documents do I need?"
   - "Can I cancel my booking?"

4. **Pricing:**
   - "What are your rental prices?"
   - "Is insurance included?"
   - "What is the mileage limit?"

5. **Support:**
   - "I need customer support"
   - "How can I contact support?"

---

## 📈 Performance Metrics

**Expected Response Times:**
- Quick Actions Load: < 500ms
- FAQ Load: < 500ms
- AI Chat Response: 1-3 seconds (depends on OpenAI)

**Resource Usage:**
- Each chat call: ~1 API request to OpenAI
- Conversation memory: Last 10 messages
- Database queries: 1-2 per chat message (for car context)

---

## 🚀 Next Steps After Testing

1. **Customize the System Prompt**
   - Edit `server/controllers/chatbotController.js`
   - Modify `SYSTEM_PROMPT` constant

2. **Add More Quick Actions**
   - Update `getQuickActions()` function

3. **Expand FAQ Database**
   - Add more entries to `getFAQ()` function

4. **Style the Chat Widget**
   - Modify `client/src/components/ChatBot.jsx`
   - Change colors, animations, layout

5. **Add New Features**
   - See CHATBOT_README.md for enhancement ideas

---

## 📞 Need Help?

If you encounter issues:
1. Check server console logs
2. Check browser console logs
3. Verify all environment variables
4. Review the CHATBOT_README.md
5. Check the CHATBOT_ARCHITECTURE.md for flow understanding

---

**Happy Chatting! 🎉**

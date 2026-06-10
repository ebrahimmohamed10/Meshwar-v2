import express from 'express';
import { chatWithBot, getQuickActions, getFAQ } from '../controllers/chatbotController.js';

const router = express.Router();

// Chatbot routes
router.post('/chat', chatWithBot);
router.get('/quick-actions', getQuickActions);
router.get('/faq', getFAQ);

export default router;

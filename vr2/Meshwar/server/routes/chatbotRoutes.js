import express from 'express';
import { chatWithBot, getQuickActions, getFAQ, getSmartRecommendations } from '../controllers/chatbotController.js';

const router = express.Router();

// Chatbot routes
router.post('/chat', chatWithBot);
router.get('/quick-actions', getQuickActions);
router.get('/faq', getFAQ);
router.post('/smart-recommendations', getSmartRecommendations);

export default router;

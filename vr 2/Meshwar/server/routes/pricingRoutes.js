import express from 'express';
import { calculatePrice } from '../controllers/pricingController.js';

const router = express.Router();

router.post('/calculate', calculatePrice);

export default router;

import { Router } from 'express';
import { getHealth } from './payment.controller.js';

const router = Router();

router.get('/health', getHealth);

export default router;

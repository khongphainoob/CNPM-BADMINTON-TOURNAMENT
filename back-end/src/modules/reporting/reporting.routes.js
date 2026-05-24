import { Router } from 'express';
import { getHealth } from './reporting.controller.js';

const router = Router();

router.get('/health', getHealth);

export default router;

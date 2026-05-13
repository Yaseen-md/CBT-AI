import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, getDashboardData);

export default router;

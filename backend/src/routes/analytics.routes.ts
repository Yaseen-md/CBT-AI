import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    getMoodTrends,
    getScreenerHistory,
    getSessionStats,
    getRecentActivity
} from '../controllers/analytics.controller.js';

const router = Router();

// All analytics routes require authentication
router.use(requireAuth);

router.get('/mood-trends', getMoodTrends);
router.get('/screener-history', getScreenerHistory);
router.get('/session-stats', getSessionStats);
router.get('/recent-activity', getRecentActivity);

export default router;

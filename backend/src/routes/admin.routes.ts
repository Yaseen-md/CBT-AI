import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getSystemStats, getSafetyEvents, resolveEvent, getUsers } from '../controllers/admin.controller.js';

const router = Router();

// All admin routes require both authentication and admin access
router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', getSystemStats);

router.get('/safety-events', getSafetyEvents);

router.put(
    '/safety-events/:id/resolve',
    [
        param('id').isUUID().withMessage('Valid event ID required'),
        body('notes').optional().isString()
    ],
    validate,
    resolveEvent
);

router.get('/users', getUsers);

export default router;

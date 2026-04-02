import { Router } from 'express';
import { body } from 'express-validator';
import { createConversation, listConversations, getConversation } from '../controllers/conversation.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(requireAuth); // All conversation routes are protected

router.post(
    '/',
    [body('title').optional().trim()],
    validate,
    createConversation
);

router.get('/', listConversations);
router.get('/:id', getConversation);

export default router;

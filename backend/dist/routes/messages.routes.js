import { Router } from 'express';
import { body, param } from 'express-validator';
import { sendMessage, getMessages } from '../controllers/message.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { messageLimiter } from '../middleware/security.middleware.js';
const router = Router();
router.use(requireAuth);
router.post('/', messageLimiter, [
    body('conversationId').notEmpty().withMessage('conversationId is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
], validate, sendMessage);
router.get('/:conversationId', [param('conversationId').notEmpty()], validate, getMessages);
export default router;
//# sourceMappingURL=messages.routes.js.map
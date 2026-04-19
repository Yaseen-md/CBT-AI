import { Router } from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createJournalEntry, listJournalEntries, getJournalEntry, updateJournalEntry, deleteJournalEntry, getRecentJournalEntries, getRecentDistortions, } from '../controllers/journal.controller.js';
const router = Router();
// All routes require authentication
router.use(requireAuth);
/**
 * GET /api/journal/recent
 * Get recent journal entries for dashboard
 */
router.get('/recent', getRecentJournalEntries);
/**
 * GET /api/journal/insights
 * Get recent cognitive distortion insights for dashboard
 */
router.get('/insights', getRecentDistortions);
/**
 * POST /api/journal
 * Create a new journal entry
 */
router.post('/', [
    body('full_text').optional().isString().trim(),
    body('short_summary').optional().isString().trim(),
    body('tags').optional().isArray(),
], validate, createJournalEntry);
/**
 * GET /api/journal
 * List user's journal entries
 */
router.get('/', [
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
    queryValidator('offset').optional().isInt({ min: 0 }),
], validate, listJournalEntries);
/**
 * GET /api/journal/:id
 * Get single journal entry
 */
router.get('/:id', [
    param('id').notEmpty().withMessage('Journal ID is required'),
], validate, getJournalEntry);
/**
 * PUT /api/journal/:id
 * Update journal entry
 */
router.put('/:id', [
    param('id').notEmpty().withMessage('Journal ID is required'),
    body('full_text').optional().isString().trim(),
    body('short_summary').optional().isString().trim(),
    body('tags').optional().isArray(),
], validate, updateJournalEntry);
/**
 * DELETE /api/journal/:id
 * Delete journal entry
 */
router.delete('/:id', [
    param('id').notEmpty().withMessage('Journal ID is required'),
], validate, deleteJournalEntry);
export default router;
//# sourceMappingURL=journal.routes.js.map
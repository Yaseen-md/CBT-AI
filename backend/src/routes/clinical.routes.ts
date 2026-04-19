import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
    submitThoughtRecord,
    listThoughtRecords,
    submitMoodCheckin,
    listMoodCheckins,
    submitPhq9,
    listPhq9Scores,
    submitGad7,
    listGad7Scores,
    submitSafetyPlan,
    listSafetyPlans
} from '../controllers/clinical.controller.js';

const router = Router();

// All clinical routes require authentication
router.use(requireAuth);

// Thought Records
router.post('/thought-records', submitThoughtRecord);
router.get('/thought-records', listThoughtRecords);

// Mood Check-ins
router.post('/mood-checkins', submitMoodCheckin);
router.get('/mood-checkins', listMoodCheckins);

// Assessments (PHQ-9)
router.post('/assessments/phq9', submitPhq9);
router.get('/assessments/phq9', listPhq9Scores);

// Assessments (GAD-7)
router.post('/assessments/gad7', submitGad7);
router.get('/assessments/gad7', listGad7Scores);

// Safety Plans
router.post('/safety-plans', submitSafetyPlan);
router.get('/safety-plans', listSafetyPlans);

export default router;

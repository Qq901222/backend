import express from 'express';
import { createSplit, getSplits, settleSplit } from '../controllers/splitController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createSplit);
router.get('/', authMiddleware, getSplits);
router.patch('/:id/settle', authMiddleware, settleSplit);

export default router;

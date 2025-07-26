import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import {
  getMonthlySummary,
  getCategoryRatio,
  getTrend
} from '../controllers/statsController';

const router = Router();

router.get('/monthly-summary', authMiddleware, getMonthlySummary);
router.get('/category-ratio', authMiddleware, getCategoryRatio);
router.get('/trend', authMiddleware, getTrend);

export default router;

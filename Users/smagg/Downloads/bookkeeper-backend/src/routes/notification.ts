import { Router } from 'express';
import { getNotifications, markNotificationRead, seedNotifications } from '../controllers/notificationController';
import authMiddleware from '../middlewares/authMiddleware';



const router = Router();

// 查詢通知
router.get('/', authMiddleware, getNotifications);

// 標記已讀
router.patch('/:id/read', authMiddleware, markNotificationRead);

router.post('/test-seed', authMiddleware, seedNotifications);

export default router;

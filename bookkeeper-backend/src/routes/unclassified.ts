import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import UnclassifiedNote from '../models/UnclassifiedNote';
import { getUnclassifiedRecords } from '../controllers/unclassifiedController';

const router = Router();

/**
 * GET /api/unclassified
 * 取得所有未分類紀錄
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await UnclassifiedNote.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: '查詢失敗', error: err });
  }
});


/**
 * GET /api/unclassified/records
 * 查詢 Record 中 category === '未分類' 的資料
 */
router.get('/records', authMiddleware, getUnclassifiedRecords);

export default router;

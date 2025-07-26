import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { getCategory } from '../utils/classifier';

const router = Router();

/**
 * POST /api/classifier
 * 傳入 note，自動分類
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ message: '請提供 note' });

    const { category, source } = await getCategory(note);
    res.json({ category, source });
  } catch (err) {
    res.status(500).json({ message: '分類失敗', error: err });
  }
});


export default router;

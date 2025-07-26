import express from 'express';
import {
  createRecord,
  getRecords,
  getPersonalRecords,
  updateRecord,
  deleteRecord,
} from '../controllers/recordController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// 所有 Record API 都需驗證登入
router.use(authMiddleware);

/**
 * @route POST /api/records
 * @desc 建立記帳紀錄（需為群組成員）
 */
router.post('/', createRecord);

/**
 * @route GET /api/records?group=xxx
 * @desc 取得所有紀錄（可依群組篩選）
 */
router.get('/', getRecords);

/**
 * @route GET /api/records/my
 * @desc 取得登入者個人所有紀錄（含非群組用的零用錢等）
 */
router.get('/my', getPersonalRecords);

/**
 * @route PATCH /api/records/:id
 * @desc 編輯自己的紀錄
 */
router.patch('/:id', updateRecord);

/**
 * @route DELETE /api/records/:id
 * @desc 刪除自己的紀錄
 */
router.delete('/:id', deleteRecord);

export default router;

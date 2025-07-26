import express from 'express';
import {
  createGroup,
  getGroups,
  updateGroupMembers,
  joinGroup,
  addGroupMember 
} from '../controllers/groupController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createGroup);                       // 建立群組
router.get('/', authMiddleware, getGroups);                          // 查看群組
router.patch('/:id', authMiddleware, updateGroupMembers);            // 批次更新整個成員清單
router.post('/:id/join', authMiddleware, joinGroup);                 // 使用者自行加入群組
router.patch('/:id/add-member', authMiddleware, addGroupMember);     // 管理員新增單一成員

export default router;

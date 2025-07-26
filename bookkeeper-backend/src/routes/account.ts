import express from 'express';
import {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
  repayCreditCard
} from '../controllers/accountController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAccounts);
router.post('/', createAccount);
router.patch('/:id', updateAccount);
router.delete('/:id', deleteAccount);

// 還款：信用卡額度歸零
router.patch('/:id/repay', repayCreditCard);

export default router as import('express').Router;


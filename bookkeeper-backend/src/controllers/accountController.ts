import { Request, Response } from 'express';
import Account from '../models/Account';

export const createAccount = async (req: Request, res: Response) => {
  const { name, type, balance, creditLimit } = req.body;
  const userId = req.body.userId || (req as any).user?.userId;

  const account = await Account.create({ name, type, balance, creditLimit, user: userId });
  res.status(201).json(account);
};

export const getAccounts = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const accounts = await Account.find({ user: userId });
  res.json(accounts);
};

export const updateAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const account = await Account.findByIdAndUpdate(id, updates, { new: true });
  res.json(account);
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Account.findByIdAndDelete(id);
  res.status(204).send();
};

// 還款 API：將信用卡額度歸零
export const repayCreditCard = async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = await Account.findById(id);
  if (!account || account.type !== 'credit_card') {
    return res.status(404).json({ error: '找不到信用卡帳戶' });
  }

  account.currentCreditUsed = 0;
  await account.save();

  res.json({ message: '信用卡已還款，額度已歸零' });
};
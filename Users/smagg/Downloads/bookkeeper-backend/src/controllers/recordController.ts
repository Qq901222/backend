/// <reference path="../types/express/index.d.ts" />
import { Request, Response } from 'express';
import Record from '../models/Record';
import Group from '../models/Group';
import mongoose from 'mongoose';
import Account from '../models/Account';

// 建立紀錄
export const createRecord = async (req: Request, res: Response) => {
  try {
    const { amount, note, category, date, account, group, paymentMethod } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: '未登入使用者' });
    }

    // 驗證 ObjectId 格式
    if (
      !mongoose.Types.ObjectId.isValid(account) ||
      !mongoose.Types.ObjectId.isValid(group)
    ) {
      return res.status(400).json({ message: '無效的帳戶或群組 ID' });
    }

    // 驗證付款方式（新增）
    if (!['cash', 'credit'].includes(paymentMethod)) {
      return res.status(400).json({ message: '無效的付款方式' });
    }

    // 檢查群組成員
    const groupDoc = await Group.findOne({
      _id: group,
      members: { $elemMatch: { user: userId } },
    });

    if (!groupDoc) {
      return res.status(403).json({ message: '你不是此群組成員，不能建立紀錄' });
    }

    // 取得帳戶資訊
    const accountDoc = await Account.findById(account);
    if (!accountDoc) {
      return res.status(404).json({ message: '找不到帳戶' });
    }

    // 根據帳戶型別做扣款驗證與更新
    if (accountDoc.type === 'credit_card') {
      if (paymentMethod !== 'credit') {
        return res.status(400).json({ message: '請使用信用卡付款方式' });
      }

      const remaining = (accountDoc.creditLimit ?? 0) - (accountDoc.currentCreditUsed ?? 0);
      if (amount > remaining) {
        return res.status(400).json({ message: '信用卡額度不足，請更換支付方式或減少金額。' });
      }

      accountDoc.currentCreditUsed = (accountDoc.currentCreditUsed ?? 0) + amount;
      await accountDoc.save();

      const warningThreshold = accountDoc.creditLimit * 0.1;
      if (remaining - amount < warningThreshold) {
        res.setHeader('X-Warning', '信用卡額度已低於 10%');
      }
    } else if (accountDoc.type === 'cash') {
      if (paymentMethod !== 'cash') {
        return res.status(400).json({ message: '請使用現金付款方式' });
      }

      if ((accountDoc.balance ?? 0) < amount) {
        return res.status(400).json({ message: '現金帳戶餘額不足，請更換支付方式或減少金額。' });
      }

      accountDoc.balance = (accountDoc.balance ?? 0) - amount;
      await accountDoc.save();
    } else {
      return res.status(400).json({ message: '不支援的帳戶型別' });
    }

    const record = await Record.create({
      amount,
      note,
      category,
      date,
      account,
      group,
      user: userId,
      paymentMethod, // 新增付款方式欄位
    });

    res.status(201).json(record);
  } catch (err) {
    console.error('建立紀錄錯誤:', err);
    res.status(500).json({ message: '建立紀錄失敗', error: err });
  }
};

// 取得紀錄清單（可選擇群組）
export const getRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { group } = req.query;

    if (!userId) {
      return res.status(401).json({ message: '未登入使用者' });
    }

    const filter: any = { user: userId };
    if (group) filter.group = group;

    const records = await Record.find(filter)
      .sort({ date: -1 })
      .populate('account', 'name')
      .populate('group', 'name');

    res.json(records);
  } catch (err) {
    console.error('查詢紀錄錯誤:', err);
    res.status(500).json({ message: '查詢紀錄失敗', error: err });
  }
};

// 取得登入者的所有紀錄（不限制群組）
export const getPersonalRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: '未登入使用者' });
    }

    const records = await Record.find({ user: userId })
      .sort({ date: -1 })
      .populate('account', 'name')
      .populate('group', 'name');

    res.json(records);
  } catch (err) {
    console.error('查詢個人紀錄錯誤:', err);
    res.status(500).json({ message: '查詢個人紀錄失敗', error: err });
  }
};

// 更新紀錄
export const updateRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.userId;

    const record = await Record.findById(id);
    if (!record) return res.status(404).json({ message: '找不到紀錄' });

    if (record.user.toString() !== userId) {
      return res.status(403).json({ message: '無權限修改此紀錄' });
    }

    const updated = await Record.findByIdAndUpdate(id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('更新紀錄錯誤:', err);
    res.status(500).json({ message: '更新紀錄失敗', error: err });
  }
};

// 刪除紀錄
export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const record = await Record.findById(id);
    if (!record) return res.status(404).json({ message: '找不到紀錄' });

    if (record.user.toString() !== userId) {
      return res.status(403).json({ message: '無權限刪除此紀錄' });
    }

    const accountDoc = await Account.findById(record.account);
    if (accountDoc?.type === 'credit_card') {
      accountDoc.currentCreditUsed = Math.max((accountDoc.currentCreditUsed ?? 0) - record.amount, 0);
      await accountDoc.save();
    } else if (accountDoc?.type === 'cash') {
      accountDoc.balance = (accountDoc.balance ?? 0) + record.amount;
      await accountDoc.save();
    }

    await record.deleteOne();
    res.status(204).send();
  } catch (err) {
    console.error('刪除紀錄錯誤:', err);
    res.status(500).json({ message: '刪除紀錄失敗', error: err });
  }
};

import { Request, Response } from 'express';
import Record from '../models/Record';

export const getUnclassifiedRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { group } = req.query;

    const filter: any = {
      user: userId,
      category: '未分類',
    };

    if (group) {
      filter.group = group;
    }

    const records = await Record.find(filter)
      .sort({ date: -1 })
      .populate('account', 'name')
      .populate('group', 'name');

    res.json(records);
  } catch (err) {
    console.error('❌ 無分類查詢失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};

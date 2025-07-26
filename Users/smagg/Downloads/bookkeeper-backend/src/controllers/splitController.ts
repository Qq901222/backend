import { Request, Response } from 'express';
import Split from '../models/Split';
import Notification from '../models/Notification'; // ✅ 新增

/**
 * 建立一筆分帳紀錄
 */
export const createSplit = async (req: Request, res: Response) => {
  try {
    const { group, amount, paidBy, participants, description, dueType } = req.body;

    const split = await Split.create({
      group,
      amount,
      paidBy,
      participants,
      description,
      dueType,
      status: 'unpaid',
    });

    res.status(201).json(split);
  } catch (err) {
    console.error('❌ 建立分帳失敗:', err);
    res.status(500).json({ message: '建立分帳失敗', error: err });
  }
};

/**
 * 查詢所有分帳紀錄（可依 group 篩選）
 */
export const getSplits = async (req: Request, res: Response) => {
  try {
    const { group } = req.query;
    const userId = req.user?.userId;

    const filter: any = {};
    if (group) filter.group = group;
    filter.$or = [
      { paidBy: userId },
      { participants: userId },
    ];

    const splits = await Split.find(filter)
      .sort({ createdAt: -1 })
      .populate('paidBy', 'email')
      .populate('participants', 'email')
      .populate('group', 'name');

    res.json(splits);
  } catch (err) {
    console.error('❌ 查詢分帳失敗:', err);
    res.status(500).json({ message: '查詢失敗', error: err });
  }
};

/**
 * 還款（標記為已還 + 觸發通知）
 */
export const settleSplit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const split = await Split.findByIdAndUpdate(
      id,
      { status: 'paid', settledAt: new Date() },
      { new: true }
    ).populate('paidBy', 'email'); // ✅ 取得付款者資訊

    if (!split) {
      return res.status(404).json({ message: '找不到分帳紀錄' });
    }

    // ✅ 觸發通知（通知付款者）
    if (split.paidBy && split.paidBy._id.toString() !== userId) {
      await Notification.create({
        user: split.paidBy._id,
        content: `使用者已完成還款 $${split.amount}（${split.description}）`,
        isRead: false,
      });
    }

    res.json(split);
  } catch (err) {
    console.error('❌ 更新分帳狀態失敗:', err);
    res.status(500).json({ message: '更新失敗', error: err });
  }
};

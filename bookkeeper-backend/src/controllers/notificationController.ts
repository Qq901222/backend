import { Request, Response } from 'express';
import Notification from '../models/Notification';

// GET /api/notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { unread } = req.query;

    if (!userId) {
      return res.status(401).json({ message: '未登入使用者' });
    }

    const filter: any = { user: userId };
    if (unread === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('查詢通知失敗:', err);
    res.status(500).json({ message: '查詢通知失敗', error: err });
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: '找不到通知' });
    }

    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: '無權限標記此通知' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: '已標記為已讀', notification });
  } catch (err) {
    console.error('標記通知失敗:', err);
    res.status(500).json({ message: '標記通知失敗', error: err });
  }
};
// 測試用：產生假通知
export const seedNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '未登入使用者' });

    const testNotices = [
      {
        user: userId,
        message: '你有一筆分帳待還款',
        type: 'split_due'
      },
      {
        user: userId,
        message: '你的帳戶已被加入共享',
        type: 'account_shared'
      },
      {
        user: userId,
        message: '系統維護將於明日凌晨進行',
        type: 'system'
      }
    ];

    await Notification.insertMany(testNotices);
    res.status(201).json({ message: '測試通知已建立' });
  } catch (err) {
    console.error('建立測試通知失敗:', err);
    res.status(500).json({ message: '建立失敗', error: err });
  }
};

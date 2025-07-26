import { Request, Response } from 'express';
import Record from '../models/Record';
import mongoose from 'mongoose';
import { CATEGORY_KEYWORDS } from '../utils/keyword';

export const getMonthlySummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonth] = await Record.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfThisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const [lastMonth] = await Record.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentMonthTotal = thisMonth?.total || 0;
    const lastMonthTotal = lastMonth?.total || 0;
    const difference = currentMonthTotal - lastMonthTotal;
    const percentChange =
      lastMonthTotal > 0
        ? parseFloat(((difference / lastMonthTotal) * 100).toFixed(2))
        : null;

    res.json({
      currentMonthTotal,
      lastMonthTotal,
      difference,
      percentChange
    });
  } catch (err) {
    res.status(500).json({ message: '統計失敗', error: err });
  }
};

export const getCategoryRatio = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const groupId = req.query.group as string | undefined;

    const match: any = {
      user: new mongoose.Types.ObjectId(userId)
    };
    if (groupId) {
      match.group = new mongoose.Types.ObjectId(groupId);
    }

    const result = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalAmount = result.reduce((sum, item) => sum + item.total, 0);

    const ratio = result.map((item) => {
      const category = item._id || '其他';
      const percent = totalAmount > 0 ? parseFloat(((item.total / totalAmount) * 100).toFixed(2)) : 0;
      return {
        category,
        total: item.total,
        percent
      };
    });

    res.json(ratio);
  } catch (err) {
    res.status(500).json({ message: '分類比例統計失敗', error: err });
  }
};

export const getTrend = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const trend = await Record.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lte: ['$_id.month', 9] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          total: 1
        }
      }
    ]);

    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: '趨勢統計失敗', error: err });
  }
};

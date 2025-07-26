import mongoose from 'mongoose';
import cron from 'node-cron';
import dotenv from 'dotenv';

import Split from '../src/models/Split';
import Group from '../src/models/Group';

dotenv.config();

// 資料庫連線設定
const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.error('MONGODB_URI 未設定');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('資料庫連線成功');
    startCronJob();
  })
  .catch((err) => {
    console.error('資料庫連線失敗:', err);
  });

/**
 * 啟動排程任務 + 測試立即執行
 */
function startCronJob() {
  // 每月 1 日 00:00 自動執行排程
  cron.schedule('0 0 1 * *', async () => {
    await handleMonthlyJob('排程');
  });

  // 測試階段：直接執行一次
  handleMonthlyJob('手動');
}

/**
 * 月結分帳產生器
 */
async function handleMonthlyJob(source: '排程' | '手動') {
  console.log(`開始執行月結分帳（${source}）：`, new Date().toISOString());

  try {
    const monthlySplits = await Split.find({ dueType: 'monthly' });

    if (monthlySplits.length === 0) {
      console.log('目前無需產生的月結分帳');
      return;
    }

    for (const template of monthlySplits) {
      const newSplit = await Split.create({
        group: template.group,
        amount: template.amount,
        paidBy: template.paidBy,
        participants: template.participants,
        description: template.description + '（月結）',
        dueType: 'monthly',
        settled: false,
      });

      console.log('建立新還款紀錄:', newSplit._id.toString());
    }

    console.log('月結分帳處理完畢');
  } catch (err) {
    console.error('月結處理錯誤:', err);
  }
}
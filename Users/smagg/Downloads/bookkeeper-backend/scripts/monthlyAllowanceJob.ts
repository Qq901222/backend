import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import Account from '../src/models/Account';
import Record from '../src/models/Record';

dotenv.config();

// 資料庫連線
const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.error('MONGODB_URI 未設定');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('資料庫連線成功');
    return runAllowanceJob();
  })
  .then(() => {
    console.log('零用錢發放完成');
    process.exit(0);
  })
  .catch(err => {
    console.error('發生錯誤：', err);
    process.exit(1);
  });

// 發放邏輯主程式
async function runAllowanceJob() {
  console.log('開始執行零用錢發放邏輯'); 

  const today = dayjs(); // 今日日期
  const currentDay = today.date(); // 幾號（1~31）

  const allAccounts = await Account.find({
    type: 'cash',
    allowanceDay: { $exists: true },
    allowanceAmount: { $gt: 0 }
  });

  console.log(`符合條件的帳戶筆數：${allAccounts.length}`); 

  for (const account of allAccounts) {
    const targetDay = account.allowanceDay ?? 1;

    // 判斷是否今天要發放（提前至月底）
    const daysInMonth = today.daysInMonth();
    const shouldDistribute =
      (targetDay === currentDay) ||
      (currentDay === daysInMonth && targetDay > daysInMonth);

    if (!shouldDistribute) continue;

    // 建立一筆收入紀錄
    await Record.create({
      amount: account.allowanceAmount,
      note: '每月零用錢發放',
      category: '收入',
      date: today.toDate(),
      account: account._id,
      group: null,
      user: account.user,
    });

    // 更新帳戶餘額
    account.balance += account.allowanceAmount;
    await account.save();

    console.log(`發放 ${account.allowanceAmount} 至帳戶 [${account.name}]`);
  }
}

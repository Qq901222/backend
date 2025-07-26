import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import Record from '../src/models/Record';
import User from '../src/models/User';
import Account from '../src/models/Account';
import Group from '../src/models/Group';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 未設定');
  process.exit(1);
}

function getRandomAmount() {
  return Math.floor(Math.random() * 3000) + 100;
}

function getRandomCategory() {
  const categories = ['餐飲', '交通', '娛樂', '日用品'];
  return categories[Math.floor(Math.random() * categories.length)];
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 資料庫連線成功');

    const user = await User.findOne();
    if (!user) {
      console.error('❌ 找不到使用者，請先註冊');
      process.exit(1);
    }
    console.log('👤 使用者 ID:', user._id);

    // 嘗試找使用者帳戶，若失敗則抓第一筆帳戶
    let account = await Account.findOne({ user: user._id });
    if (!account) {
      console.warn('⚠️ 找不到該使用者帳戶，改為使用第一筆帳戶（不建議）');
      account = await Account.findOne();
    }
    if (!account) {
      console.error('❌ 找不到帳戶');
      process.exit(1);
    }
    console.log('💰 帳戶 ID:', account._id, '| 擁有者:', account.user);

    // 嘗試找群組，使用者有加入的；失敗則抓第一個群組
    let group = await Group.findOne({ members: user._id });
    if (!group) {
      console.warn('⚠️ 找不到該使用者的群組，改為使用第一個群組（不建議）');
      group = await Group.findOne();
    }
    if (!group) {
      console.error('❌ 找不到群組');
      process.exit(1);
    }
    console.log('👥 群組 ID:', group._id, '| 成員:', group.members);

    // 清空 Record
    await Record.deleteMany({});
    console.log('🧹 Record 資料已清空');

    // 宣告要插入的紀錄陣列
    const recordsToInsert: any[] = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      const baseMonth = now.subtract(i, 'month');

      // 2 筆有分類
      for (let j = 0; j < 2; j++) {
        recordsToInsert.push({
          user: user._id,
          account: account._id,
          group: group._id,
          amount: getRandomAmount(),
          note: `這是 ${baseMonth.format('YYYY-MM')} 的測試紀錄 ${j + 1}`,
          category: getRandomCategory(),
          paymentMethod: Math.random() > 0.5 ? 'cash' : 'credit',
          date: baseMonth.date(10 + j * 5).toDate(),
        });
      }

      // 1 筆未分類
      recordsToInsert.push({
        user: user._id,
        account: account._id,
        group: group._id,
        amount: getRandomAmount(),
        note: '這筆花費沒想分類',
        category: '未分類',
        paymentMethod: 'cash',
        date: baseMonth.date(20).toDate(),
      });
    }

    await Record.insertMany(recordsToInsert);
    console.log(`✅ 已建立 ${recordsToInsert.length} 筆測試紀錄`);

    await mongoose.disconnect();
    console.log('📴 已斷開資料庫連線');
  } catch (err) {
    console.error('❌ 發生錯誤:', err);
    process.exit(1);
  }
}

seed();

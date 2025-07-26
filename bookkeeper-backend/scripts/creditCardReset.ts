// scripts/creditCardReset.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from '../src/models/Account';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || '';

mongoose.connect(MONGODB_URI).then(async () => {
  const result = await Account.updateMany(
    { type: 'credit_card' },
    { currentCreditUsed: 0 }
  );
  console.log(`所有信用卡帳戶額度已歸零，更新筆數：${result.modifiedCount}`);
  process.exit(0);
}).catch(err => {
  console.error('信用卡額度重置失敗:', err);
  process.exit(1);
});

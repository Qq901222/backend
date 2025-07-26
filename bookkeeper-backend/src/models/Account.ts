import { Schema, model, Types } from 'mongoose';

export enum AccountType {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BANK_ACCOUNT = 'bank_account',
}

const accountSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // ex: 台新 Richart、現金、玉山卡
    type: { type: String, enum: Object.values(AccountType), required: true },

    // 金額相關欄位
    balance: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 0 }, // 僅限信用卡使用
    currentCreditUsed: { type: Number, default: 0 }, // 信用卡已用額度

    // 每月零用錢功能欄位（允許使用者自訂日期與金額）
    allowanceDay: { type: Number, min: 1, max: 31 },      // 每月哪天發放（1～31）
    allowanceAmount: { type: Number, default: 0 },        // 每次發放多少錢
  },
  { timestamps: true }
);

export default model('Account', accountSchema);

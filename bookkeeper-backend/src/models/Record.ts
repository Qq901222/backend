// src/models/Record.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRecord extends Document {
  amount: number;
  note?: string;
  category?: string;
  date: Date;
  account: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  paymentMethod: 'cash' | 'credit';
  createdAt?: Date;
  updatedAt?: Date;
}

const RecordSchema: Schema = new Schema<IRecord>(
  {
    amount: { type: Number, required: true },
    note: { type: String },
    category: { type: String },
    date: { type: Date, required: true },
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit'],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRecord>('Record', RecordSchema);
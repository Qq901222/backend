import mongoose, { Schema, Document } from 'mongoose';

export interface ISplit extends Document {
  group: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  paidBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  status: 'unpaid' | 'paid';
  dueType: 'immediate' | 'monthly';
  settledAt?: Date;
  createdAt: Date;
}

const splitSchema = new Schema<ISplit>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    dueType: { type: String, enum: ['immediate', 'monthly'], default: 'immediate' },
    settledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ISplit>('Split', splitSchema);

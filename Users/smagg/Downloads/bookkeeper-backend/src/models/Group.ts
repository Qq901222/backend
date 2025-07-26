import { Schema, model, Types, Document } from 'mongoose';

// 👥 群組成員結構
interface GroupMember {
  user: Types.ObjectId;
  role: 'admin' | 'member';
}

// 📄 Group 文件型別
export interface GroupDocument extends Document {
  name: string;
  members: GroupMember[];
  sharedAccounts: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// 🧱 Group schema 定義
const groupSchema = new Schema<GroupDocument>({
  name: { type: String, required: true },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' }
  }],
  sharedAccounts: [{ type: Schema.Types.ObjectId, ref: 'Account' }]
}, {
  timestamps: true
});

// 📤 匯出 Group model
export default model<GroupDocument>('Group', groupSchema);



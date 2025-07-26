import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import unclassifiedRoutes from './routes/unclassified';
import authRoutes from './routes/auth';
import accountRoutes from './routes/account';
import recordRoutes from './routes/record';
import groupRoutes from './routes/group';
import splitRoutes from './routes/split';
import notificationRoutes from './routes/notification';
import classifierRoutes from './routes/classifier';
import statsRoutes from './routes/stats';
import cron from 'node-cron';
import { exec } from 'child_process';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // ✅ 要在所有路由前

// 掛載所有 API 路由
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/splits', splitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/classifier', classifierRoutes);
app.use('/api/unclassified', unclassifiedRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/unclassified', unclassifiedRoutes);
app.use('/api/splits', splitRoutes);

cron.schedule('0 0 1 * *', () => {
  exec('ts-node scripts/monthlySplitJob.ts', (err, stdout, stderr) => {
    if (err) console.error('月結排程錯誤:', err);
    else console.log('🕐 執行月結排程：', stdout);
  });
});

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

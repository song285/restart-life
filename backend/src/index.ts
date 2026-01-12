import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase } from './db/database';
import checkinRoutes from './routes/checkinRoutes';
import settingsRoutes from './routes/settingsRoutes';
import contactRoutes from './routes/contactRoutes';
import greetingRoutes from './routes/greetingRoutes';
import monitorRoutes from './routes/monitorRoutes';
import { checkInMonitor } from './services/checkInMonitor';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件 - CORS配置
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有origin的请求（如移动应用或Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的CORS来源'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化数据库
initDatabase();

// 启动定时检查任务
// 每小时检查一次用户打卡状态
cron.schedule('0 * * * *', async () => {
  console.log('⏰ 执行定时检查任务...');
  await checkInMonitor.checkAllUsers();
});

// 每天上午9点和晚上8点额外检查（提醒时间）
cron.schedule('0 9,20 * * *', async () => {
  console.log('⏰ 执行定时提醒检查...');
  await checkInMonitor.checkAllUsers();
});

// 启动时立即检查一次
setTimeout(() => {
  console.log('🔍 启动时执行初始检查...');
  checkInMonitor.checkAllUsers();
}, 5000); // 等待5秒确保数据库已初始化

// 路由
app.use('/api/checkin', checkinRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/greeting', greetingRoutes);
app.use('/api/monitor', monitorRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
});

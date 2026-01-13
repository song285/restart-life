import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase } from './db/database.js';
import checkinRoutes from './routes/checkinRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import greetingRoutes from './routes/greetingRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';
import { checkInMonitor } from './services/checkInMonitor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件 - CORS配置
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有origin的请求（如通过 Nginx 代理的请求、移动应用或Postman）
    if (!origin) return callback(null, true);
    
    // 允许配置的来源
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 生产环境：如果通过 Nginx 代理，允许所有来源（因为 Nginx 会处理 CORS）
      // 开发环境：严格检查
      if (process.env.NODE_ENV === 'production') {
        console.warn(`⚠️  未配置的 CORS 来源: ${origin}，但在生产环境中允许（通过 Nginx 代理）`);
        callback(null, true);
      } else {
        callback(new Error(`不允许的CORS来源: ${origin}`));
      }
    }
  },
  credentials: true
}));
// 配置 Express 信任代理（用于正确获取客户端IP）
app.set('trust proxy', true);

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

import { Router } from 'express';
import { checkinModel } from '../models/checkinModel.js';
import { identifyUser } from '../middleware/userMiddleware.js';

const router = Router();

// 所有路由都使用用户识别中间件
router.use(identifyUser);

// 创建打卡记录
router.post('/', (req, res) => {
  try {
    const userId = req.userId!;
    
    // 检查今天是否已打卡
    if (checkinModel.hasCheckedInToday(userId)) {
      return res.status(400).json({ 
        error: '今天已经打卡过了',
        alreadyCheckedIn: true 
      });
    }
    
    const checkin = checkinModel.create(userId);
    res.json(checkin);
  } catch (error: any) {
    console.error('打卡错误:', error);
    res.status(500).json({ error: error.message || '打卡失败' });
  }
});

// 获取打卡统计
router.get('/stats', (req, res) => {
  try {
    const userId = req.userId!;
    const stats = checkinModel.getStats(userId);
    res.json(stats);
  } catch (error: any) {
    console.error('获取统计错误:', error);
    res.status(500).json({ error: error.message || '获取统计失败' });
  }
});

// 获取最后一次打卡
router.get('/last', (req, res) => {
  try {
    const userId = req.userId!;
    const lastCheckIn = checkinModel.getLastCheckIn(userId);
    res.json({ lastCheckIn });
  } catch (error: any) {
    console.error('获取最后打卡错误:', error);
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

// 检查今天是否已打卡
router.get('/today', (req, res) => {
  try {
    const userId = req.userId!;
    const hasCheckedIn = checkinModel.hasCheckedInToday(userId);
    res.json({ hasCheckedIn });
  } catch (error: any) {
    console.error('检查打卡错误:', error);
    res.status(500).json({ error: error.message || '检查失败' });
  }
});

export default router;

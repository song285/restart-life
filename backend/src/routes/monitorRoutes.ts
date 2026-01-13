import { Router } from 'express';
import { checkInMonitor } from '../services/checkInMonitor.js';
import { identifyUser } from '../middleware/userMiddleware.js';

const router = Router();

// 手动触发检查（用于测试）
router.post('/check', identifyUser, async (req, res) => {
  try {
    const userId = req.userId!;
    await checkInMonitor.checkUserStatus(userId);
    res.json({ 
      success: true, 
      message: '检查完成',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('手动检查错误:', error);
    res.status(500).json({ error: error.message || '检查失败' });
  }
});

export default router;

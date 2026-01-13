import { Router } from 'express';
import { settingsModel } from '../models/settingsModel.js';
import { identifyUser } from '../middleware/userMiddleware.js';

const router = Router();

// 所有路由都使用用户识别中间件
router.use(identifyUser);

// 获取用户设置
router.get('/', (req, res) => {
  try {
    const userId = req.userId!;
    let settings = settingsModel.getByUserId(userId);
    
    // 如果设置不存在，自动创建默认设置
    if (!settings) {
      console.log(`⚠️  用户 ${userId} 没有设置，自动创建默认设置`);
      settings = settingsModel.update(userId, {
        email_notify: true,
        sms_notify: true,
        auto_alarm: false,
        email: ''
      });
    }
    
    res.json(settings);
  } catch (error: any) {
    console.error('获取设置错误:', error);
    res.status(500).json({ error: error.message || '获取设置失败' });
  }
});

// 更新用户设置
router.put('/', (req, res) => {
  try {
    const userId = req.userId!;
    const updates = {
      email_notify: req.body.email_notify,
      sms_notify: req.body.sms_notify,
      auto_alarm: req.body.auto_alarm,
      email: req.body.email,
      alarm_threshold_hours: req.body.alarm_threshold_hours
    };
    
    const settings = settingsModel.update(userId, updates);
    res.json(settings);
  } catch (error: any) {
    console.error('更新设置错误:', error);
    res.status(500).json({ error: error.message || '更新设置失败' });
  }
});

export default router;

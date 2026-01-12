import { Router } from 'express';
import { settingsModel } from '../models/settingsModel';

const router = Router();

// 获取用户设置
router.get('/', (req, res) => {
  try {
    const userId = req.query.userId as string || 'default-user';
    const settings = settingsModel.getByUserId(userId);
    if (!settings) {
      return res.status(404).json({ error: '设置不存在' });
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
    const userId = req.body.userId || 'default-user';
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

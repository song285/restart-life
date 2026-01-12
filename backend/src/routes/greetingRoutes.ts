import { Router } from 'express';
import { getDailyGreeting } from '../services/geminiService.js';

const router = Router();

// 获取每日问候
router.get('/', async (req, res) => {
  try {
    const greeting = await getDailyGreeting();
    res.json(greeting);
  } catch (error: any) {
    console.error('获取问候错误:', error);
    res.status(500).json({ 
      error: error.message || '获取问候失败',
      greeting: "早安，你今天也超赞",
      subtitle: "万物可爱，人间值得。"
    });
  }
});

export default router;

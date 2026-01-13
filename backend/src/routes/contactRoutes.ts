import { Router } from 'express';
import { contactModel } from '../models/contactModel.js';
import { identifyUser } from '../middleware/userMiddleware.js';

const router = Router();

// 所有路由都使用用户识别中间件
router.use(identifyUser);

// 获取所有联系人
router.get('/', (req, res) => {
  try {
    const userId = req.userId!;
    const contacts = contactModel.getByUserId(userId);
    res.json(contacts);
  } catch (error: any) {
    console.error('获取联系人错误:', error);
    res.status(500).json({ error: error.message || '获取联系人失败' });
  }
});

// 创建联系人
router.post('/', (req, res) => {
  try {
    const userId = req.userId!;
    
    // 检查是否超过限制
    if (!contactModel.canAddMore(userId)) {
      return res.status(400).json({ error: '最多只能添加5个紧急联系人' });
    }
    
    const { name, phone, type } = req.body;
    if (!name || !phone || !type) {
      return res.status(400).json({ error: '姓名、电话和类型都是必填项' });
    }
    
    if (type !== 'mobile' && type !== 'home') {
      return res.status(400).json({ error: '类型必须是 mobile 或 home' });
    }
    
    const contact = contactModel.create(userId, { name, phone, type });
    res.json(contact);
  } catch (error: any) {
    console.error('创建联系人错误:', error);
    res.status(500).json({ error: error.message || '创建联系人失败' });
  }
});

// 更新联系人
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates: any = {};
    
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.type !== undefined) {
      if (req.body.type !== 'mobile' && req.body.type !== 'home') {
        return res.status(400).json({ error: '类型必须是 mobile 或 home' });
      }
      updates.type = req.body.type;
    }
    
    const contact = contactModel.update(id, updates);
    res.json(contact);
  } catch (error: any) {
    console.error('更新联系人错误:', error);
    res.status(500).json({ error: error.message || '更新联系人失败' });
  }
});

// 删除联系人
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = contactModel.delete(id);
    if (!success) {
      return res.status(404).json({ error: '联系人不存在' });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('删除联系人错误:', error);
    res.status(500).json({ error: error.message || '删除联系人失败' });
  }
});

export default router;

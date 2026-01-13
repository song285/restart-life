import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/userModel.js';

// 扩展 Request 类型以包含 userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      deviceId?: string;
    }
  }
}

/**
 * 用户识别中间件
 * 优先级：
 * 1. 请求头中的 X-Device-Id（前端传递的设备ID）
 * 2. 请求参数中的 deviceId
 * 3. IP地址（作为备用）
 */
export function identifyUser(req: Request, res: Response, next: NextFunction) {
  try {
    // 方式1: 从请求头获取设备ID（推荐）
    // Express 会将请求头转换为小写，所以使用小写
    let deviceId = req.headers['x-device-id'] as string;
    
    // 调试日志（生产环境也输出关键信息）
    console.log('🔍 用户识别中间件:', {
      'x-device-id': req.headers['x-device-id'],
      'path': req.path,
      'ip': req.ip,
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip']
    });
    
    // 方式2: 从查询参数或请求体获取
    if (!deviceId) {
      deviceId = (req.query.deviceId as string) || req.body?.deviceId;
    }
    
    // 方式3: 使用IP地址作为备用方案
    if (!deviceId) {
      // 获取真实IP（考虑代理）
      const ip = req.headers['x-forwarded-for'] 
        ? (req.headers['x-forwarded-for'] as string).split(',')[0].trim()
        : req.headers['x-real-ip'] as string || req.ip || req.socket.remoteAddress || 'unknown';
      
      // 使用IP创建用户ID
      deviceId = `ip-${ip.replace(/\./g, '-').replace(/:/g, '-')}`;
    }

    // 确保设备ID存在
    if (!deviceId) {
      deviceId = 'unknown-device';
    }

    // 获取或创建用户
    const user = userModel.getOrCreateByDeviceId(deviceId);
    
    // 将用户ID和设备ID附加到请求对象
    req.userId = user.id;
    req.deviceId = deviceId;
    
    // 调试日志（生产环境也输出）
    console.log(`✅ 用户识别成功: deviceId=${deviceId}, userId=${user.id}, path=${req.path}`);
    
    next();
  } catch (error) {
    console.error('用户识别中间件错误:', error);
    // 出错时使用默认用户
    req.userId = 'default-user';
    req.deviceId = 'default-device';
    next();
  }
}

/**
 * 可选的用户识别中间件（不强制要求用户存在）
 */
export function optionalIdentifyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const deviceId = req.headers['x-device-id'] as string 
      || req.query.deviceId as string 
      || req.body?.deviceId;
    
    if (deviceId) {
      const user = userModel.getOrCreateByDeviceId(deviceId);
      req.userId = user.id;
      req.deviceId = deviceId;
    } else {
      // 如果没有设备ID，使用IP
      const ip = req.headers['x-forwarded-for'] 
        ? (req.headers['x-forwarded-for'] as string).split(',')[0].trim()
        : req.headers['x-real-ip'] as string || req.ip || 'unknown';
      const user = userModel.getOrCreateByIp(ip);
      req.userId = user.id;
      req.deviceId = `ip-${ip.replace(/\./g, '-')}`;
    }
    
    next();
  } catch (error) {
    console.error('可选用户识别中间件错误:', error);
    req.userId = 'default-user';
    next();
  }
}

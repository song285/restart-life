import { db } from '../db/database.js';
import { User } from '../types.js';

export const userModel = {
  // 根据ID获取用户
  getById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | null;
  },

  // 根据设备ID获取或创建用户
  getOrCreateByDeviceId(deviceId: string): User {
    // 先尝试查找
    let user = this.getById(deviceId);
    
    if (!user) {
      // 用户不存在，创建新用户
      const stmt = db.prepare("INSERT INTO users (id, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))");
      stmt.run(deviceId);
      user = this.getById(deviceId)!;
      console.log(`✅ 创建新用户: ${deviceId}`);
      
      // 为新用户创建默认设置
      try {
        const settingsStmt = db.prepare(`
          INSERT INTO user_settings (id, user_id, email_notify, sms_notify, auto_alarm, email, created_at, updated_at)
          VALUES (?, ?, 1, 1, 0, NULL, datetime('now'), datetime('now'))
        `);
        const settingsId = `settings-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        settingsStmt.run(settingsId, deviceId);
        console.log(`✅ 为新用户创建默认设置: ${deviceId}`);
      } catch (error: any) {
        // 如果设置已存在，忽略错误
        if (!error.message?.includes('UNIQUE constraint')) {
          console.error(`创建默认设置失败: ${error.message}`);
        }
      }
    }
    
    return user;
  },

  // 根据IP地址获取或创建用户（备用方案）
  getOrCreateByIp(ip: string): User {
    // 使用IP作为用户ID（格式：ip-xxx.xxx.xxx.xxx）
    const userId = `ip-${ip.replace(/\./g, '-')}`;
    return this.getOrCreateByDeviceId(userId);
  },

  // 更新用户信息
  update(id: string, updates: Partial<Pick<User, 'email'>>): User {
    const updatesList: string[] = [];
    const values: any[] = [];

    if (updates.email !== undefined) {
      updatesList.push('email = ?');
      values.push(updates.email);
    }

    if (updatesList.length > 0) {
      updatesList.push("updated_at = datetime('now')");
      values.push(id);
      
      const stmt = db.prepare(`
        UPDATE users 
        SET ${updatesList.join(', ')}
        WHERE id = ?
      `);
      stmt.run(...values);
    }

    return this.getById(id)!;
  },

  // 获取所有用户（管理员功能）
  getAll(): User[] {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as User[];
  },

  // 删除用户（级联删除相关数据）
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

import { db } from '../db/database.js';
import { UserSettings } from '../types.js';

export const settingsModel = {
  // 获取用户设置
  getByUserId(userId: string): UserSettings | null {
    const stmt = db.prepare('SELECT * FROM user_settings WHERE user_id = ?');
    const result = stmt.get(userId) as any;
    if (!result) return null;
    
    return {
      ...result,
      email_notify: Boolean(result.email_notify),
      sms_notify: Boolean(result.sms_notify),
      auto_alarm: Boolean(result.auto_alarm)
    };
  },

  // 更新用户设置
  update(userId: string, settings: Partial<UserSettings>): UserSettings {
    const existing = this.getByUserId(userId);
    if (!existing) {
      // 创建新设置
      const id = `settings-${Date.now()}`;
      const stmt = db.prepare(`
        INSERT INTO user_settings (id, user_id, email_notify, sms_notify, auto_alarm, email, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      stmt.run(
        id,
        userId,
        settings.email_notify !== undefined ? (settings.email_notify ? 1 : 0) : 1,
        settings.sms_notify !== undefined ? (settings.sms_notify ? 1 : 0) : 1,
        settings.auto_alarm !== undefined ? (settings.auto_alarm ? 1 : 0) : 0,
        settings.email || null
      );
      return this.getByUserId(userId)!;
    }

    // 更新现有设置
    const updates: string[] = [];
    const values: any[] = [];

    if (settings.email_notify !== undefined) {
      updates.push('email_notify = ?');
      values.push(settings.email_notify ? 1 : 0);
    }
    if (settings.sms_notify !== undefined) {
      updates.push('sms_notify = ?');
      values.push(settings.sms_notify ? 1 : 0);
    }
    if (settings.auto_alarm !== undefined) {
      updates.push('auto_alarm = ?');
      values.push(settings.auto_alarm ? 1 : 0);
    }
    if (settings.email !== undefined) {
      updates.push('email = ?');
      values.push(settings.email || null);
    }
    if (settings.alarm_threshold_hours !== undefined) {
      updates.push('alarm_threshold_hours = ?');
      values.push(settings.alarm_threshold_hours);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(userId);
      
      const stmt = db.prepare(`
        UPDATE user_settings 
        SET ${updates.join(', ')}
        WHERE user_id = ?
      `);
      stmt.run(...values);
    }

    return this.getByUserId(userId)!;
  }
};

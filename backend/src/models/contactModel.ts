import { db } from '../db/database';
import { EmergencyContact } from '../types';

const DEFAULT_USER_ID = 'default-user';

export const contactModel = {
  // 获取用户的所有联系人
  getByUserId(userId: string = DEFAULT_USER_ID): EmergencyContact[] {
    const stmt = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as EmergencyContact[];
  },

  // 根据ID获取联系人
  getById(id: string): EmergencyContact | null {
    const stmt = db.prepare('SELECT * FROM emergency_contacts WHERE id = ?');
    return stmt.get(id) as EmergencyContact | null;
  },

  // 创建联系人
  create(userId: string, contact: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): EmergencyContact {
    const id = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stmt = db.prepare(`
      INSERT INTO emergency_contacts (id, user_id, name, phone, type, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, userId, contact.name, contact.phone, contact.type);
    return this.getById(id)!;
  },

  // 更新联系人
  update(id: string, contact: Partial<Pick<EmergencyContact, 'name' | 'phone' | 'type'>>): EmergencyContact {
    const updates: string[] = [];
    const values: any[] = [];

    if (contact.name !== undefined) {
      updates.push('name = ?');
      values.push(contact.name);
    }
    if (contact.phone !== undefined) {
      updates.push('phone = ?');
      values.push(contact.phone);
    }
    if (contact.type !== undefined) {
      updates.push('type = ?');
      values.push(contact.type);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);
      
      const stmt = db.prepare(`
        UPDATE emergency_contacts 
        SET ${updates.join(', ')}
        WHERE id = ?
      `);
      stmt.run(...values);
    }

    return this.getById(id)!;
  },

  // 删除联系人
  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM emergency_contacts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // 检查联系人数量限制（最多5个）
  canAddMore(userId: string = DEFAULT_USER_ID): boolean {
    const count = this.getByUserId(userId).length;
    return count < 5;
  }
};

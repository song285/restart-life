import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/database.db');

// 确保数据目录存在
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表
export function initDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 打卡记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      checkin_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
    CREATE INDEX IF NOT EXISTS idx_checkins_checkin_time ON checkins(checkin_time);
  `);

  // 用户设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      email_notify INTEGER DEFAULT 1,
      sms_notify INTEGER DEFAULT 1,
      auto_alarm INTEGER DEFAULT 0,
      alarm_threshold_hours INTEGER DEFAULT 12,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 紧急联系人表
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('mobile', 'home')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 创建默认用户（如果不存在）
  const defaultUserId = 'default-user';
  const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(defaultUserId);
  if (!userExists) {
    db.prepare('INSERT INTO users (id) VALUES (?)').run(defaultUserId);
    db.prepare(`
      INSERT INTO user_settings (id, user_id, email_notify, sms_notify, auto_alarm, email)
      VALUES (?, ?, 1, 1, 0, ?)
    `).run('default-settings', defaultUserId, 'user@example.com');
  }

  console.log('数据库初始化完成');
}

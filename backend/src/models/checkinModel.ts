import { db } from '../db/database.js';
import { CheckIn, CheckInStats } from '../types.js';

export const checkinModel = {
  // 创建打卡记录
  create(userId: string): CheckIn {
    const id = `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const stmt = db.prepare(`
      INSERT INTO checkins (id, user_id, checkin_time)
      VALUES (?, ?, datetime('now'))
    `);
    stmt.run(id, userId);
    return this.getById(id)!;
  },

  // 根据ID获取打卡记录
  getById(id: string): CheckIn | null {
    const stmt = db.prepare('SELECT * FROM checkins WHERE id = ?');
    return stmt.get(id) as CheckIn | null;
  },

  // 获取用户的所有打卡记录
  getByUserId(userId: string, limit?: number): CheckIn[] {
    let query = 'SELECT * FROM checkins WHERE user_id = ? ORDER BY checkin_time DESC';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    const stmt = db.prepare(query);
    return stmt.all(userId) as CheckIn[];
  },

  // 获取用户最后一次打卡
  getLastCheckIn(userId: string): CheckIn | null {
    const stmt = db.prepare(`
      SELECT * FROM checkins 
      WHERE user_id = ? 
      ORDER BY checkin_time DESC 
      LIMIT 1
    `);
    return stmt.get(userId) as CheckIn | null;
  },

  // 获取统计信息
  getStats(userId: string): CheckInStats {
    // 获取本周的打卡数据
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekDataStmt = db.prepare(`
      SELECT 
        strftime('%w', checkin_time) as day_of_week,
        COUNT(*) as count
      FROM checkins
      WHERE user_id = ? 
        AND date(checkin_time) >= date(?)
      GROUP BY day_of_week
    `);
    
    const weekData = weekDataStmt.all(userId, weekStart.toISOString()) as Array<{ day_of_week: string; count: number }>;
    
    // 转换为前端需要的格式
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weeklyData = dayNames.map((name, index) => {
      const dayData = weekData.find(d => d.day_of_week === index.toString());
      return {
        name,
        count: dayData ? dayData.count : 0
      };
    });

    // 计算本周总计
    const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.count, 0);

    // 计算连续打卡天数
    const allCheckins = this.getByUserId(userId);
    let consecutiveDays = 0;
    if (allCheckins.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 获取所有唯一的打卡日期（按日期去重）
      const uniqueDates = new Set<string>();
      allCheckins.forEach(checkin => {
        const checkinDate = new Date(checkin.checkin_time);
        checkinDate.setHours(0, 0, 0, 0);
        uniqueDates.add(checkinDate.toISOString().split('T')[0]);
      });
      
      // 按日期排序（从新到旧）
      const sortedDates = Array.from(uniqueDates).sort().reverse();
      
      // 计算连续天数
      let expectedDate = new Date(today);
      for (const dateStr of sortedDates) {
        const checkDate = new Date(dateStr);
        checkDate.setHours(0, 0, 0, 0);
        
        if (checkDate.getTime() === expectedDate.getTime()) {
          consecutiveDays++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          // 如果日期不连续，停止计算
          break;
        }
      }
    }

    // 获取最后一次打卡
    const lastCheckIn = this.getLastCheckIn(userId);
    
    // 计算下次预计时间（默认晚上8点）
    const nextExpected = new Date();
    nextExpected.setHours(20, 0, 0, 0);
    if (nextExpected < new Date()) {
      nextExpected.setDate(nextExpected.getDate() + 1);
    }

    return {
      weeklyTotal,
      weeklyData,
      consecutiveDays,
      lastCheckIn: lastCheckIn?.checkin_time || null,
      nextExpected: nextExpected.toISOString()
    };
  },

  // 检查今天是否已打卡
  hasCheckedInToday(userId: string): boolean {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM checkins
      WHERE user_id = ? 
        AND date(checkin_time) = date('now')
    `);
    const result = stmt.get(userId) as { count: number };
    return result.count > 0;
  }
};

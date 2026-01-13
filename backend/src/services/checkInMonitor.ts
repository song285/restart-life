import { checkinModel } from '../models/checkinModel.js';
import { settingsModel } from '../models/settingsModel.js';
import { contactModel } from '../models/contactModel.js';
import { userModel } from '../models/userModel.js';
import { emailService } from './emailService.js';
import { smsService } from './smsService.js';

// 记录已发送的提醒，避免重复发送
const sentReminders = new Map<string, {
  emailReminder: Date | null;
  smsAlert: Date | null;
}>();

export const checkInMonitor = {
  // 检查用户打卡状态并发送相应提醒
  async checkUserStatus(userId: string): Promise<void> {
    try {
      // 获取用户设置
      const settings = settingsModel.getByUserId(userId);
      if (!settings) {
        console.log(`用户 ${userId} 没有设置，跳过检查`);
        return;
      }

      // 获取最后一次打卡
      const lastCheckIn = checkinModel.getLastCheckIn(userId);
      
      if (!lastCheckIn) {
        // 从未打卡过，检查是否应该发送提醒
        console.log(`用户 ${userId} 从未打卡`);
        // 这里可以根据需求决定是否发送提醒
        return;
      }

      const lastCheckInDate = new Date(lastCheckIn.checkin_time);
      const now = new Date();
      
      // 计算未打卡天数（以天为单位，不考虑具体时间）
      const daysSinceLastCheckIn = Math.floor(
        (now.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 检查今天是否已打卡
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCheckInDay = new Date(lastCheckInDate);
      lastCheckInDay.setHours(0, 0, 0, 0);
      
      const hasCheckedInToday = today.getTime() === lastCheckInDay.getTime();
      const daysMissed = hasCheckedInToday ? 0 : daysSinceLastCheckIn;

      console.log(`用户 ${userId} 状态检查: 最后打卡 ${lastCheckInDate.toISOString()}, 未打卡天数: ${daysMissed}`);

      // 情况1: 今天没有打卡，发送邮件提醒
      if (daysMissed >= 1 && settings.email_notify && settings.email) {
        const reminderKey = `${userId}-email-${today.toDateString()}`;
        const lastSent = sentReminders.get(reminderKey);
        
        // 每天只发送一次邮件提醒
        if (!lastSent || !lastSent.emailReminder || 
            new Date(lastSent.emailReminder).toDateString() !== today.toDateString()) {
          console.log(`发送邮件提醒给用户 ${userId}`);
          const success = await emailService.sendCheckInReminder(settings.email, daysMissed);
          if (success) {
            if (!sentReminders.has(reminderKey)) {
              sentReminders.set(reminderKey, { emailReminder: null, smsAlert: null });
            }
            sentReminders.get(reminderKey)!.emailReminder = new Date();
          }
        }
      }

      // 情况2: 超过3天未打卡且开启了自动报警，发送短信给紧急联系人
      if (daysMissed >= 3 && settings.auto_alarm) {
        const alertKey = `${userId}-sms-${daysMissed}`;
        const lastSent = sentReminders.get(alertKey);
        
        // 每个未打卡天数只发送一次短信（避免重复发送）
        if (!lastSent || !lastSent.smsAlert || 
            Math.floor((now.getTime() - new Date(lastSent.smsAlert).getTime()) / (1000 * 60 * 60 * 24)) >= 1) {
          
          // 获取所有紧急联系人
          const contacts = contactModel.getByUserId(userId);
          
          if (contacts.length > 0) {
            console.log(`用户 ${userId} 已${daysMissed}天未打卡，发送紧急报警短信给 ${contacts.length} 个联系人`);
            
            // 获取用户名（可以从users表获取，这里简化处理）
            const userName = '用户'; // 可以后续从数据库获取
            
            // 给所有联系人发送短信
            const smsPromises = contacts.map(async (contact) => {
              if (smsService.isValidPhoneNumber(contact.phone)) {
                const formattedPhone = smsService.formatPhoneNumber(contact.phone);
                return await smsService.sendEmergencySMS(formattedPhone, userName, daysMissed);
              } else {
                console.warn(`联系人 ${contact.name} 的电话号码格式无效: ${contact.phone}`);
                return false;
              }
            });

            const results = await Promise.all(smsPromises);
            const successCount = results.filter(r => r).length;
            
            if (successCount > 0) {
              if (!sentReminders.has(alertKey)) {
                sentReminders.set(alertKey, { emailReminder: null, smsAlert: null });
              }
              sentReminders.get(alertKey)!.smsAlert = new Date();
              console.log(`成功发送 ${successCount}/${contacts.length} 条紧急报警短信`);
            }

            // 同时给联系人发送邮件（如果有邮箱）
            // 这里可以扩展功能，从联系人信息中获取邮箱
          } else {
            console.log(`用户 ${userId} 没有设置紧急联系人，无法发送紧急报警`);
          }
        }
      }

      // 清理过期的提醒记录（保留最近7天的记录）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      for (const [key, value] of sentReminders.entries()) {
        if (value.emailReminder && value.emailReminder < sevenDaysAgo &&
            value.smsAlert && value.smsAlert < sevenDaysAgo) {
          sentReminders.delete(key);
        }
      }

    } catch (error) {
      console.error(`检查用户 ${userId} 状态时出错:`, error);
    }
  },

  // 检查所有用户的状态
  async checkAllUsers(): Promise<void> {
    try {
      // 获取所有用户
      const users = userModel.getAll();
      console.log(`🔍 开始检查 ${users.length} 个用户的打卡状态...`);
      
      // 并行检查所有用户
      const checkPromises = users.map(user => 
        this.checkUserStatus(user.id).catch(error => {
          console.error(`检查用户 ${user.id} 时出错:`, error);
        })
      );
      
      await Promise.all(checkPromises);
      console.log(`✅ 完成检查 ${users.length} 个用户`);
    } catch (error) {
      console.error('检查所有用户状态时出错:', error);
    }
  }
};

// 短信发送服务
// 支持Twilio和模拟模式

import twilio from 'twilio';

let twilioClient: any = null;

// 初始化Twilio客户端（如果配置了）
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio SMS服务已初始化');
  } catch (error) {
    console.warn('Twilio初始化失败，将使用模拟模式:', error);
  }
}

export const smsService = {
  // 发送紧急报警短信
  async sendEmergencySMS(phone: string, userName: string, daysMissed: number): Promise<boolean> {
    try {
      const message = `【重启人生紧急报警】${userName}已连续${daysMissed}天未打卡，请尽快联系确认安全状况。`;

      // 如果配置了Twilio，使用真实短信服务
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        const result = await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        console.log('短信发送成功:', result.sid);
        return true;
      }

      // 否则使用模拟模式（仅用于开发）
      console.log('📱 [模拟短信] 发送到:', phone);
      console.log('📱 [模拟短信] 内容:', message);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('开发环境：短信发送模拟成功');
        return true;
      }

      // 生产环境如果没有配置Twilio，返回false
      console.warn('警告：未配置Twilio，无法发送真实短信');
      return false;
    } catch (error) {
      console.error('发送短信失败:', error);
      return false;
    }
  },

  // 格式化手机号码（移除空格和特殊字符）
  formatPhoneNumber(phone: string): string {
    return phone.replace(/[\s\-\(\)]/g, '');
  },

  // 验证手机号码格式
  isValidPhoneNumber(phone: string): boolean {
    const cleaned = this.formatPhoneNumber(phone);
    // 简单验证：至少10位数字
    return /^\d{10,}$/.test(cleaned);
  }
};

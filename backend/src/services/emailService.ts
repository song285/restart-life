import nodemailer from 'nodemailer';

// 创建邮件传输器
const createTransporter = () => {
  // 如果配置了SMTP，使用真实SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // 否则使用测试账户（仅用于开发，不会真正发送邮件）
  // 在生产环境中，请配置真实的SMTP服务器
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'test',
    },
  });
};

export const emailService = {
  // 发送打卡提醒邮件
  async sendCheckInReminder(email: string, daysMissed: number = 1): Promise<boolean> {
    try {
      const transporter = createTransporter();
      
      const subject = daysMissed === 1 
        ? '【重启人生】今日打卡提醒' 
        : `【重启人生】您已${daysMissed}天未打卡`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #137fec;">重启人生 - 打卡提醒</h2>
          <p>您好，</p>
          <p>${daysMissed === 1 
            ? '您今天还没有进行安全签到打卡，请记得及时打卡以确保您的安全状态被记录。' 
            : `您已经连续${daysMissed}天没有进行安全签到打卡了。为了您的安全，请尽快进行打卡。`}</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background-color: #137fec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              立即打卡
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            此邮件由重启人生系统自动发送，请勿回复。
          </p>
        </div>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@restartlife.com',
        to: email,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('邮件发送成功:', info.messageId);
      return true;
    } catch (error) {
      console.error('发送邮件失败:', error);
      // 在开发环境中，即使发送失败也返回true（因为可能没有配置SMTP）
      if (process.env.NODE_ENV === 'development') {
        console.log('开发环境：邮件发送模拟成功');
        return true;
      }
      return false;
    }
  },

  // 发送紧急报警邮件（给紧急联系人）
  async sendEmergencyAlert(email: string, userName: string, daysMissed: number): Promise<boolean> {
    try {
      const transporter = createTransporter();
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">⚠️ 紧急报警 - 重启人生</h2>
          <p>您好，</p>
          <p style="color: #dc2626; font-weight: bold;">
            这是一条紧急报警信息。
          </p>
          <p>
            <strong>${userName}</strong> 已经连续 <strong>${daysMissed}天</strong> 没有进行安全签到打卡。
          </p>
          <p>
            系统已自动触发紧急报警机制。请您尽快联系该用户，确认其安全状况。
          </p>
          <p style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <strong>建议行动：</strong><br>
            1. 立即尝试联系用户<br>
            2. 如无法联系，请考虑前往用户所在地查看<br>
            3. 必要时可联系紧急服务部门
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            此邮件由重启人生系统自动发送，请勿回复。
          </p>
        </div>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@restartlife.com',
        to: email,
        subject: `【紧急】${userName}已${daysMissed}天未打卡`,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('紧急报警邮件发送成功:', info.messageId);
      return true;
    } catch (error) {
      console.error('发送紧急报警邮件失败:', error);
      if (process.env.NODE_ENV === 'development') {
        console.log('开发环境：紧急报警邮件发送模拟成功');
        return true;
      }
      return false;
    }
  }
};

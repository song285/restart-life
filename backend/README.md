# 重启人生后端API

## 项目结构

```
backend/
├── src/
│   ├── db/           # 数据库相关
│   │   └── database.ts
│   ├── models/       # 数据模型
│   │   ├── checkinModel.ts
│   │   ├── settingsModel.ts
│   │   └── contactModel.ts
│   ├── routes/       # API路由
│   │   ├── checkinRoutes.ts
│   │   ├── settingsRoutes.ts
│   │   ├── contactRoutes.ts
│   │   └── greetingRoutes.ts
│   ├── services/     # 业务服务
│   │   └── geminiService.ts
│   ├── types.ts      # TypeScript类型定义
│   └── index.ts      # 入口文件
├── data/             # 数据库文件存储目录
├── package.json
├── tsconfig.json
└── .env.example
```

## 安装和运行

1. 安装依赖：
```bash
cd backend
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，设置 GEMINI_API_KEY（可选）
```

3. 运行开发服务器：
```bash
npm run dev
```

服务器将在 http://localhost:3001 启动

## API端点

### 打卡相关
- `POST /api/checkin` - 创建打卡记录
- `GET /api/checkin/stats` - 获取打卡统计
- `GET /api/checkin/last` - 获取最后一次打卡
- `GET /api/checkin/today` - 检查今天是否已打卡

### 设置相关
- `GET /api/settings` - 获取用户设置
- `PUT /api/settings` - 更新用户设置

### 联系人相关
- `GET /api/contacts` - 获取所有联系人
- `POST /api/contacts` - 创建联系人
- `PUT /api/contacts/:id` - 更新联系人
- `DELETE /api/contacts/:id` - 删除联系人

### 问候相关
- `GET /api/greeting` - 获取每日问候（使用Gemini AI）

### 健康检查
- `GET /health` - 服务器健康状态

## 数据库结构

### users 表
- id (TEXT PRIMARY KEY)
- email (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### checkins 表
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FOREIGN KEY)
- checkin_time (DATETIME)
- created_at (DATETIME)

### user_settings 表
- id (TEXT PRIMARY KEY)
- user_id (TEXT UNIQUE, FOREIGN KEY)
- email_notify (INTEGER)
- sms_notify (INTEGER)
- auto_alarm (INTEGER)
- alarm_threshold_hours (INTEGER)
- email (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

### emergency_contacts 表
- id (TEXT PRIMARY KEY)
- user_id (TEXT, FOREIGN KEY)
- name (TEXT)
- phone (TEXT)
- type (TEXT: 'mobile' | 'home')
- created_at (DATETIME)
- updated_at (DATETIME)

## 环境变量

### 基础配置
- `PORT` - 服务器端口（默认：3001）
- `DATABASE_PATH` - 数据库文件路径（默认：./data/database.db）
- `CORS_ORIGIN` - 允许的CORS来源（默认：http://localhost:5173）
- `FRONTEND_URL` - 前端应用URL（用于邮件中的链接，默认：http://localhost:5173）

### AI服务（可选）
- `GEMINI_API_KEY` - Gemini API密钥（可选，用于生成每日问候）

### 邮件服务（可选，用于发送提醒邮件）
- `SMTP_HOST` - SMTP服务器地址（如：smtp.gmail.com）
- `SMTP_PORT` - SMTP端口（默认：587）
- `SMTP_SECURE` - 是否使用SSL/TLS（true/false）
- `SMTP_USER` - SMTP用户名
- `SMTP_PASS` - SMTP密码
- `SMTP_FROM` - 发件人邮箱地址

### 短信服务（可选，用于发送紧急报警短信）
- `TWILIO_ACCOUNT_SID` - Twilio账户SID
- `TWILIO_AUTH_TOKEN` - Twilio认证令牌
- `TWILIO_PHONE_NUMBER` - Twilio电话号码

**注意：**
- 如果不配置SMTP，邮件功能将在开发模式下模拟发送（仅打印日志）
- 如果不配置Twilio，短信功能将在开发模式下模拟发送（仅打印日志）
- 生产环境建议配置真实的邮件和短信服务

# 快速部署指南

## 一、服务器准备（5分钟）

### 1. 安装必要软件

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2
sudo npm install -g pm2
```

### 2. 创建项目目录

```bash
sudo mkdir -p /var/www/restart-life
sudo chown -R $USER:$USER /var/www/restart-life
```

## 二、上传代码（2分钟）

### 方式一：使用 SCP（从本地）

```bash
# 在本地执行
scp -r /Users/macbookpro/Downloads/重启人生/* user@your-server:/var/www/restart-life/
```

### 方式二：使用 Git

```bash
cd /var/www/restart-life
git clone your-repo-url .
```

## 三、配置环境变量（3分钟）

### 1. 后端配置

```bash
cd /var/www/restart-life/backend
cp env.example .env
nano .env
```

**必须修改的配置：**
- `CORS_ORIGIN`: 改为你的域名，例如 `http://your-domain.com` 或 `http://43.163.83.15`
- `PORT`: 保持 3001（或根据需要修改）

**可选配置：**
- `GEMINI_API_KEY`: 如果需要每日问候功能
- `SMTP_*`: 如果需要邮件提醒功能
- `TWILIO_*`: 如果需要短信提醒功能

### 2. 前端配置

```bash
cd /var/www/restart-life
cp env.production.example .env.production
nano .env.production
```

**必须修改的配置：**
- `VITE_API_URL`: 改为你的后端地址，例如 `http://43.163.83.15:3001/api` 或 `http://your-domain.com/api`

## 四、一键部署（1分钟）

```bash
cd /var/www/restart-life
chmod +x deploy.sh
./deploy.sh
```

部署脚本会自动：
- ✅ 安装依赖
- ✅ 构建前后端
- ✅ 启动后端服务（PM2）
- ✅ 显示服务状态

## 五、配置 Nginx（3分钟）

### 1. 复制配置文件

```bash
sudo cp /var/www/restart-life/nginx.conf /etc/nginx/sites-available/restart-life
```

### 2. 编辑配置

```bash
sudo nano /etc/nginx/sites-available/restart-life
```

**必须修改：**
- `server_name`: 改为你的域名或 IP（例如：`43.163.83.15`）
- `root`: 确保路径正确（`/var/www/restart-life/dist`）

### 3. 启用站点

```bash
sudo ln -s /etc/nginx/sites-available/restart-life /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

## 六、配置防火墙（1分钟）

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 七、验证部署

1. **检查后端**
   ```bash
   curl http://localhost:3001/health
   ```
   应该返回：`{"status":"ok","timestamp":"..."}`

2. **检查前端**
   浏览器访问：`http://your-server-ip` 或 `http://your-domain.com`

3. **查看日志**
   ```bash
   pm2 logs restart-life-backend
   ```

## 常见问题

### Q: 前端无法访问后端 API？
**A:** 检查：
1. 后端的 `CORS_ORIGIN` 是否包含前端域名
2. 前端的 `VITE_API_URL` 是否正确
3. Nginx 的 `/api` 代理配置是否正确

### Q: 后端启动失败？
**A:** 检查：
```bash
pm2 logs restart-life-backend --err
cd backend
cat .env  # 检查环境变量
```

### Q: 如何更新代码？
**A:** 
```bash
cd /var/www/restart-life
git pull  # 如果使用 Git
./deploy.sh  # 重新部署
```

## 下一步：配置 HTTPS（可选但推荐）

1. 安装 Certbot
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. 获取证书
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. 使用 HTTPS 配置
   ```bash
   sudo cp /var/www/restart-life/nginx-https.conf /etc/nginx/sites-available/restart-life
   # 编辑配置文件，修改域名和证书路径
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 服务管理命令

```bash
# 查看服务状态
pm2 status

# 重启后端
pm2 restart restart-life-backend

# 查看日志
pm2 logs restart-life-backend

# 重启 Nginx
sudo systemctl restart nginx
```

---

**部署完成后，你的应用应该可以通过浏览器访问了！** 🎉

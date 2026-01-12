# 部署指南

本文档说明如何将"重启人生"应用部署到服务器上。

## 前置要求

1. **服务器要求**
   - Linux 服务器（Ubuntu/CentOS 等）
   - Node.js 18+ 和 npm
   - Nginx（用于反向代理和静态文件服务）
   - PM2（用于进程管理，可通过 npm 安装）

2. **端口要求**
   - 80/443: HTTP/HTTPS（Nginx）
   - 3001: 后端 API 服务

## 部署步骤

### 1. 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# 或
sudo yum update -y  # CentOS/RHEL

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs  # Ubuntu/Debian

# 安装 Nginx
sudo apt install nginx -y  # Ubuntu/Debian
# 或
sudo yum install nginx -y  # CentOS/RHEL

# 安装 PM2
sudo npm install -g pm2
```

### 2. 上传项目文件

将项目文件上传到服务器，建议放在 `/var/www/restart-life/` 目录：

```bash
# 在服务器上创建目录
sudo mkdir -p /var/www/restart-life
sudo chown -R $USER:$USER /var/www/restart-life

# 使用 scp 上传文件（在本地执行）
scp -r /Users/macbookpro/Downloads/重启人生/* user@your-server:/var/www/restart-life/
```

或者使用 Git：

```bash
cd /var/www/restart-life
git clone your-repo-url .
```

### 3. 配置环境变量

#### 后端环境变量

```bash
cd /var/www/restart-life/backend
cp .env.example .env
nano .env  # 编辑环境变量
```

重要配置项：
- `PORT`: 后端端口（默认 3001）
- `CORS_ORIGIN`: 允许的前端域名
- `GEMINI_API_KEY`: Gemini API 密钥（可选）
- `SMTP_*`: 邮件服务配置（可选）
- `TWILIO_*`: 短信服务配置（可选）

#### 前端环境变量

```bash
cd /var/www/restart-life
cp .env.production.example .env.production
nano .env.production  # 编辑环境变量
```

重要配置项：
- `VITE_API_URL`: 后端 API 地址（例如：`http://your-server-ip:3001/api`）

### 4. 构建和部署

#### 方式一：使用部署脚本（推荐）

```bash
cd /var/www/restart-life
chmod +x deploy.sh
./deploy.sh
```

#### 方式二：手动部署

```bash
# 1. 安装后端依赖
cd /var/www/restart-life/backend
npm install --production

# 2. 构建后端（如果还没有构建）
npm run build

# 3. 安装前端依赖
cd /var/www/restart-life
npm install

# 4. 构建前端
npm run build

# 5. 启动后端服务
cd backend
pm2 start ecosystem.config.js
pm2 save
```

### 5. 配置 Nginx

```bash
# 复制 Nginx 配置文件
sudo cp /var/www/restart-life/nginx.conf /etc/nginx/sites-available/restart-life

# 编辑配置文件，修改域名和路径
sudo nano /etc/nginx/sites-available/restart-life
```

需要修改的地方：
- `server_name`: 改为你的域名或 IP
- `root`: 确保指向前端构建目录（通常是 `/var/www/restart-life/dist`）

```bash
# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/restart-life /etc/nginx/sites-enabled/

# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 6. 配置防火墙

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp  # 如果直接访问后端
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 7. 设置 PM2 开机自启

```bash
# 生成启动脚本
pm2 startup

# 按照输出的命令执行（通常是 sudo 命令）
# 例如：sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# 保存当前 PM2 进程列表
pm2 save
```

## 验证部署

1. **检查后端服务**
   ```bash
   curl http://localhost:3001/health
   ```

2. **检查前端**
   在浏览器访问 `http://your-server-ip` 或你的域名

3. **查看日志**
   ```bash
   # 后端日志
   pm2 logs restart-life-backend
   
   # Nginx 日志
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

## 常用管理命令

### PM2 命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs restart-life-backend
pm2 logs restart-life-backend --lines 50  # 查看最近50行

# 重启服务
pm2 restart restart-life-backend

# 停止服务
pm2 stop restart-life-backend

# 删除服务
pm2 delete restart-life-backend

# 监控
pm2 monit
```

### Nginx 命令

```bash
# 重启 Nginx
sudo systemctl restart nginx

# 重新加载配置（不中断服务）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx
```

## 更新部署

当代码更新后：

```bash
cd /var/www/restart-life

# 拉取最新代码（如果使用 Git）
git pull

# 重新运行部署脚本
./deploy.sh
```

或者手动更新：

```bash
# 更新后端
cd backend
npm install --production
npm run build
pm2 restart restart-life-backend

# 更新前端
cd ..
npm install
npm run build
sudo systemctl reload nginx
```

## 故障排查

### 后端无法启动

1. 检查端口是否被占用：
   ```bash
   sudo lsof -i :3001
   ```

2. 查看 PM2 日志：
   ```bash
   pm2 logs restart-life-backend --err
   ```

3. 检查环境变量：
   ```bash
   cd backend
   cat .env
   ```

### 前端无法访问

1. 检查 Nginx 配置：
   ```bash
   sudo nginx -t
   ```

2. 检查文件权限：
   ```bash
   ls -la /var/www/restart-life/dist
   ```

3. 查看 Nginx 错误日志：
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### API 请求失败

1. 检查 CORS 配置：
   确保后端的 `CORS_ORIGIN` 包含前端域名

2. 检查 API 地址：
   确保前端的 `VITE_API_URL` 配置正确

3. 检查防火墙：
   确保端口 3001 已开放（如果直接访问）

## 安全建议

1. **使用 HTTPS**
   - 配置 SSL 证书（Let's Encrypt）
   - 修改 Nginx 配置支持 HTTPS

2. **限制后端访问**
   - 只允许通过 Nginx 反向代理访问后端
   - 在防火墙中关闭 3001 端口的公网访问

3. **保护敏感信息**
   - 不要将 `.env` 文件提交到 Git
   - 使用强密码和 API 密钥

4. **定期备份**
   - 备份数据库文件：`/var/www/restart-life/backend/data/database.db`
   - 备份配置文件

## 性能优化

1. **启用 Nginx 缓存**
   - 静态资源已配置缓存
   - 可根据需要调整缓存策略

2. **PM2 集群模式**
   - 如果服务器性能足够，可以启用集群模式
   - 修改 `ecosystem.config.js` 中的 `instances` 和 `exec_mode`

3. **数据库优化**
   - 定期清理旧数据
   - 考虑使用更强大的数据库（如 PostgreSQL）

## 支持

如有问题，请查看：
- 后端日志：`pm2 logs restart-life-backend`
- Nginx 日志：`/var/log/nginx/`
- 系统日志：`journalctl -u nginx`

#!/bin/bash

# 部署脚本 - 用于在服务器上部署应用
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署重启人生应用..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装，请先安装 npm${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js 版本: $NODE_VERSION${NC}"

# 1. 安装后端依赖
echo ""
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install --production
fi
cd ..

# 2. 构建后端（如果还没有构建）
echo ""
echo "🔨 构建后端..."
cd backend
if [ ! -d "dist" ]; then
    echo "⚠️  后端未构建，开始构建..."
    npm run build
fi
cd ..

# 3. 安装前端依赖
echo ""
echo "📦 安装前端依赖..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# 4. 构建前端
echo ""
echo "🔨 构建前端..."
npm run build

# 5. 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo -e "${YELLOW}⚠️  PM2 未安装，正在安装...${NC}"
    npm install -g pm2
fi

# 6. 创建日志目录
echo ""
echo "📁 创建日志目录..."
mkdir -p backend/logs

# 7. 启动/重启后端服务
echo ""
echo "🔧 启动后端服务..."
cd backend
pm2 delete restart-life-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
cd ..

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "📊 服务状态："
pm2 list
echo ""
echo "📝 查看日志："
echo "  后端日志: pm2 logs restart-life-backend"
echo "  实时日志: pm2 logs restart-life-backend --lines 50"
echo ""
echo "🔧 常用命令："
echo "  停止服务: pm2 stop restart-life-backend"
echo "  重启服务: pm2 restart restart-life-backend"
echo "  查看状态: pm2 status"
echo "  查看监控: pm2 monit"
echo ""
echo "⚠️  注意："
echo "  1. 确保已配置 Nginx 反向代理"
echo "  2. 确保已设置环境变量（.env 文件）"
echo "  3. 确保防火墙已开放相应端口"

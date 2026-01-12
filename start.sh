#!/bin/bash

# 启动脚本 - 同时启动前端和后端

echo "🚀 启动重启人生应用..."

# 检查后端依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend && npm install && cd ..
fi

# 检查前端依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动后端（后台运行）
echo "🔧 启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端应用..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 服务已启动！"
echo "📊 后端: http://localhost:3001"
echo "🎨 前端: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

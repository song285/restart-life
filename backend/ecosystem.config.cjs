// PM2 进程管理配置文件
// 使用 .cjs 扩展名以支持 CommonJS 格式
module.exports = {
  apps: [{
    name: 'restart-life-backend',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // 日志配置
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // 自动重启配置
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // 启动延迟
    min_uptime: '10s',
    max_restarts: 10
  }]
};

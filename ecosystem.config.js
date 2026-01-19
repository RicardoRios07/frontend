// PM2 Ecosystem Configuration
// Para usar: pm2 start ecosystem.config.js

module.exports = {
  apps: [{
    name: 'ecommerce-frontend',
    script: 'pnpm',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}

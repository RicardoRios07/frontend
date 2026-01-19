module.exports = {
  apps: [
    {
      name: 'ecommerce-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Logs
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Comportamiento en caso de errores
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Variables de control
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Post-deploy hooks (opcional)
      post_update: ['pnpm install', 'pnpm run build'],
    },
  ],

  // Configuración de despliegue (opcional - para PM2 deploy)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/ecommerce-frontend.git',
      path: '/var/www/ecommerce-frontend',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/ecommerce-frontend.git',
      path: '/var/www/ecommerce-frontend-staging',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};

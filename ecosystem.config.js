module.exports = {
  apps: [
    {
      name: 'archivo-alsil',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/archivo-alsil',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};

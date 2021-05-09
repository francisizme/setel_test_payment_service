module.exports = {
  apps: [
    {
      name: 'payment_endpoint',
      script: './dist/src/main.js',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '400M',
    },
    {
      name: 'payment_service',
      script: './dist/src/listener.js',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '400M',
    },
  ],
};

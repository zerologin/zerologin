module.exports = {
    apps: [
      {
        name: 'zerologin',
        script: './build/server.js',
        instances: 'max',
        exec_mode: 'cluster',
        autorestart: true,
      },
    ],
  }
module.exports = {
  apps : [{
    name: 'la_radio_di_biagi',
    script: './server/www',
    autorestart: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      GOOGLE_APPLICATION_CREDENTIALS: '/firebase-account.json'
    },
    env_production: {
      NODE_ENV: 'production',
      GOOGLE_APPLICATION_CREDENTIALS: '/firebase-account.json'
    }
  }]
};

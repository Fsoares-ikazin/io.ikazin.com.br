module.exports = {
  apps: [
    {
      name: 'ikazin-api',
      cwd: '/home/phtech/dev/plataforma-ikazin/io.ikazin.com.br/apps/api',
      script: 'uv',
      args: 'run python app.py',
      env: {
        NODE_ENV: 'development',
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
    {
      name: 'ikazin-web',
      cwd: '/home/phtech/dev/plataforma-ikazin/io.ikazin.com.br/apps/web',
      script: '/home/phtech/dev/plataforma-ikazin/io.ikazin.com.br/apps/web/node_modules/.bin/next',
      args: 'dev',
      env: {
        NODE_ENV: 'development',
        NEXT_PUBLIC_LEARNHOUSE_API_URL: 'https://api-io.phtechsolucoes.com.br/api/v1/',
        NEXT_PUBLIC_LEARNHOUSE_BACKEND_URL: 'https://api-io.phtechsolucoes.com.br/',
        NEXT_PUBLIC_LEARNHOUSE_DOMAIN: 'io.phtechsolucoes.com.br',
        NEXT_PUBLIC_LEARNHOUSE_TOP_DOMAIN: 'phtechsolucoes.com.br',
        NEXT_PUBLIC_LEARNHOUSE_MULTI_ORG: 'False',
        NEXT_PUBLIC_LEARNHOUSE_DEFAULT_ORG: 'default',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
  ],
}

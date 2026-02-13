export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'default-secret-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '14d',
  },
  server: {
    port: parseInt(process.env.BACKEND_PORT ?? '3001', 10),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },
});

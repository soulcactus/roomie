function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} 환경변수가 필요합니다.`);
  }
  return value;
}

export default () => ({
  database: {
    url: getRequiredEnv('DATABASE_URL'),
  },
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    accessExpiresIn: getRequiredEnv('JWT_ACCESS_EXPIRES_IN'),
    refreshExpiresIn: getRequiredEnv('JWT_REFRESH_EXPIRES_IN'),
  },
  server: {
    port: parseInt(getRequiredEnv('BACKEND_PORT'), 10),
    frontendUrl: getRequiredEnv('FRONTEND_URL'),
  },
});

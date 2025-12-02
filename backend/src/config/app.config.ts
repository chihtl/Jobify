import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  enableAuth: process.env.ENABLE_AUTH === 'true',
  enableRateLimiting: process.env.ENABLE_RATE_LIMITING === 'true',
  enableHelmet: process.env.ENABLE_HELMET === 'true',
}));

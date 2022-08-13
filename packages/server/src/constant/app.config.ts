import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const ORM_CONFIG: SqljsConnectionOptions = require('../../config/ormconfig.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const REDIS_CONFIG = require('../../config/redisconfig.js');
export const AUTH_CONFIG = {
  jwtSecret: 'cdigi',
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const argv = require('yargs').argv;

const redis = {
  host: argv.redis_host,
  port: argv.redis_port,
  username: argv.redis_username,
  password: argv.redis_password,
};
module.exports = process.env.local
  ? require(`./redisconfig.${process.env.NODE_ENV}.json`)
  : redis;

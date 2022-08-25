const redis = {
  host: process.env.redis_host,
  port: process.env.redis_port,
  username: process.env.redis_username,
  password: process.env.redis_password,
};
const data = process.env.local
  ? require(`./redisconfig.${process.env.NODE_ENV}.json`)
  : redis;

console.log('redis', data);

module.exports = data;

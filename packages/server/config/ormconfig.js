// eslint-disable-next-line @typescript-eslint/no-var-requires
const argv = require('yargs').argv;

const orm = {
  type: 'mysql',
  host: argv.orm_host,
  port: argv.orm_port,
  username: argv.orm_username,
  password: argv.orm_password,
  database: argv.orm_database,
  entities: ['dist/**/**.entity{.ts,.js}'],
  synchronize: true,
  supportBigNumbers: true,
  bigNumberStrings: false,
};
module.exports = process.env.local
  ? require(`./ormconfig.${process.env.NODE_ENV}.json`)
  : orm;

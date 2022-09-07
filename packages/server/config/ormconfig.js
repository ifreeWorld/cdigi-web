const orm = {
  type: 'mysql',
  host: process.env.orm_host,
  port: process.env.orm_port,
  username: process.env.orm_username,
  password: process.env.orm_password,
  database: process.env.orm_database,
  entities: ['dist/**/**.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['migrations/**/**{.ts,.js}'],
  supportBigNumbers: true,
  bigNumberStrings: false,
};
const data = process.env.local
  ? require(`./ormconfig.${process.env.NODE_ENV}.json`)
  : orm;
console.log('orm', data);

module.exports = data;

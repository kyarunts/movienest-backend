import { SequelizeOptions } from "sequelize-typescript";

export const config: SequelizeOptions = {
  dialect: "postgres",
  dialectOptions: { supportBigNumbers: true, decimalNumbers: true },
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  logging: false,
};

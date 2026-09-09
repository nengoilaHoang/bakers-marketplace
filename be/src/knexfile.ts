import 'dotenv/config';
import type { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: "./src/db/migrations",
    extension: "ts",
  }
};

export default config;
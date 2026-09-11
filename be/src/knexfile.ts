import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Knex } from 'knex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});
const ext = __filename.endsWith('.ts') ? 'ts' : 'js';
const development: Knex.Config = {
  client: 'pg',

  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },

  migrations: {
    directory: path.resolve(__dirname, 'db/migrations'),
    extension: ext,
    loadExtensions: [`.${ext}`],
  },
  seeds: {
    directory: './db/seeds',
    extension: ext,
    loadExtensions: [`.${ext}`],
  },
};

export default development;
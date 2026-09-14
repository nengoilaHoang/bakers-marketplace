import dotenv from 'dotenv';
import path from 'node:path';
import snakecase from 'snakecase';
import camelcaseKey from 'camelcase-keys';
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
	wrapIdentifier: (value, origImpl, _queryContext) =>
		origImpl(snakecase(value)),
	postProcessResponse: (result, _queryContext) => {
		if (Array.isArray(result)) {
			return result.map((row) => camelcaseKey(row, { deep: true }));
		} else {
			return camelcaseKey(result, { deep: true });
		}
	},

	connection: {
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT ?? 5432),
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
	},

	migrations: {
		tableName: 'knex_migrations',
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

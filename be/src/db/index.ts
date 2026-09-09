import knex, { Knex } from 'knex';
import config from '#/knexfile.js';

class Database {
  public instance: Knex;

  constructor() {
    this.instance = knex(config);
  }

  public async checkConnection(): Promise<boolean> {
    try {
      await this.instance.raw('SELECT 1');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

const db = new Database();

export default db;
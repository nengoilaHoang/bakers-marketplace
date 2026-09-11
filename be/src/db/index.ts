import knex from 'knex';
import type { Knex } from 'knex';
import development from '#/knexfile.js';

class Database {
  public instance: Knex;

  constructor() {
    this.instance = knex(development);
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

export default new Database();
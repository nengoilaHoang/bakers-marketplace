import db from '#/db/index.js';
import {
	AuthAccount,
	type AuthAccountCreate,
	type AuthAccountUpdate,
	type AuthProvider,
} from '#/models/users/auth-accounts.model.js';

class AuthAccountDAO {
	private readonly tableName = 'auth_accounts';
	private db = db;

	public async getAll(): Promise<AuthAccount[]> {
		const accounts = await this.db.instance<AuthAccount>(this.tableName)
			.select('*')
			.orderBy('createdAt', 'desc');

		return accounts.map((account) => new AuthAccount(account));
	}

	public async getById(id: string): Promise<AuthAccount | null> {
		const account = await this.db.instance<AuthAccount>(this.tableName)
			.select('*')
			.where('id', id)
			.first();

		return account ? new AuthAccount(account) : null;
	}

	public async getByUserId(userId: string): Promise<AuthAccount | null> {
		const account = await this.db.instance<AuthAccount>(this.tableName)
			.select('*')
			.where('userId', userId)
			.first();

		return account ? new AuthAccount(account) : null;
	}

	public async getByProviderIdentity(
		provider: AuthProvider,
		providerUserId: string,
	): Promise<AuthAccount | null> {
		const account = await this.db.instance<AuthAccount>(this.tableName)
			.select('*')
			.where({ provider, providerUserId })
			.first();

		return account ? new AuthAccount(account) : null;
	}

	public async create(account: AuthAccountCreate): Promise<AuthAccount> {
		const [created] = await this.db.instance<AuthAccount>(this.tableName)
			.insert(account)
			.returning('*');

		return new AuthAccount(created);
	}

	public async update(
		id: string,
		account: AuthAccountUpdate,
	): Promise<AuthAccount | null> {
		const data = this.removeUndefined(account);

		if (Object.keys(data).length === 0) {
			return this.getById(id);
		}

		const [updated] = await this.db.instance<AuthAccount>(this.tableName)
			.where('id', id)
			.update({
				...data,
				updatedAt: this.db.instance.fn.now(),
			})
			.returning('*');

		return updated ? new AuthAccount(updated) : null;
	}

	public async delete(id: string): Promise<AuthAccount | null> {
		const [deleted] = await this.db.instance<AuthAccount>(this.tableName)
			.where('id', id)
			.del()
			.returning('*');

		return deleted ? new AuthAccount(deleted) : null;
	}

	private removeUndefined(
		account: AuthAccountUpdate,
	): Partial<AuthAccountUpdate> {
		return Object.fromEntries(
			Object.entries(account).filter(([, value]) => value !== undefined),
		);
	}
}

export default new AuthAccountDAO();

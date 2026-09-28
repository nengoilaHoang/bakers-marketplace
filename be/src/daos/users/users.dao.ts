import db from '#/db/index.js';
import type {
	UserCreate,
	UserCredentials,
	UserInfo,
	UserPasswordUpdate,
	UserUpdate,
} from '#/models/users/users.model.js';

class UserDAO {
	private readonly tableName = 'users';
	private readonly infoColumns = {
		id: 'id',
		email: 'email',
		displayName: 'displayname',
		role: 'role',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	};
	private db = db;

	public async getAll(): Promise<UserInfo[]> {
		return this.db.instance<UserInfo>(this.tableName)
			.select(this.infoColumns)
			.orderBy('createdAt', 'desc');
	}

	public async getById(id: string): Promise<UserInfo | null> {
		const user = await this.db.instance<UserInfo>(this.tableName)
			.select(this.infoColumns)
			.where('id', id)
			.first();

		return user ?? null;
	}

	public async getByEmail(email: string): Promise<UserInfo | null> {
		const user = await this.db.instance<UserInfo>(this.tableName)
			.select(this.infoColumns)
			.where('email', email)
			.first();

		return user ?? null;
	}

	public async getCredentialsByEmail(
		email: string,
	): Promise<UserCredentials | null> {
		const credentials = await this.db.instance<UserCredentials>(this.tableName)
			.select('id', 'email', 'hashedPassword')
			.where('email', email)
			.first();

		return credentials ?? null;
	}

	public async create(user: UserCreate): Promise<UserInfo> {
		const [created] = await this.db.instance(this.tableName)
			.insert({
				email: user.email,
				displayname: user.displayName,
				hashedPassword: user.hashedPassword,
				role: user.role,
			})
			.returning<{ id: string }[]>('id');

		const createdUser = await this.getById(created.id);

		if (!createdUser) {
			throw new Error('Created user could not be read');
		}

		return createdUser;
	}

	public async update(
		id: string,
		user: UserUpdate,
	): Promise<UserInfo | null> {
		const data: Record<string, unknown> = {};

		if (user.email !== undefined) data.email = user.email;
		if (user.displayName !== undefined) data.displayname = user.displayName;
		if (user.role !== undefined) data.role = user.role;

		if (Object.keys(data).length === 0) {
			return this.getById(id);
		}

		const updated = await this.db.instance(this.tableName)
			.where('id', id)
			.update({
				...data,
				updatedAt: this.db.instance.fn.now(),
			});

		return updated > 0 ? this.getById(id) : null;
	}

	/** Update only hashedPassword, never other user fields. */
	public async updatePassword(
		id: string,
		password: UserPasswordUpdate,
	): Promise<boolean> {
		const updated = await this.db.instance(this.tableName)
			.where('id', id)
			.update({
				hashedPassword: password.hashedPassword,
				updatedAt: this.db.instance.fn.now(),
			});

		return updated > 0;
	}

	public async delete(id: string): Promise<UserInfo | null> {
		const user = await this.getById(id);

		if (!user) {
			return null;
		}

		await this.db.instance(this.tableName)
			.where('id', id)
			.del();

		return user;
	}
}

export default new UserDAO();

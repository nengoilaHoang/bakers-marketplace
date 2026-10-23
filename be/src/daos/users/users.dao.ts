import db from '#/db/index.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '#/utils/http-errors.js';
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

	public async getByEmailInsensitive(email: string): Promise<UserInfo | null> {
		return await this.db.instance(this.tableName)
			.select(this.infoColumns)
			.whereRaw('LOWER(BTRIM(email)) = ?', [email.trim().toLowerCase()])
			.first() ?? null;
	}

	public async changeEmail(id: string, currentEmail: string, newEmail: string): Promise<void> {
		const normalizedEmail = newEmail.trim().toLowerCase();
		try {
			await this.db.instance.transaction(async (trx) => {
				const user = await trx(this.tableName).select('email').where('id', id).forUpdate().first();
				if (!user) throw new NotFoundError('Tài khoản không còn tồn tại.');
				const googleAccount = await trx('auth_accounts').select('id')
					.where({ userId: id, provider: 'GOOGLE' }).first();
				if (googleAccount) {
					throw new ForbiddenError('Tài khoản đăng nhập bằng Google không được đổi email.');
				}
				if (user.email !== currentEmail) {
					throw new ConflictError('Email tài khoản đã thay đổi. Vui lòng bắt đầu lại trong Cài đặt.');
				}
				if (user.email.trim().toLowerCase() === normalizedEmail) {
					throw new BadRequestError('Email mới phải khác email hiện tại.');
				}
				const existing = await trx(this.tableName).select('id')
					.whereRaw('LOWER(BTRIM(email)) = ?', [normalizedEmail]).whereNot('id', id).first();
				if (existing) throw new ConflictError('Email mới đã tồn tại trong hệ thống. Vui lòng chọn email khác.');
				await trx(this.tableName).where('id', id)
					.update({ email: normalizedEmail, updatedAt: trx.fn.now() });
			});
		} catch (error) {
			if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
				throw new ConflictError('Email mới đã tồn tại trong hệ thống. Vui lòng chọn email khác.');
			}
			throw error;
		}
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

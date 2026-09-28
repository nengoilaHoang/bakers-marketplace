import db from '#/db/index.js';
import {
	Session,
	type SessionCreate,
	type SessionUpdate,
} from '#/models/users/sessions.model.js';

class SessionDAO {
	private readonly tableName = 'sessions';
	private db = db;

	public async getAll(): Promise<Session[]> {
		const sessions = await this.db.instance<Session>(this.tableName)
			.select('*')
			.orderBy('createdAt', 'desc');

		return sessions.map((session) => new Session(session));
	}

	public async getById(id: string): Promise<Session | null> {
		const session = await this.db.instance<Session>(this.tableName)
			.select('*')
			.where('id', id)
			.first();

		return session ? new Session(session) : null;
	}

	public async getByUserId(userId: string): Promise<Session[]> {
		const sessions = await this.db.instance<Session>(this.tableName)
			.select('*')
			.where('userId', userId)
			.orderBy('createdAt', 'desc');

		return sessions.map((session) => new Session(session));
	}

	public async getByRefreshTokenHash(
		refreshTokenHash: string,
	): Promise<Session | null> {
		const session = await this.db.instance<Session>(this.tableName)
			.select('*')
			.where('refreshTokenHash', refreshTokenHash)
			.first();

		return session ? new Session(session) : null;
	}

	public async create(session: SessionCreate): Promise<Session> {
		const [created] = await this.db.instance<Session>(this.tableName)
			.insert(session)
			.returning('*');

		return new Session(created);
	}

	public async update(
		id: string,
		session: SessionUpdate,
	): Promise<Session | null> {
		const data = this.removeUndefined(session);

		if (Object.keys(data).length === 0) {
			return this.getById(id);
		}

		const [updated] = await this.db.instance<Session>(this.tableName)
			.where('id', id)
			.update({
				...data,
				updatedAt: this.db.instance.fn.now(),
			})
			.returning('*');

		return updated ? new Session(updated) : null;
	}

	public async delete(id: string): Promise<Session | null> {
		const [deleted] = await this.db.instance<Session>(this.tableName)
			.where('id', id)
			.del()
			.returning('*');

		return deleted ? new Session(deleted) : null;
	}

	private removeUndefined(session: SessionUpdate): Partial<SessionUpdate> {
		return Object.fromEntries(
			Object.entries(session).filter(([, value]) => value !== undefined),
		);
	}
}

export default new SessionDAO();

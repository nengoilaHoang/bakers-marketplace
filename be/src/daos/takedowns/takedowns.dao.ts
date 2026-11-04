import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
	PostRemoval,
	UserBan,
	type TakedownView,
} from '#/models/takedowns/takedowns.model.js';

type TakedownRow = {
	id: string;
	issuedBy: string | null;
	reason: string;
	issuedAt: Date;
	revokedBy: string | null;
	revokedAt: Date | null;
};

type TakedownViewRow = {
	id: string;
	reason: string;
	issuedBy: string | null;
	issuerDisplayName: string | null;
	issuedAt: Date;
	revokedBy: string | null;
	revokerDisplayName: string | null;
	revokedAt: Date | null;
};

/** One kind of takedown: its table and the column pointing at the target. */
type TakedownKind = {
	tableName: 'post_removals' | 'user_bans';
	targetColumn: 'postId' | 'userId';
};

const POST_REMOVAL: TakedownKind = { tableName: 'post_removals', targetColumn: 'postId' };
const USER_BAN: TakedownKind = { tableName: 'user_bans', targetColumn: 'userId' };

/** Post removals and user bans (post_removals and user_bans share the takedowns table). */
class TakedownDAO {
	private readonly tableName = 'takedowns';
	private db = db;

	public async createPostRemoval(
		postId: string,
		issuedBy: string,
		reason: string,
		trx?: Knex.Transaction,
	): Promise<PostRemoval> {
		const takedown = await this.create(POST_REMOVAL, postId, issuedBy, reason, trx);

		return new PostRemoval({ ...takedown, postId });
	}

	public async createUserBan(
		userId: string,
		issuedBy: string,
		reason: string,
		trx?: Knex.Transaction,
	): Promise<UserBan> {
		const takedown = await this.create(USER_BAN, userId, issuedBy, reason, trx);

		return new UserBan({ ...takedown, userId });
	}

	/** The ban still in force, if any. */
	public async getActiveBanByUserId(userId: string): Promise<UserBan | null> {
		const row: TakedownRow | undefined = await this.active(USER_BAN, userId)
			.select('t.*')
			.first();

		return row ? new UserBan({ ...row, userId }) : null;
	}

	/** Lifts the removal in force; returns false when there was none. */
	public async revokePostRemoval(
		postId: string,
		revokedBy: string,
		trx?: Knex.Transaction,
	): Promise<boolean> {
		return this.revoke(POST_REMOVAL, postId, revokedBy, trx);
	}

	/** Lifts the ban in force; returns false when there was none. */
	public async revokeUserBan(
		userId: string,
		revokedBy: string,
		trx?: Knex.Transaction,
	): Promise<boolean> {
		return this.revoke(USER_BAN, userId, revokedBy, trx);
	}

	public async getRemovalsByPostId(postId: string): Promise<TakedownView[]> {
		return this.getViews(POST_REMOVAL, postId);
	}

	public async getBansByUserId(userId: string): Promise<TakedownView[]> {
		return this.getViews(USER_BAN, userId);
	}

	private async create(
		kind: TakedownKind,
		targetId: string,
		issuedBy: string,
		reason: string,
		trx?: Knex.Transaction,
	): Promise<TakedownRow> {
		const run = async (trx: Knex.Transaction) => {
			const [takedown] = await trx<TakedownRow>(this.tableName)
				.insert({ issuedBy, reason })
				.returning('*');

			await trx(kind.tableName).insert({
				id: takedown.id,
				[kind.targetColumn]: targetId,
			});

			return takedown;
		};

		return trx ? run(trx) : this.db.instance.transaction(run);
	}

	private async revoke(
		kind: TakedownKind,
		targetId: string,
		revokedBy: string,
		trx?: Knex.Transaction,
	): Promise<boolean> {
		const knex = trx ?? this.db.instance;
		const updated = await knex(this.tableName)
			.whereIn('id', this.active(kind, targetId, trx).select('t.id'))
			.update({ revokedBy, revokedAt: knex.fn.now() });

		return updated > 0;
	}

	private active(
		kind: TakedownKind,
		targetId: string,
		trx?: Knex.Transaction,
	): Knex.QueryBuilder {
		return (trx ?? this.db.instance)(`${this.tableName} as t`)
			.join(`${kind.tableName} as k`, 'k.id', 't.id')
			.where(`k.${kind.targetColumn}`, targetId)
			.whereNull('t.revokedAt');
	}

	private async getViews(kind: TakedownKind, targetId: string): Promise<TakedownView[]> {
		const rows: TakedownViewRow[] = await this.db.instance(`${this.tableName} as t`)
			.select(
				't.id',
				't.reason',
				't.issuedBy',
				'issuer.displayname as issuerDisplayName',
				't.issuedAt',
				't.revokedBy',
				'revoker.displayname as revokerDisplayName',
				't.revokedAt',
			)
			.join(`${kind.tableName} as k`, 'k.id', 't.id')
			.leftJoin('users as issuer', 'issuer.id', 't.issuedBy')
			.leftJoin('users as revoker', 'revoker.id', 't.revokedBy')
			.where(`k.${kind.targetColumn}`, targetId)
			.orderBy('t.issuedAt', 'desc');

		return rows.map((row) => ({
			id: row.id,
			reason: row.reason,
			issuedBy: row.issuedBy
				? { id: row.issuedBy, displayName: row.issuerDisplayName ?? '' }
				: null,
			issuedAt: row.issuedAt,
			revokedBy: row.revokedBy
				? { id: row.revokedBy, displayName: row.revokerDisplayName ?? '' }
				: null,
			revokedAt: row.revokedAt,
		}));
	}
}

export default new TakedownDAO();

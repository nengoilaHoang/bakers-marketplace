import db from '#/db/index.js';
import type { Knex } from 'knex';
import {
	Post,
	type PostCreate,
	type PostCursor,
	type PostFilters,
	type PostUpdate,
	type PostView,
} from '#/models/posts/posts.model.js';

const PAGE_SIZE = 20;

type PostViewRow = Post & {
	authorDisplayName: string | null;
	recipeTitle: string | null;
	recipeCoverImgUrl: string | null;
	likeCount: number;
	commentCount: number;
	isLiked: boolean;
	isSaved: boolean;
};

class PostDAO {
	private readonly tableName = 'posts';
	private db = db;

	public async getPosts(
		filters: PostFilters,
		viewerId?: string,
		cursor?: PostCursor,
	): Promise<{ data: PostView[]; cursor: PostCursor | null }> {
		const query = this.selectPostViews(viewerId);

		if (filters.authorId) {
			query.where('p.authorId', filters.authorId);
		}

		if (filters.savedByUserId) {
			query.whereRaw(
				'EXISTS (SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = ?)',
				[filters.savedByUserId],
			);
		}

		if (filters.keyword) {
			const pattern = `%${filters.keyword}%`;

			query.where((builder) => {
				builder
					.whereRaw('unaccent(p.title) ILIKE unaccent(?)', [pattern])
					.orWhereRaw('unaccent(p.content) ILIKE unaccent(?)', [pattern])
					.orWhereRaw(
						'EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND unaccent(pt.name) ILIKE unaccent(?))',
						[pattern],
					);
			});
		}

		if (filters.tag) {
			query.whereRaw(
				'EXISTS (SELECT 1 FROM post_tags pt WHERE pt.post_id = p.id AND pt.name = ?)',
				[filters.tag],
			);
		}

		if (cursor) {
			query.andWhere((builder) => {
				builder
					.where('p.createdAt', '<', cursor.createdAt)
					.orWhere((subBuilder) => {
						subBuilder
							.where('p.createdAt', '=', cursor.createdAt)
							.andWhere('p.id', '<', cursor.id);
					});
			});
		}

		const rows: PostViewRow[] = await query
			.orderBy('p.createdAt', 'desc')
			.orderBy('p.id', 'desc')
			.limit(PAGE_SIZE);

		const lastRow = rows.at(-1);

		return {
			data: rows.map((row) => this.toPostView(row)),
			cursor: lastRow && rows.length === PAGE_SIZE && lastRow.createdAt
				? {
						createdAt: lastRow.createdAt,
						id: lastRow.id,
					}
				: null,
		};
	}

	public async getById(
		id: string,
		viewerId?: string,
	): Promise<PostView | null> {
		const row: PostViewRow | undefined = await this.selectPostViews(viewerId)
			.where('p.id', id)
			.first();

		if (!row) {
			return null;
		}

		return this.toPostView(row);
	}

	public async create(
		authorId: string,
		post: Pick<PostCreate, 'title' | 'content'> & { recipeId: string | null },
		trx?: Knex.Transaction,
	): Promise<Post> {
		const [createdPost] = await (trx ?? this.db.instance)<Post>(
			this.tableName,
		)
			.insert({
				...this.removeUndefined(post),
				authorId,
			})
			.returning('*');

		return new Post(createdPost);
	}

	public async update(
		id: string,
		post: Omit<PostUpdate, 'tags'>,
		trx?: Knex.Transaction,
	): Promise<Post | null> {
		const data = this.removeUndefined(post);

		const [updatedPost] = await (trx ?? this.db.instance)<Post>(
			this.tableName,
		)
			.where('id', id)
			.update({
				...data,
				updatedAt: (trx ?? this.db.instance).fn.now(),
			})
			.returning('*');

		if (!updatedPost) {
			return null;
		}

		return new Post(updatedPost);
	}

	public async delete(id: string): Promise<Post | null> {
		const [deletedPost] = await this.db.instance<Post>(this.tableName)
			.where('id', id)
			.del()
			.returning('*');

		if (!deletedPost) {
			return null;
		}

		return new Post(deletedPost);
	}

	public async existsById(id: string): Promise<boolean> {
		return Boolean(
			await this.db.instance(this.tableName)
				.select('id')
				.where('id', id)
				.first(),
		);
	}

	public async checkPostOwner(
		userId: string,
		postId: string,
	): Promise<boolean> {
		return Boolean(
			await this.db.instance(this.tableName)
				.select('id')
				.where({ id: postId, authorId: userId })
				.first(),
		);
	}

	private selectPostViews(viewerId?: string): Knex.QueryBuilder {
		const knex = this.db.instance;
		const viewer = viewerId ?? null;

		return knex(`${this.tableName} as p`)
			.select(
				'p.*',
				'u.displayname as authorDisplayName',
				'r.title as recipeTitle',
				'i.url as recipeCoverImgUrl',
				knex.raw(
					'(SELECT count(*) FROM post_likes pl WHERE pl.post_id = p.id)::int AS like_count',
				),
				knex.raw(
					'(SELECT count(*) FROM post_comments pc WHERE pc.post_id = p.id)::int AS comment_count',
				),
				knex.raw(
					'EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS is_liked',
					[viewer],
				),
				knex.raw(
					'EXISTS (SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = ?) AS is_saved',
					[viewer],
				),
			)
			.leftJoin('users as u', 'u.id', 'p.authorId')
			.leftJoin('recipes as r', 'r.id', 'p.recipeId')
			.leftJoin('images as i', 'i.id', 'r.coverImgId');
	}

	private toPostView(row: PostViewRow): PostView {
		const {
			authorDisplayName,
			recipeTitle,
			recipeCoverImgUrl,
			likeCount,
			commentCount,
			isLiked,
			isSaved,
			...post
		} = row;

		return {
			...new Post(post),
			author: post.authorId
				? { id: post.authorId, displayName: authorDisplayName ?? '' }
				: null,
			recipe: post.recipeId
				? {
						id: post.recipeId,
						title: recipeTitle ?? '',
						coverImgUrl: recipeCoverImgUrl,
					}
				: null,
			likeCount,
			commentCount,
			isLiked,
			isSaved,
		};
	}

	private removeUndefined(post: Partial<Post>): Partial<Post> {
		return Object.fromEntries(
			Object.entries(post).filter(
				([, value]) => value !== undefined,
			),
		);
	}
}

export default new PostDAO();

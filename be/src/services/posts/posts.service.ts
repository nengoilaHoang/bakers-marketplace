import db from '#/db/index.js';
import postDAO from '#/daos/posts/posts.dao.js';
import postTagDAO from '#/daos/posts/post-tags.dao.js';
import recipeService from '#/services/recipes/recipes.service.js';
import type { RecipeCreatePayload } from '#/services/recipes/recipes.service.js';
import {
	BadRequestError,
	ForbiddenError,
	InternalServerError,
	NotFoundError,
} from '#/utils/http-errors.js';
import type {
	GetPostsResult,
	Post,
	PostCreate,
	PostCursor,
	PostFilters,
	PostUpdate,
	PostView,
	PostWithDetails,
} from '#/models/posts/posts.model.js';
import type { PostTag } from '#/models/posts/post-tags.model.js';

class PostService {
	private postDAO = postDAO;
	private postTagDAO = postTagDAO;

	public async getPosts(
		cursor?: PostCursor,
		viewerId?: string,
	): Promise<GetPostsResult> {
		return this.getPage({}, cursor, viewerId);
	}

	public async search(
		keyword: string,
		tag: string,
		cursor?: PostCursor,
		viewerId?: string,
	): Promise<GetPostsResult> {
		const trimmedKeyword = keyword.trim();
		const normalizedTag = tag.trim().toLowerCase();

		if (!trimmedKeyword && !normalizedTag) {
			throw new BadRequestError('Search keyword or tag is required');
		}

		return this.getPage(
			{
				keyword: trimmedKeyword || undefined,
				tag: normalizedTag || undefined,
			},
			cursor,
			viewerId,
		);
	}

	public async getByAuthorId(
		authorId: string,
		cursor?: PostCursor,
		viewerId?: string,
	): Promise<GetPostsResult> {
		return this.getPage({ authorId }, cursor, viewerId);
	}

	public async getSaved(
		userId: string,
		cursor?: PostCursor,
	): Promise<GetPostsResult> {
		return this.getPage({ savedByUserId: userId }, cursor, userId);
	}

	public async getById(
		id: string,
		viewerId?: string,
	): Promise<PostWithDetails | null> {
		const post = await this.postDAO.getById(id, viewerId);

		if (!post) {
			return null;
		}

		const [postWithDetails] = await this.attachTags([post]);

		return postWithDetails;
	}

	public async create(
		authorId: string,
		payload: PostCreate,
	): Promise<PostWithDetails> {
		const { tags, recipe, ...post } = payload;
		const recipes = recipe
			? await this.createRecipeWithSnapshot(authorId, recipe)
			: null;

		let postId: string;

		try {
			postId = await db.instance.transaction(async (trx) => {
				const createdPost = await this.postDAO.create(
					authorId,
					{ ...post, recipeId: recipes?.snapshotId ?? null },
					trx,
				);

				await this.postTagDAO.replaceByPostId(
					createdPost.id,
					this.normalizeTags(tags),
					trx,
				);

				return createdPost.id;
			});
		} catch (error) {
			// Do not leave orphan recipes behind when the post cannot be created
			if (recipes) {
				await Promise.all([
					recipeService.delete(recipes.recipeId),
					recipeService.delete(recipes.snapshotId),
				]);
			}

			throw error;
		}

		return this.getExistingPost(postId, authorId);
	}

	public async update(
		userId: string,
		id: string,
		payload: PostUpdate,
	): Promise<PostWithDetails> {
		await this.assertPostOwner(userId, id);

		const { tags, ...post } = payload;

		await db.instance.transaction(async (trx) => {
			await this.postDAO.update(id, post, trx);

			if (tags !== undefined) {
				await this.postTagDAO.replaceByPostId(
					id,
					this.normalizeTags(tags),
					trx,
				);
			}
		});

		return this.getExistingPost(id, userId);
	}

	public async delete(userId: string, id: string): Promise<Post> {
		await this.assertPostOwner(userId, id);

		const deletedPost = await this.postDAO.delete(id);

		if (!deletedPost) {
			throw new NotFoundError('Post not found');
		}

		if (deletedPost.recipeId) {
			await this.deleteSnapshot(deletedPost.recipeId);
		}

		return deletedPost;
	}

	public async checkPostOwner(
		userId: string,
		postId: string,
	): Promise<boolean> {
		return this.postDAO.checkPostOwner(userId, postId);
	}

	public async assertPostExists(id: string): Promise<void> {
		if (!(await this.postDAO.existsById(id))) {
			throw new NotFoundError('Post not found');
		}
	}

	// ---------- helpers ----------

	private async assertPostOwner(userId: string, id: string): Promise<void> {
		await this.assertPostExists(id);

		if (!(await this.postDAO.checkPostOwner(userId, id))) {
			throw new ForbiddenError('You do not have permission to modify this post');
		}
	}

	/**
	 * Creates two identical public recipes: the original one, which shows up in
	 * the author's recipes, and a snapshot that is attached to the post.
	 */
	private async createRecipeWithSnapshot(
		authorId: string,
		recipe: NonNullable<PostCreate['recipe']>,
	): Promise<{ recipeId: string; snapshotId: string }> {
		const original = await recipeService.set(authorId, {
			...recipe,
			isPublic: true,
			isSnapshot: false,
		} as RecipeCreatePayload);

		if (!original?.id) {
			throw new InternalServerError('Recipe could not be created');
		}

		try {
			const snapshot = await recipeService.set(authorId, {
				...recipe,
				isPublic: true,
				isSnapshot: true,
			} as RecipeCreatePayload);

			if (!snapshot?.id) {
				throw new InternalServerError('Recipe snapshot could not be created');
			}

			return { recipeId: original.id, snapshotId: snapshot.id };
		} catch (error) {
			await recipeService.delete(original.id);

			throw error;
		}
	}

	/** A snapshot only exists for its post, so it is removed together with the post. */
	private async deleteSnapshot(recipeId: string): Promise<void> {
		const recipe = await recipeService.getById(recipeId);

		if (recipe?.isSnapshot) {
			await recipeService.delete(recipeId);
		}
	}

	private async getPage(
		filters: PostFilters,
		cursor?: PostCursor,
		viewerId?: string,
	): Promise<GetPostsResult> {
		const page = await this.postDAO.getPosts(filters, viewerId, cursor);

		return {
			data: await this.attachTags(page.data),
			cursor: page.cursor,
		};
	}

	private async getExistingPost(
		id: string,
		viewerId?: string,
	): Promise<PostWithDetails> {
		const post = await this.getById(id, viewerId);

		if (!post) {
			throw new NotFoundError('Post not found');
		}

		return post;
	}

	private async attachTags(posts: PostView[]): Promise<PostWithDetails[]> {
		const tags = await this.postTagDAO.getAllByPostIds(
			posts.map((post) => post.id),
		);
		const tagsByPostId = new Map<string, PostTag[]>();

		for (const tag of tags) {
			const postTags = tagsByPostId.get(tag.postId) ?? [];
			postTags.push(tag);
			tagsByPostId.set(tag.postId, postTags);
		}

		return posts.map((post) => ({
			...post,
			tags: tagsByPostId.get(post.id) ?? [],
		}));
	}

	private normalizeTags(tags?: string[]): string[] {
		return [
			...new Set(
				(tags ?? [])
					.map((tag) => tag.trim().toLowerCase())
					.filter(Boolean),
			),
		];
	}
}

export default new PostService();

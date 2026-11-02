import db from '#/db/index.js';
import postDAO from '#/daos/posts/posts.dao.js';
import postTagDAO from '#/daos/posts/post-tags.dao.js';
import recipeService from '#/services/recipes/recipes.service.js';
import {
	BadRequestError,
	ForbiddenError,
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
import { appendRecipeToken, extractRecipeIds } from '#/utils/post-content.js';

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
		const { tags, recipeId, ...post } = payload;

		// The only recipe a post can link to is the snapshot created below
		if (extractRecipeIds(post.content).length > 0) {
			throw new BadRequestError('Post content must not contain recipe tokens');
		}

		if (recipeId) {
			await this.assertAttachableRecipe(authorId, recipeId);
		}

		const postId = await db.instance.transaction(async (trx) => {
			const snapshotId = recipeId
				? await recipeService.createSnapshot(recipeId, trx)
				: null;
			const createdPost = await this.postDAO.create(
				authorId,
				{
					...post,
					content: snapshotId
						? appendRecipeToken(post.content, snapshotId)
						: post.content,
				},
				trx,
			);

			await this.postTagDAO.replaceByPostId(
				createdPost.id,
				this.normalizeTags(tags),
				trx,
			);

			return createdPost.id;
		});

		return this.getExistingPost(postId, authorId);
	}

	public async update(
		userId: string,
		id: string,
		payload: PostUpdate,
	): Promise<PostWithDetails> {
		await this.assertPostOwner(userId, id);

		const { tags, ...post } = payload;

		if (post.content !== undefined) {
			post.content = await this.keepRecipeToken(id, post.content);
		}

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

		const [recipeId] = extractRecipeIds(deletedPost.content);

		if (recipeId) {
			await this.deleteSnapshot(recipeId);
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

	/** A post can only take one of its author's own recipes, never a snapshot. */
	private async assertAttachableRecipe(
		authorId: string,
		recipeId: string,
	): Promise<void> {
		const recipe = await recipeService.getById(recipeId);

		if (!recipe) {
			throw new NotFoundError('Recipe not found');
		}

		if (recipe.userId !== authorId) {
			throw new ForbiddenError('You can only attach your own recipes');
		}

		if (recipe.isSnapshot) {
			throw new BadRequestError('Choose a recipe from your recipes, not one attached to a post');
		}
	}

	/**
	 * The attached recipe cannot change after creation. New content may keep the
	 * post's recipe token where the author placed it, or leave it out, in which
	 * case the token is appended again. Any other recipe token is rejected.
	 */
	private async keepRecipeToken(id: string, content: string): Promise<string> {
		const existingPost = await this.postDAO.getById(id);
		const [recipeId] = extractRecipeIds(existingPost?.content ?? '');
		const newRecipeIds = extractRecipeIds(content);

		if (
			newRecipeIds.length > 1 ||
			newRecipeIds.some((newRecipeId) => newRecipeId !== recipeId)
		) {
			throw new BadRequestError('The recipe attached to a post cannot be changed');
		}

		if (!recipeId || newRecipeIds.length === 1) {
			return content;
		}

		return appendRecipeToken(content, recipeId);
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

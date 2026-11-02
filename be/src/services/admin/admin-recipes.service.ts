import adminRecipeDAO from '#/daos/admin/admin-recipes.dao.js';
import recipeService from '#/services/recipes/recipes.service.js';
import { NotFoundError } from '#/utils/http-errors.js';
import type {
	AdminRecipeQuery,
	AdminRecipeRow,
	Paginated,
} from '#/models/admin/admin.model.js';

type RecipeDetails = NonNullable<Awaited<ReturnType<typeof recipeService.getById>>>;

export type AdminRecipeDetail = AdminRecipeRow &
	Pick<
		RecipeDetails,
		'steps' | 'recipeNotes' | 'recipeTags' | 'recipeTools' | 'recipeIngredients'
	>;

/** Admins can only look at recipes and who created them. */
class AdminRecipeService {
	private adminRecipeDAO = adminRecipeDAO;

	public async getPage(query: AdminRecipeQuery): Promise<Paginated<AdminRecipeRow>> {
		return this.adminRecipeDAO.getPage(query);
	}

	public async getById(id: string): Promise<AdminRecipeDetail> {
		const [recipe, details] = await Promise.all([
			this.adminRecipeDAO.getById(id),
			recipeService.getById(id),
		]);

		if (!recipe || !details) {
			throw new NotFoundError('Recipe not found');
		}

		return {
			...recipe,
			steps: details.steps,
			recipeNotes: details.recipeNotes,
			recipeTags: details.recipeTags,
			recipeTools: details.recipeTools,
			recipeIngredients: details.recipeIngredients,
		};
	}
}

export default new AdminRecipeService();

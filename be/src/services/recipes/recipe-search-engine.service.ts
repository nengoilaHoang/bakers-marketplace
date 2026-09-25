import recipeSearchEngineDAO, {
  type RecipeSearchCandidate,
} from '#/daos/recipes/recipe-search-engine.dao.js';
import recipeIngredientsService from '#/services/recipes/recipe-ingredients.service.js';
import recipeToolsService from '#/services/recipes/recipe-tools.service.js';

export type RecipeSearchMatchMode = 'complete' | 'flexible';

export type RecipeRequirementMatch = {
  matched: number;
  total: number;
  missing: string[];
};

export type RecipeSearchResult = RecipeSearchCandidate & {
  matchMode: RecipeSearchMatchMode;
  ingredientMatch: RecipeRequirementMatch;
  toolMatch: RecipeRequirementMatch;
};

type FilterDefinition = {
  value: string;
  aliases: readonly string[];
};

const TOOL_FILTERS: readonly FilterDefinition[] = [
  { value: 'oven', aliases: ['lo nuong', 'oven'] },
  {
    value: 'mixer',
    aliases: ['may danh trung', 'electric mixer', 'hand mixer', 'mixer'],
  },
  { value: 'stand-mixer', aliases: ['may tron bot', 'stand mixer'] },
  {
    value: 'scale',
    aliases: ['can dien tu', 'digital scale', 'kitchen scale', 'scale'],
  },
  { value: 'cake-pan', aliases: ['khuon', 'cake pan'] },
  { value: 'whisk', aliases: ['phoi long', 'whisk'] },
  { value: 'spatula', aliases: ['phoi det', 'spatula'] },
  { value: 'rolling-pin', aliases: ['cay can bot', 'rolling pin'] },
  { value: 'air-fryer', aliases: ['noi chien khong dau', 'air fryer'] },
];

const INGREDIENT_FILTERS: readonly FilterDefinition[] = [
  { value: 'flour', aliases: ['bot mi', 'wheat flour', 'flour'] },
  { value: 'sugar', aliases: ['duong', 'sugar'] },
  { value: 'egg', aliases: ['trung', 'egg'] },
  { value: 'butter', aliases: ['bo', 'butter'] },
  { value: 'milk', aliases: ['sua tuoi', 'fresh milk', 'milk'] },
  { value: 'chocolate', aliases: ['chocolate', 'socola'] },
  {
    value: 'cream',
    aliases: ['kem tuoi', 'whipping cream', 'heavy cream'],
  },
  { value: 'yeast', aliases: ['men no', 'men kho', 'yeast'] },
  {
    value: 'baking-powder',
    aliases: ['baking powder', 'bot no'],
  },
  { value: 'vanilla', aliases: ['vanilla', 'vani'] },
];

class RecipeSearchEngineService {
  private recipeSearchEngineDAO = recipeSearchEngineDAO;

  public async search(query: string): Promise<RecipeSearchCandidate[]> {
    return this.recipeSearchEngineDAO.search(query);
  }

  public async filterByTools<T extends RecipeSearchCandidate>(
    recipes: T[],
    selectedTools: string[],
    mode: RecipeSearchMatchMode,
  ): Promise<Array<T & { toolMatch: RecipeRequirementMatch }>> {
    const tools = await recipeToolsService.getAllByRecipeIds(
      recipes.map((recipe) => recipe.id),
    );
    const toolsByRecipeId = this.groupRequirements(
      tools.map((tool) => ({
        recipeId: tool.recipeId,
        name: tool.name,
      })),
    );

    return recipes
      .map((recipe) => {
        const toolMatch = this.getRequirementMatch(
          toolsByRecipeId.get(recipe.id) ?? [],
          selectedTools,
          TOOL_FILTERS,
        );

        return { ...recipe, toolMatch };
      })
      .filter(({ toolMatch }) =>
        this.matchesMode(toolMatch, selectedTools, mode),
      );
  }

  public async filterByIngredients<
    T extends RecipeSearchCandidate,
  >(
    recipes: T[],
    selectedIngredients: string[],
    mode: RecipeSearchMatchMode,
  ): Promise<Array<T & { ingredientMatch: RecipeRequirementMatch }>> {
    const ingredients = await recipeIngredientsService.getAllByRecipeIds(
      recipes.map((recipe) => recipe.id),
    );
    const ingredientsByRecipeId = this.groupRequirements(
      ingredients.map((ingredient) => ({
        recipeId: ingredient.recipeId,
        name: ingredient.name,
      })),
    );

    return recipes
      .map((recipe) => {
        const ingredientMatch = this.getRequirementMatch(
          ingredientsByRecipeId.get(recipe.id) ?? [],
          selectedIngredients,
          INGREDIENT_FILTERS,
        );

        return { ...recipe, ingredientMatch };
      })
      .filter(({ ingredientMatch }) =>
        this.matchesMode(
          ingredientMatch,
          selectedIngredients,
          mode,
        ),
      );
  }

  public toSearchResults(
    recipes: Array<
      RecipeSearchCandidate & {
        ingredientMatch: RecipeRequirementMatch;
        toolMatch: RecipeRequirementMatch;
      }
    >,
  ): RecipeSearchResult[] {
    return recipes.map((recipe) => ({
      ...recipe,
      matchMode:
        recipe.ingredientMatch.missing.length === 0
        && recipe.toolMatch.missing.length === 0
          ? 'complete'
          : 'flexible',
    }));
  }

  private getRequirementMatch(
    requirements: string[],
    selectedFilters: string[],
    definitions: readonly FilterDefinition[],
  ): RecipeRequirementMatch {
    if (
      selectedFilters.length === 0
      || selectedFilters.some((filter) => filter.toLowerCase() === 'all')
    ) {
      return {
        matched: requirements.length,
        total: requirements.length,
        missing: [],
      };
    }

    const missing = requirements.filter(
      (requirement) => !this.hasRequirement(
        requirement,
        selectedFilters,
        definitions,
      ),
    );

    return {
      matched: requirements.length - missing.length,
      total: requirements.length,
      missing,
    };
  }

  private hasRequirement(
    requirement: string,
    selectedFilters: string[],
    definitions: readonly FilterDefinition[],
  ): boolean {
    const normalizedRequirement = this.normalize(requirement);
    const requirementCategories = definitions.filter((definition) =>
      definition.aliases.some((alias) =>
        this.includesPhrase(normalizedRequirement, alias),
      ),
    );

    return selectedFilters.some((selectedFilter) => {
      const normalizedFilter = this.normalize(selectedFilter);
      const selectedDefinition = definitions.find(
        (definition) => definition.value === selectedFilter.toLowerCase(),
      );

      if (selectedDefinition) {
        return requirementCategories.includes(selectedDefinition);
      }

      if (selectedFilter.toLowerCase() === 'other') {
        return requirementCategories.length === 0;
      }

      return this.includesPhrase(normalizedRequirement, normalizedFilter)
        || this.includesPhrase(normalizedFilter, normalizedRequirement);
    });
  }

  private matchesMode(
    match: RecipeRequirementMatch,
    selectedFilters: string[],
    mode: RecipeSearchMatchMode,
  ): boolean {
    if (
      selectedFilters.length === 0
      || selectedFilters.some((filter) => filter.toLowerCase() === 'all')
    ) {
      return true;
    }

    const allowedMissingItems = mode === 'flexible' ? 2 : 0;
    return match.missing.length <= allowedMissingItems;
  }

  private groupRequirements(
    requirements: Array<{ recipeId: string; name: string }>,
  ): Map<string, string[]> {
    const grouped = new Map<string, string[]>();

    for (const requirement of requirements) {
      const recipeRequirements = grouped.get(requirement.recipeId) ?? [];
      recipeRequirements.push(requirement.name);
      grouped.set(requirement.recipeId, recipeRequirements);
    }

    return grouped;
  }

  private includesPhrase(value: string, phrase: string): boolean {
    const normalizedPhrase = this.normalize(phrase);

    if (!value || !normalizedPhrase) {
      return false;
    }

    return ` ${value} `.includes(` ${normalizedPhrase} `);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}

export default new RecipeSearchEngineService();

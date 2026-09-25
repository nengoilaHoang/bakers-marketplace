import type { Request, Response } from 'express';

import asyncHandler from '#/utils/asyncHandler.js';

import recipeSearchEngineService, {
  type RecipeSearchMatchMode,
} from '#/services/recipes/recipe-search-engine.service.js';

function readQueryString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const firstValue = value.find(
      (item): item is string => typeof item === 'string',
    );
    return firstValue?.trim() ?? '';
  }

  return '';
}

function readQueryList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];

  return Array.from(
    new Set(
      values
        .filter((item): item is string => typeof item === 'string')
        .flatMap((item) => item.split(','))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function readMatchMode(value: unknown): RecipeSearchMatchMode {
  return readQueryString(value) === 'flexible'
    ? 'flexible'
    : 'complete';
}

class RecipeSearchEngineController {
  private recipeSearchEngineService = recipeSearchEngineService;

  public search = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const query = readQueryString(req.query.q);
      const selectedTools = readQueryList(
        req.query.tools ?? req.query['tools[]'],
      );
      const selectedIngredients = readQueryList(
        req.query.ingredients ?? req.query['ingredients[]'],
      );
      const mode = readMatchMode(
        req.query.matchMode ?? req.query.mode,
      );

      const candidates = await this.recipeSearchEngineService.search(query);
      const recipesWithToolMatch =
        await this.recipeSearchEngineService.filterByTools(
          candidates,
          selectedTools,
          mode,
        );
      const recipesWithMatches =
        await this.recipeSearchEngineService.filterByIngredients(
          recipesWithToolMatch,
          selectedIngredients,
          mode,
        );

      res.status(200).json({
        data: this.recipeSearchEngineService.toSearchResults(
          recipesWithMatches,
        ),
      });
    },
  );
}

export default new RecipeSearchEngineController();

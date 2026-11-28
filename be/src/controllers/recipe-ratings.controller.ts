import type { Response } from 'express';
import type { AuthenticatedRequest, OptionalAuthenticatedRequest } from '#/types/request.types.js';
import { RecipeIdParamsSchema } from '#/models/recipes/recipes.model.js';
import { RecipeRatingCreateSchema, RecipeRatingUpdateSchema, RecipeRatingsQuerySchema } from '#/models/recipes/recipe-ratings.model.js';
import recipeRatingsService from '#/services/recipes/recipe-ratings.service.js';
import asyncHandler from '#/utils/asyncHandler.js';

class RecipeRatingsController {
  public getPage = asyncHandler(async (req: OptionalAuthenticatedRequest, res: Response) => {
    const { id } = RecipeIdParamsSchema.parse(req.params);
    const query = RecipeRatingsQuerySchema.parse(req.query);
    res.json({ data: await recipeRatingsService.getPage(id, query, req.user?.id) });
  });

  public create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = RecipeIdParamsSchema.parse(req.params);
    const data = RecipeRatingCreateSchema.parse(req.body);
    res.status(201).json({ data: await recipeRatingsService.mutate(id, req.user.id, { kind: 'create', data }) });
  });

  public update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = RecipeIdParamsSchema.parse(req.params);
    const data = RecipeRatingUpdateSchema.parse(req.body);
    res.json({ data: await recipeRatingsService.mutate(id, req.user.id, { kind: 'update', data }) });
  });

  public delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = RecipeIdParamsSchema.parse(req.params);
    res.json({ data: await recipeRatingsService.mutate(id, req.user.id, { kind: 'delete' }) });
  });
}

export default new RecipeRatingsController();

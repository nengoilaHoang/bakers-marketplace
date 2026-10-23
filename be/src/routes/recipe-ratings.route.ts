import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenMiddleware, optionalAuthenMiddleware } from '#/middlewares/authen.middleware.js';
import { sameOriginJsonMiddleware } from '#/middlewares/same-origin-json.middleware.js';
import { RecipeIdParamsSchema } from '#/models/recipes/recipes.model.js';
import { RecipeRatingCreateSchema, RecipeRatingUpdateSchema, RecipeRatingsQuerySchema } from '#/models/recipes/recipe-ratings.model.js';
import recipeRatingsService from '#/services/recipes/recipe-ratings.service.js';
import type { OptionalAuthenticatedRequest } from '#/types/request.types.js';

const router = Router({ mergeParams: true });
const mutationLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req: OptionalAuthenticatedRequest) => req.user!.id,
  message: { message: 'Bạn thao tác đánh giá quá nhanh. Vui lòng thử lại sau.' },
});

router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.get('/', optionalAuthenMiddleware, async (req: OptionalAuthenticatedRequest, res) => {
  const { id } = RecipeIdParamsSchema.parse(req.params);
  const query = RecipeRatingsQuerySchema.parse(req.query);
  res.json({ data: await recipeRatingsService.getPage(id, query, req.user?.id) });
});

router.use(authenMiddleware, sameOriginJsonMiddleware, mutationLimit);
router.post('/', async (req: OptionalAuthenticatedRequest, res) => {
  const { id } = RecipeIdParamsSchema.parse(req.params);
  const data = RecipeRatingCreateSchema.parse(req.body);
  res.status(201).json({ data: await recipeRatingsService.mutate(id, req.user!.id, { kind: 'create', data }) });
});
router.patch('/me', async (req: OptionalAuthenticatedRequest, res) => {
  const { id } = RecipeIdParamsSchema.parse(req.params);
  const data = RecipeRatingUpdateSchema.parse(req.body);
  res.json({ data: await recipeRatingsService.mutate(id, req.user!.id, { kind: 'update', data }) });
});
router.delete('/me', async (req: OptionalAuthenticatedRequest, res) => {
  const { id } = RecipeIdParamsSchema.parse(req.params);
  res.json({ data: await recipeRatingsService.mutate(id, req.user!.id, { kind: 'delete' }) });
});

export default router;

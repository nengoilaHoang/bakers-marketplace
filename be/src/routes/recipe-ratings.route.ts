import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenMiddleware, optionalAuthenMiddleware } from '#/middlewares/authen.middleware.js';
import { sameOriginJsonMiddleware } from '#/middlewares/same-origin-json.middleware.js';
import recipeRatingsController from '#/controllers/recipe-ratings.controller.js';
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
router.get('/', optionalAuthenMiddleware, recipeRatingsController.getPage);

router.use(authenMiddleware, sameOriginJsonMiddleware, mutationLimit);
router.post('/', recipeRatingsController.create);
router.patch('/me', recipeRatingsController.update);
router.delete('/me', recipeRatingsController.delete);

export default router;

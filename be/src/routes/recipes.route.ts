import { Router } from 'express';

import recipeController from '#/controllers/recipes.controller.js';
import recipeSearchEngineController from '#/controllers/recipe-search-engine.controller.js';
import { authenMiddleware, optionalAuthenMiddleware } from '#/middlewares/authen.middleware.js';
import recipeRatingsRouter from '#/routes/recipe-ratings.route.js';
const router = Router();

// router.get(
//   '/',
//   recipeController.getAll,
// );

router.get(
  '/',
  recipeController.getRecipes,
);

router.post(
  '/snapshot',
  authenMiddleware,
  recipeController.createSnapshot,
);

router.get(
  '/mine',
  authenMiddleware,
  recipeController.getMine,
);

router.get(
  '/user/:userId',
  optionalAuthenMiddleware,
  recipeController.getByUserId,
);

router.get(
  '/search',
  recipeSearchEngineController.search,
);

router.use('/:id/ratings', recipeRatingsRouter);

router.get(
  '/:id',
  optionalAuthenMiddleware,
  recipeController.getById,
);

router.post(
  '/',
  authenMiddleware,
  recipeController.create,
);

router.patch(
  '/',
  authenMiddleware,
  recipeController.update,
);

router.delete(
  '/:id',
  authenMiddleware,
  recipeController.delete,
);

export default router;

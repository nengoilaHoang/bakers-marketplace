import { Router } from 'express';

import recipeController from '#/controllers/recipes.controller.js';
import recipeSearchEngineController from '#/controllers/recipe-search-engine.controller.js';
import { authenMiddleware } from '#/middlewares/authen.middleware.js';
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
  recipeController.getByUserId,
);

router.get(
  '/search',
  recipeSearchEngineController.search,
);

router.get(
  '/:id',
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

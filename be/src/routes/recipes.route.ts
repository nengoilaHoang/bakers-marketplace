import { Router } from 'express';

import recipeController from '#/controllers/recipes.controller.js';

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
  recipeController.createSnapshot,
);

router.get(
  '/mine',
  recipeController.getMine,
);

router.get(
  '/user/:userId',
  recipeController.getByUserId,
);

router.get(
  '/:id',
  recipeController.getById,
);

router.post(
  '/',
  recipeController.create,
);

router.patch(
  '/',
  recipeController.update,
);

router.delete(
  '/:id',
  recipeController.delete,
);

export default router;

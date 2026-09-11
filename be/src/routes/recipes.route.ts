import { Router } from 'express';

import recipeController from '#/controllers/recipes.controller.js';

const router = Router();

router.get(
  '/',
  recipeController.getAll,
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
  '/:id',
  recipeController.update,
);

router.delete(
  '/:id',
  recipeController.delete,
);

export default router;
import { Router } from 'express';

import recipesRouter from '#/routes/recipes.route.js';

const router = Router();

router.use(
  '/recipes',
  recipesRouter,
);

export default router;
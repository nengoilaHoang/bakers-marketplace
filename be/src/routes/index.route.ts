import { Router } from 'express';

import recipesRouter from '#/routes/recipes.route.js';
import productsRouter from '#/routes/products.route.js';
import collectionsRouter from '#/routes/collections.route.js';

const router = Router();

router.use(
  '/recipes',
  recipesRouter,
);

router.use(
  '/products',
  productsRouter,
);

router.use(
  '/collections',
  collectionsRouter,
);

export default router;

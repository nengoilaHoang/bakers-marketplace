import { Router } from 'express';

import recipesRouter from '#/routes/recipes.route.js';
import storefrontsRouter from '#/routes/storefronts.route.js';
import pageLayoutsRouter from '#/routes/page-layouts.route.js';
import productsRouter from '#/routes/products.route.js';
import collectionsRouter from '#/routes/collections.route.js';
import authenRouter from '#/routes/authen.route.js';
import postsRouter from '#/routes/posts.route.js';

const router = Router();

router.use('/authen', authenRouter);
router.use('/recipes', recipesRouter);
router.use('/posts', postsRouter);
router.use('/storefronts', storefrontsRouter);
router.use('/pages', pageLayoutsRouter);
router.use('/products', productsRouter);
router.use('/collections', collectionsRouter);

export default router;

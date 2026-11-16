import { Router } from 'express';

import adminRouter from '#/routes/admin.route.js';
import authenRouter from '#/routes/authen.route.js';
import collectionsRouter from '#/routes/collections.route.js';
import layoutComponentsRouter from '#/routes/layout-components.route.js';
import pageLayoutsRouter from '#/routes/page-layouts.route.js';
import postsRouter from '#/routes/posts.route.js';
import productsRouter from '#/routes/products.route.js';
import recipesRouter from '#/routes/recipes.route.js';
import storeRouter from '#/routes/store.route.js';
import storefrontsRouter from '#/routes/storefronts.route.js';
import usersRouter from '#/routes/users.route.js';

const router = Router();

router.use('/authen', authenRouter);
router.use('/recipes', recipesRouter);
router.use('/posts', postsRouter);
router.use('/store', storeRouter);
router.use('/storefronts', storefrontsRouter);
router.use('/pages', pageLayoutsRouter);
router.use('/layout-components', layoutComponentsRouter);
router.use('/products', productsRouter);
router.use('/collections', collectionsRouter);
router.use('/users', usersRouter);
router.use('/admin', adminRouter);

export default router;

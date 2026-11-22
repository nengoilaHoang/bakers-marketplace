import { Router } from 'express';

import recipesRouter from '#/routes/recipes.route.js';
import storefrontsRouter from '#/routes/storefronts.route.js';
import pageLayoutsRouter from '#/routes/page-layouts.route.js';
import productsRouter from '#/routes/products.route.js';
import collectionsRouter from '#/routes/collections.route.js';
import authenRouter from '#/routes/authen.route.js';
import postsRouter from '#/routes/posts.route.js';
import usersRouter from '#/routes/users.route.js';
import adminRouter from '#/routes/admin.route.js';
import ordersRouter from '#/routes/orders.route.js';
import vendorOrdersRouter from '#/routes/vendor-orders.route.js';
import preOrdersRouter from '#/routes/pre-orders.route.js';
import vendorPreOrdersRouter from '#/routes/vendor-pre-orders.route.js';

const router = Router();

router.use('/authen', authenRouter);
router.use('/recipes', recipesRouter);
router.use('/posts', postsRouter);
router.use('/storefronts', storefrontsRouter);
router.use('/pages', pageLayoutsRouter);
router.use('/products', productsRouter);
router.use('/collections', collectionsRouter);
router.use('/users', usersRouter);
router.use('/admin', adminRouter);
router.use('/orders', ordersRouter);
router.use('/vendor/orders', vendorOrdersRouter);
router.use('/pre-orders', preOrdersRouter);
router.use('/vendor/pre-orders', vendorPreOrdersRouter);

export default router;

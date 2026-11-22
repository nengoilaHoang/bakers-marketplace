import { Router } from 'express';

import orderController from '#/controllers/orders.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';

const router = Router();

// Customers and bakers buy; vendors and admins do not
router.use(authenMiddleware, validateRole(['CUSTOMER', 'BAKER']));

// the buyer's own orders (?status=&page=&pageSize=)
router.post('/', orderController.place);
router.get('/mine', orderController.getMine);
router.get('/:id', orderController.getById);
router.post('/:id/cancel', orderController.cancel);
router.get('/:id/reorder', orderController.reorder);
router.post('/:id/items/:itemId/rating', orderController.rateItem);

export default router;

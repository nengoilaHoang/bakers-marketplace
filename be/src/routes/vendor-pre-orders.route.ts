import { Router } from 'express';

import vendorPreOrderController from '#/controllers/vendor-pre-orders.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';

const router = Router();

router.use(authenMiddleware, validateRole(['VENDOR']));

// requests holding this vendor's products (?status=&awaiting=true&page=&pageSize=)
router.get('/', vendorPreOrderController.getPage);
router.get('/:id', vendorPreOrderController.getById);
// the vendor answers once, for its own items, for every cycle
router.post('/:id/approve', vendorPreOrderController.approve);
router.post('/:id/decline', vendorPreOrderController.decline);

export default router;

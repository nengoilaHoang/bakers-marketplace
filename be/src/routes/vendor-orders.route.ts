import { Router } from 'express';

import vendorOrderController from '#/controllers/vendor-orders.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';

const router = Router();

router.use(authenMiddleware, validateRole(['VENDOR']));

// orders holding this vendor's products (?status=&awaiting=true&page=&pageSize=)
router.get('/', vendorOrderController.getPage);
router.get('/:id', vendorOrderController.getById);
// the vendor answers for its own items only
router.post('/:id/approve', vendorOrderController.approve);
router.post('/:id/decline', vendorOrderController.decline);

export default router;

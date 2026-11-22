import { Router } from 'express';

import preOrderController from '#/controllers/pre-orders.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';

const router = Router();

// Recurring orders are for bakers only
router.use(authenMiddleware, validateRole(['BAKER']));

// the baker's own requests (?status=&page=&pageSize=)
router.post('/', preOrderController.create);
router.get('/mine', preOrderController.getMine);
router.get('/:id', preOrderController.getById);
// cancels the whole request; cycles not reached yet are cancelled with it
router.post('/:id/cancel', preOrderController.cancel);
router.post('/:id/cycles/:cycleId/skip', preOrderController.skipCycle);

export default router;

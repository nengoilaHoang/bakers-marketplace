import layoutComponentController from '#/controllers/layout-components.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';
import e from 'express';

const router = e.Router();

router.use(authenMiddleware, validateRole(['VENDOR']));

router.put('/batch', layoutComponentController.saveBatch);
router.delete('/batch', layoutComponentController.deleteBatch);

export default router;

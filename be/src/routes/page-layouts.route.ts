import pageLayoutController from '#/controllers/page-layouts.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';
import e from 'express';

const router = e.Router();

router.use(authenMiddleware, validateRole(['VENDOR']));

router.put('/:id', pageLayoutController.update);

export default router;

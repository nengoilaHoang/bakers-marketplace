import pageLayoutController from '#/controllers/page-layouts.controller.js';
import storefrontController from '#/controllers/storefronts.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';
import e from 'express';

const router = e.Router();

router.use(authenMiddleware, validateRole(['VENDOR']));

router.get('/mine', storefrontController.getMyStorefronts);
router.get(
  '/releases/:releaseId/layouts',
  pageLayoutController.getReleaseLayouts,
);
router.get('/:id/releases/active', storefrontController.getActiveRelease);
router.get('/:storeId/releases/:releaseId', storefrontController.getRelease);

export default router;

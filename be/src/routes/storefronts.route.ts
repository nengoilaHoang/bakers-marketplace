import storefrontController from '#/controllers/storefronts.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';
import e from 'express';

const router = e.Router();

router.get(
  '/domain/:domain/page',
  storefrontController.getPublicStorefrontPage,
);
router.get(
  '/domain/:domain/nav-pages',
  storefrontController.getNavPages,
);

router.use(authenMiddleware, validateRole(['VENDOR']));

router.get('/mine', storefrontController.getMyStorefront);
router.get(
  '/releases/:releaseId/layouts',
  storefrontController.getReleaseLayouts,
);
router.post(
  '/releases/:releaseId/layouts',
  storefrontController.createReleasePage,
);
router.put(
  '/releases/:releaseId/theme-settings',
  storefrontController.updateThemeSettings,
);
router.get('/:id/releases/active', storefrontController.getActiveRelease);
router.get('/:storeId/releases/:releaseId', storefrontController.getRelease);

export default router;

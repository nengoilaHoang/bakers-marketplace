import storefrontController from '#/controllers/storefronts.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';
import e from 'express';

const router = e.Router();

router.get(
  '/domain/:domain/pages/:slug',
  storefrontController.getPublicStorefrontPage,
);
router.get('/domain/:domain/pages', storefrontController.getNavPages); // Give the pages of the active release

router.use(authenMiddleware, validateRole(['VENDOR']));

router.get('/mine', storefrontController.getMyStorefront);
router.get('/releases/:releaseId/pages', storefrontController.getReleasePages);
router.get(
  '/releases/:releaseId/pages/summary',
  storefrontController.getReleaseSummaryPages,
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

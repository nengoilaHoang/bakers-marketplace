import storefrontController from '#/controllers/storefronts.controller.js';
import e from 'express';

const router = e.Router();

router.get('/:id/releases/active', storefrontController.getActiveRelease);
router.get('/:storeId/releases/:releaseId', storefrontController.getRelease);

export default router;

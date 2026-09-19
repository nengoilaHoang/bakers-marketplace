import storefrontController from '#/controllers/storefronts.controller.js';
import e from 'express';

const router = e.Router();

router.get('/:id/active', storefrontController.getStorefrontActiveRelease);

export default router;

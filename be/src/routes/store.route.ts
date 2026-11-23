import storefrontController from '#/controllers/storefronts.controller.js';
import { Router } from 'express';

const router = Router();

router.get(
  '/domain/:domain/page',
  storefrontController.getPublicStorefrontPage,
);
router.get(
  '/domain/:domain/nav-pages',
  storefrontController.getNavPages,
);

export default router;

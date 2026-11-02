import { Router } from 'express';

import userController from '#/controllers/users.controller.js';
import { authenMiddleware } from '#/middlewares/authen.middleware.js';

const router = Router();

// public profile (no email)
router.get('/:id', userController.getProfile);

// reports
router.post('/:id/reports', authenMiddleware, userController.report);

export default router;

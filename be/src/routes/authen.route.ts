import { Router } from 'express';
import authenController from '#/controllers/authen.controller.js';
import { authenMiddleware } from '#/middlewares/authen.middleware.js';

const router = Router();

router.post('/register', authenController.register);
router.post('/login', authenController.login);
router.post('/register/google', authenController.registerWithGoogle);
router.post('/login/google', authenController.loginWithGoogle);
router.post('/reset-password', authenController.resetPassword);
router.post(
	'/reset-password/me',
	authenMiddleware,
	authenController.resetCurrentUserPassword,
);
router.patch('/reset-password/:code', authenController.changePassword);
router.post('/logout', authenController.logout);
router.get('/session', authenMiddleware, authenController.getSession);
router.get('/verify/:code', authenController.verify);
router.post('/refresh', authenController.refreshToken);

export default router;

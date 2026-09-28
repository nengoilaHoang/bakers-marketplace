import { Router } from 'express';
import authenController from '#/controllers/authen.controller.js';

const router = Router();

router.post('/register', authenController.register);
router.post('/login', authenController.login);
router.post('/logout', authenController.logout);
router.get('/verify/:code', authenController.verify);

export default router;

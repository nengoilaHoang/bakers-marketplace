import { Router } from 'express';

import adminPostController from '#/controllers/admin-posts.controller.js';
import adminRecipeController from '#/controllers/admin-recipes.controller.js';
import adminUserController from '#/controllers/admin-users.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';

const router = Router();

router.use(authenMiddleware, validateRole(['ADMIN']));

// posts (?status=&reported=true&keyword=&page=&pageSize=)
router.get('/posts', adminPostController.getPage);
router.get('/posts/:id', adminPostController.getById);
router.post('/posts/:id/remove', adminPostController.remove);
router.post('/posts/:id/restore', adminPostController.restore);
router.post('/posts/:id/reports/dismiss', adminPostController.dismissReports);

// recipes (?keyword=&page=&pageSize=): public recipes, read-only
router.get('/recipes', adminRecipeController.getPage);
router.get('/recipes/:id', adminRecipeController.getById);

// users (?role=&status=&reported=true&keyword=&page=&pageSize=)
router.get('/users', adminUserController.getPage);
router.get('/users/:id', adminUserController.getById);
router.post('/users/:id/warn', adminUserController.warn);
router.post('/users/:id/ban', adminUserController.ban);
router.post('/users/:id/unban', adminUserController.unban);
router.post('/users/:id/reports/dismiss', adminUserController.dismissReports);

// a single report, of any kind
router.post('/reports/:id/dismiss', adminUserController.dismissReport);

// vendors (?status=&keyword=&page=&pageSize=); a vendor is banned through /users/:id/ban
router.get('/vendors', adminUserController.getVendorPage);


export default router;

import { Router } from 'express';

import postController from '#/controllers/posts.controller.js';
import {
	authenMiddleware,
	optionalAuthenMiddleware,
} from '#/middlewares/authen.middleware.js';

const router = Router();

// Đặt trước '/:id' để 'search', 'mine', 'saved', 'user' không bị hiểu là id.
router.get('/search', optionalAuthenMiddleware, postController.search);
router.get('/mine', authenMiddleware, postController.getMine);
router.get('/saved', authenMiddleware, postController.getSaved);
router.get('/user/:userId', optionalAuthenMiddleware, postController.getByUserId);

router.get('/', optionalAuthenMiddleware, postController.getPosts);
router.post('/', authenMiddleware, postController.create);

router.get('/:id', optionalAuthenMiddleware, postController.getById);
router.patch('/:id', authenMiddleware, postController.update);
router.delete('/:id', authenMiddleware, postController.delete);

// likes
router.post('/:id/like', authenMiddleware, postController.like);
router.delete('/:id/like', authenMiddleware, postController.unlike);

// saves
router.post('/:id/save', authenMiddleware, postController.save);
router.delete('/:id/save', authenMiddleware, postController.unsave);

// reports
router.post('/:id/reports', authenMiddleware, postController.report);

// comments
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', authenMiddleware, postController.createComment);
router.delete(
	'/:id/comments/:commentId',
	authenMiddleware,
	postController.deleteComment,
);

export default router;

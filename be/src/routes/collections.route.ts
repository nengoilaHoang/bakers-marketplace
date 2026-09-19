import { Router } from 'express';

import collectionController from '#/controllers/collections.controller.js';

const router = Router();

// Đặt trước '/:id' để 'slug' không bị hiểu là id.
router.get('/slug/:slug', collectionController.getBySlug);

router.get('/', collectionController.getAll);
router.post('/', collectionController.create);

router.get('/:id', collectionController.getById);
router.patch('/:id', collectionController.update);
router.delete('/:id', collectionController.delete);

router.get('/:id/products', collectionController.getProducts);

export default router;

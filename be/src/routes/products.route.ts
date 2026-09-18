import { Router } from 'express';

import productController from '#/controllers/products.controller.js';

const router = Router();

// Đặt trước '/:id' để 'search' và 'slug' không bị hiểu là id.
router.get('/search', productController.search);
router.get('/slug/:slug', productController.getBySlug);
router.get('/brand/:brandId', productController.getByBrandId);

router.get('/', productController.getAll);
router.post('/', productController.create);

router.get('/:id', productController.getById);
router.patch('/:id', productController.update);
router.delete('/:id', productController.delete);

// media
router.post('/:id/images', productController.addImage);
router.put('/:id/images', productController.reorderImages);
router.delete('/:id/images/:imageId', productController.removeImage);

// notes
router.post('/:id/notes', productController.addNote);
router.patch('/:id/notes/:noteId', productController.updateNote);
router.delete('/:id/notes/:noteId', productController.removeNote);

// tags
router.post('/:id/tags', productController.addTag);
router.patch('/:id/tags/:tagId', productController.updateTag);
router.delete('/:id/tags/:name', productController.removeTag);

// stock
router.patch('/:id/stock', productController.updateStock);
router.put('/:id/stock/alerts', productController.setAlert);
router.delete(
	'/:id/stock/alerts/:alertType',
	productController.removeAlert,
);

// collections
router.post(
	'/:id/collections',
	productController.assignToCollection,
);
router.delete(
	'/:id/collections/:collectionId',
	productController.removeFromCollection,
);

export default router;

import layoutComponentController from '#/controllers/layout-components.controller.js';
import e from 'express';

const router = e.Router();

router.delete('/batch', layoutComponentController.deleteBatch);

export default router;

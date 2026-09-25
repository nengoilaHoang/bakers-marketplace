import pageLayoutController from '#/controllers/page-layouts.controller.js';
import e from 'express';

const router = e.Router();

router.put('/:id', pageLayoutController.update);

export default router;

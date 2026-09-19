import { Router } from 'express';

import recipesRouter from '#/routes/recipes.route.js';
import storefrontsRouter from '#/routes/storefronts.route.js';

const router = Router();

router.use('/recipes', recipesRouter);
router.use('/storefronts', storefrontsRouter);

export default router;

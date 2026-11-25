import layoutComponentController from '#/controllers/layout-components.controller.js';
import {
	authenMiddleware,
	validateRole,
} from '#/middlewares/authen.middleware.js';
import {
	availableFilters,
	DEFAULT_VIDEO_LIMITS,
	handleAnyUpload,
} from '#/middlewares/multer.middleware.js';
import { processMultiform } from '#/middlewares/process-multiform.middleware.js';
import {
	NotAcceptableError,
	UnsupportedMediaTypeError,
} from '#/utils/http-errors.js';
import e from 'express';

const router = e.Router();

router.use(authenMiddleware, validateRole(['VENDOR']));

router.put(
  '/batch',
  (req, _, next) => {
    if (!req.is(['application/json', 'multipart/form-data']))
      throw new UnsupportedMediaTypeError('Unsupported media type');

    if (!req.accepts(['application/json', 'multipart/form-data']))
      throw new NotAcceptableError(
        'Only application/json and multipart/form-data are acceptable',
      );

    next();
  },
  handleAnyUpload({
    limits: DEFAULT_VIDEO_LIMITS,
    filter: availableFilters.MEDIA_ONLY,
  }),
  (req, _, next) => {
    if (typeof req.body?.components === 'string') {
      try {
        req.body.components = JSON.parse(req.body.components);
      } catch (error) {
        return next(error); // or throw new BadRequestError('Invalid JSON in components')
      }
    }

    next();
  },
  processMultiform,
  layoutComponentController.saveBatch,
);
router.delete('/batch', layoutComponentController.deleteBatch);

export default router;

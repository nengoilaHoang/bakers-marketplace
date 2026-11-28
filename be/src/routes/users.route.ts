import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenMiddleware, optionalAuthenMiddleware } from '#/middlewares/authen.middleware.js';
import userSocialController from '#/controllers/user-social.controller.js';
import type { OptionalAuthenticatedRequest } from '#/types/request.types.js';
import { sameOriginJsonMiddleware } from '#/middlewares/same-origin-json.middleware.js';
import { UserProfileUpdateSchema } from '#/models/users/user-profile.model.js';
import userProfileService from '#/services/users/user-profile.service.js';

const router = Router();
const reportLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req: OptionalAuthenticatedRequest) => req.user!.id,
  message: { message: 'Bạn gửi báo cáo quá nhanh. Vui lòng thử lại sau.' },
});

router.get('/me/settings', authenMiddleware, async (req: OptionalAuthenticatedRequest, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ data: await userProfileService.getSettings(req.user!.id) });
});

router.get('/:userId', optionalAuthenMiddleware, userSocialController.getProfile);

router.use(authenMiddleware);
router.use(sameOriginJsonMiddleware);

router.patch('/me', async (req: OptionalAuthenticatedRequest, res) => {
  const payload = UserProfileUpdateSchema.parse(req.body);
  res.set('Cache-Control', 'no-store');
  res.json({ data: await userProfileService.update(req.user!.id, payload) });
});

router.post('/:userId/follow', userSocialController.follow);

router.delete('/:userId/follow', userSocialController.unfollow);

router.post('/:userId/reports', reportLimit, userSocialController.report);

export default router;

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenMiddleware, optionalAuthenMiddleware } from '#/middlewares/authen.middleware.js';
import { UserReportCreateSchema, UserSocialParamsSchema } from '#/models/users/user-social.model.js';
import userSocialService from '#/services/users/user-social.service.js';
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

router.get('/:userId', optionalAuthenMiddleware, async (req: OptionalAuthenticatedRequest, res) => {
  const { userId } = UserSocialParamsSchema.parse(req.params);
  res.json({ data: await userSocialService.getProfile(userId, req.user?.id) });
});

router.use(authenMiddleware);
router.use(sameOriginJsonMiddleware);

router.patch('/me', async (req: OptionalAuthenticatedRequest, res) => {
  const payload = UserProfileUpdateSchema.parse(req.body);
  res.set('Cache-Control', 'no-store');
  res.json({ data: await userProfileService.update(req.user!.id, payload) });
});

router.post('/:userId/follow', async (req: OptionalAuthenticatedRequest, res) => {
  const { userId } = UserSocialParamsSchema.parse(req.params);
  res.json({ data: await userSocialService.setFollow(req.user!.id, userId, true) });
});

router.delete('/:userId/follow', async (req: OptionalAuthenticatedRequest, res) => {
  const { userId } = UserSocialParamsSchema.parse(req.params);
  res.json({ data: await userSocialService.setFollow(req.user!.id, userId, false) });
});

router.post('/:userId/reports', reportLimit, async (req: OptionalAuthenticatedRequest, res) => {
  const { userId } = UserSocialParamsSchema.parse(req.params);
  const payload = UserReportCreateSchema.parse(req.body);
  res.status(201).json({ data: await userSocialService.report(req.user!.id, userId, payload) });
});

export default router;

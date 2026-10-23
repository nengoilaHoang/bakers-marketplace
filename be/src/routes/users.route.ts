import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenMiddleware, optionalAuthenMiddleware } from '#/middlewares/authen.middleware.js';
import { UserReportCreateSchema, UserSocialParamsSchema } from '#/models/users/user-social.model.js';
import userSocialService from '#/services/users/user-social.service.js';
import type { OptionalAuthenticatedRequest } from '#/types/request.types.js';

const router = Router();
const reportLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req: OptionalAuthenticatedRequest) => req.user!.id,
  message: { message: 'Bạn gửi báo cáo quá nhanh. Vui lòng thử lại sau.' },
});

router.get('/:userId', optionalAuthenMiddleware, async (req: OptionalAuthenticatedRequest, res) => {
  const { userId } = UserSocialParamsSchema.parse(req.params);
  res.json({ data: await userSocialService.getProfile(userId, req.user?.id) });
});

router.use(authenMiddleware);
router.use((req, res, next) => {
  // JSON-only mutations plus Fetch Metadata reject cross-site cookie requests,
  // including same-site sibling origins which SameSite cookies alone would allow.
  const fetchSite = req.get('Sec-Fetch-Site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    res.status(403).json({ message: 'Yêu cầu phải được gửi từ cùng website.' });
    return;
  }
  // req.is() returns null for bodyless DELETE even when the header is present.
  if (req.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    res.status(415).json({ message: 'Yêu cầu phải dùng application/json.' });
    return;
  }
  next();
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

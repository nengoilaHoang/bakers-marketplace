import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenMiddleware } from '#/middlewares/authen.middleware.js';
import { sameOriginJsonMiddleware } from '#/middlewares/same-origin-json.middleware.js';
import { ChangeEmailConfirmationSchema, ChangeEmailRequestSchema, ChangeEmailTokenSchema } from '#/models/users/user-profile.model.js';
import emailChangeService from '#/services/authen/email-change.service.js';
import type { OptionalAuthenticatedRequest } from '#/types/request.types.js';

const router = Router();
const requestLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req: OptionalAuthenticatedRequest) => req.user!.id,
  message: { message: 'Bạn yêu cầu đổi email quá nhanh. Vui lòng thử lại sau 15 phút.' },
});
const tokenLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Có quá nhiều yêu cầu xác minh. Vui lòng thử lại sau.' },
});

router.use(sameOriginJsonMiddleware);
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

router.post('/', authenMiddleware, requestLimit, async (req: OptionalAuthenticatedRequest, res) => {
  const { newEmail } = ChangeEmailRequestSchema.parse(req.body);
  await emailChangeService.start(req.user!.id, newEmail);
  res.status(202).json({ message: 'Đã gửi liên kết xác nhận đến email hiện tại. Liên kết có hiệu lực trong 15 phút.' });
});

router.post('/inspect', tokenLimit, async (req, res) => {
  const { token } = ChangeEmailTokenSchema.parse(req.body);
  res.json({ data: await emailChangeService.inspect(token) });
});

router.post('/confirm-current', tokenLimit, async (req, res) => {
  const { token, newEmail } = ChangeEmailConfirmationSchema.parse(req.body);
  await emailChangeService.confirmCurrent(token, newEmail);
  res.status(202).json({ message: 'Đã xác nhận email hiện tại. Hãy mở email mới và dùng liên kết xác minh trong 15 phút.' });
});

router.post('/complete', tokenLimit, async (req, res) => {
  const { token } = ChangeEmailTokenSchema.parse(req.body);
  res.json({ data: await emailChangeService.complete(token), message: 'Đổi email thành công.' });
});

export default router;

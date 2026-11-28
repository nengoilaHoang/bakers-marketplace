import type { Response } from 'express';
import type { AuthenticatedRequest, OptionalAuthenticatedRequest } from '#/types/request.types.js';
import { UserReportCreateSchema, UserSocialParamsSchema } from '#/models/users/user-social.model.js';
import userSocialService from '#/services/users/user-social.service.js';
import asyncHandler from '#/utils/asyncHandler.js';

class UserSocialController {
  public getProfile = asyncHandler(async (req: OptionalAuthenticatedRequest, res: Response) => {
    const { userId } = UserSocialParamsSchema.parse(req.params);
    res.set('Cache-Control', 'private, no-store');
    res.json({ data: await userSocialService.getProfile(userId, req.user?.id) });
  });

  public follow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = UserSocialParamsSchema.parse(req.params);
    res.json({ data: await userSocialService.setFollow(req.user.id, userId, true) });
  });

  public unfollow = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = UserSocialParamsSchema.parse(req.params);
    res.json({ data: await userSocialService.setFollow(req.user.id, userId, false) });
  });

  public report = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = UserSocialParamsSchema.parse(req.params);
    const payload = UserReportCreateSchema.parse(req.body);
    res.status(201).json({ data: await userSocialService.report(req.user.id, userId, payload) });
  });
}

export default new UserSocialController();

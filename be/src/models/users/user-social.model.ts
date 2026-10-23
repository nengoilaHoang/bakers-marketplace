import { z } from 'zod';

export const UserSocialParamsSchema = z.object({
  userId: z.uuidv4().transform((value) => value.toLowerCase()),
});

export const UserReportCreateSchema = z.object({
  reason: z.enum(['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'IMPERSONATION', 'OTHER']),
  description: z.string().trim().max(2000).optional(),
}).strict();

export type UserReportCreate = z.infer<typeof UserReportCreateSchema>;

export type PublicUserProfile = {
  id: string;
  displayName: string;
  createdAt: Date;
  followerCount: number;
  followingCount: number;
  following: boolean;
};

export type UserFollowStatus = { following: boolean; followerCount: number };
export type UserReportReceipt = { id: string; status: 'OPEN' };

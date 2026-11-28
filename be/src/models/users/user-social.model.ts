import { z } from 'zod';
import { Report, ReportCreateSchema, type ReportData } from '#/models/moderation/reports.model.js';

export const UserSocialParamsSchema = z.object({
  userId: z.uuidv4().transform((value) => value.toLowerCase()),
});

export const UserReportCreateSchema = ReportCreateSchema;

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
export class ReportUser extends Report {
  target: { id: string };

  constructor(data: ReportData & { target: { id: string } }) {
    super(data);
    this.target = data.target;
  }
}

export type UserReportReceipt = Pick<ReportUser, 'id' | 'status'>;

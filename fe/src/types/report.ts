export type ReportStatus = 'PENDING' | 'DISMISSED' | 'RESOLVED';
export type Report = {
  id: string;
  reporter: { id: string } | null;
  reason: string;
  createAt: string;
  status: ReportStatus;
  handledBy: { id: string } | null;
  handledAt: string | null;
  note: string | null;
  description: string | null;
};

export type ReportUser = Report & { target: { id: string } };
export type UserReportReceipt = Pick<ReportUser, 'id' | 'status'>;

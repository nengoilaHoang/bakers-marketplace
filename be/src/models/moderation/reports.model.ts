import { z } from 'zod';

export const EReportStatus = { PENDING: 'PENDING', DISMISSED: 'DISMISSED', RESOLVED: 'RESOLVED' } as const;
export const ReportStatusSchema = z.enum(EReportStatus);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;
export const ReportUserReferenceSchema = z.object({ id: z.uuidv4() });
export const ReportSchema = z.object({
  id: z.uuidv4(),
  reporter: ReportUserReferenceSchema.nullable(),
  reason: z.string().trim().min(1).max(500),
  createAt: z.date(),
  status: ReportStatusSchema,
  handledBy: ReportUserReferenceSchema.nullable(),
  handledAt: z.date().nullable(),
  note: z.string().nullable(),
  // Existing reporter context is distinct from the moderator's note.
  description: z.string().nullable(),
});
export type ReportData = z.infer<typeof ReportSchema>;
export const ReportCreateSchema = ReportSchema.pick({ reason: true }).extend({
  description: z.string().trim().max(2000).optional(),
}).strict();

export class Report implements ReportData {
  id!: string;
  reporter!: ReportData['reporter'];
  reason!: string;
  createAt!: Date;
  status!: ReportStatus;
  handledBy!: ReportData['handledBy'];
  handledAt!: Date | null;
  note!: string | null;
  description!: string | null;

  constructor(data: ReportData) { Object.assign(this, data); }
}

export type ReportRow = {
  id: string;
  reporterId: string | null;
  reason: string;
  createdAt: Date;
  status: ReportStatus;
  handledBy: string | null;
  handledAt: Date | null;
  note: string | null;
  description: string | null;
};

export function reportDataFromRow(row: ReportRow): ReportData {
  return {
    id: row.id,
    reporter: row.reporterId ? { id: row.reporterId } : null,
    reason: row.reason,
    createAt: row.createdAt,
    status: row.status,
    handledBy: row.handledBy ? { id: row.handledBy } : null,
    handledAt: row.handledAt,
    note: row.note,
    description: row.description,
  };
}

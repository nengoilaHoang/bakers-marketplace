import type { Knex } from 'knex';
import { EReportStatus, type ReportRow } from '#/models/moderation/reports.model.js';

class ReportDAO {
  public async create(trx: Knex.Transaction, reporterId: string, reason: string, description?: string): Promise<ReportRow> {
    const [row] = await trx<ReportRow>('reports').insert({
      reporterId, reason, description: description || null, status: EReportStatus.PENDING,
      handledBy: null, handledAt: null, note: null,
    }).returning('*');
    return row;
  }
}

export default new ReportDAO();

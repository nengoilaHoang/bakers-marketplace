import type { Knex } from 'knex';
import { Image, ImageSchema } from '#/models/images.model.js';
import type { RatingCreate, RatingUpdate } from '#/models/ratings/ratings.model.js';
import { BadRequestError } from '#/utils/http-errors.js';

class RatingDAO {
  public async create(trx: Knex.Transaction, raterId: string, data: RatingCreate): Promise<string> {
    const [row] = await trx('ratings').insert({ raterId, rating: data.rating, comment: data.comment ?? null }).returning('id');
    await this.setMedia(trx, row.id, data.mediaIds ?? []);
    return row.id;
  }

  public async update(trx: Knex.Transaction, id: string, data: RatingUpdate): Promise<number> {
    const changes: Record<string, unknown> = { updatedAt: trx.fn.now() };
    if (data.rating !== undefined) changes.rating = data.rating;
    if (data.comment !== undefined) changes.comment = data.comment;
    const affected = await trx('ratings').where({ id }).update(changes);
    if (affected && data.mediaIds !== undefined) await this.setMedia(trx, id, data.mediaIds);
    return affected;
  }

  public async delete(trx: Knex.Transaction, id: string): Promise<number> {
    return trx('ratings').where({ id }).delete();
  }

  public async getMedia(trx: Knex.Transaction, ratingIds: string[]): Promise<Map<string, Image[]>> {
    const result = new Map<string, Image[]>();
    if (!ratingIds.length) return result;
    const rows = await trx('rating_media as rm').join('images as i', 'i.id', 'rm.imageId')
      .select('i.*', 'rm.ratingId').whereIn('rm.ratingId', ratingIds).orderBy('rm.sortOrder');
    for (const row of rows) {
      const media = result.get(row.ratingId) ?? [];
      media.push(new Image(ImageSchema.parse(row)));
      result.set(row.ratingId, media);
    }
    return result;
  }

  private async setMedia(trx: Knex.Transaction, ratingId: string, imageIds: string[]): Promise<void> {
    if (imageIds.length) {
      const images = await trx('images').select('id').whereIn('id', imageIds).forKeyShare();
      if (images.length !== imageIds.length) throw new BadRequestError('Một hoặc nhiều ảnh không tồn tại.');
    }
    await trx('rating_media').where({ ratingId }).delete();
    if (imageIds.length) {
      await trx('rating_media').insert(imageIds.map((imageId, sortOrder) => ({ ratingId, imageId, sortOrder })));
    }
  }
}

export default new RatingDAO();

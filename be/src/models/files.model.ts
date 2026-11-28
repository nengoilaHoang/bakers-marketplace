import { z } from 'zod';

// File metadata is currently stored in images; inheritance need not split tables.
export const FileSchema = z.object({
  id: z.uuidv4().readonly(),
  displayName: z.string().nullable(),
  originalName: z.string().nullable(),
  url: z.url().max(2048),
  contentType: z.string().nullable(),
  extName: z.string().nullable(),
  size: z.union([z.string().regex(/^\d+$/), z.number().int().nonnegative()])
    .nullable().transform((value) => value === null ? null : String(value)),
  checksum: z.string().nullable(),
  uploadedAt: z.date().nullable(),
});
export type FileData = z.infer<typeof FileSchema>;

export class File implements FileData {
  id!: string;
  displayName!: string | null;
  originalName!: string | null;
  url!: string;
  contentType!: string | null;
  extName!: string | null;
  size!: string | null;
  checksum!: string | null;
  uploadedAt!: Date | null;

  constructor(data: FileData) { Object.assign(this, data); }
}

import layoutComponentDao, {
	LayoutComponentDao,
} from '#/daos/layouts/layout-components.dao.js';

import {
	BatchLayoutComponentPayload,
	BatchLayoutComponentPayloadSchema,
	PutLayoutComponent,
} from '#/models/layout-components/layout-components.model.js';
import { UnprocessableEntityError } from '#/utils/http-errors.js';
import { z } from 'zod';
import s3Service, { S3Service } from './s3.service.js';

export class LayoutComponentService {
  constructor(
    private readonly layoutComponentDao: LayoutComponentDao,
    private readonly s3Service: S3Service,
  ) {}

  private readonly resolveComponentFiles = async (
    components: PutLayoutComponent[],
  ): Promise<PutLayoutComponent[]> => {
    const files = this.extractFiles(components);
    if (files.length === 0) {
      return components;
    }

    const uploadResults = await this.s3Service.uploadFiles(files);
    const fileUrlMap = new Map<File, string>();
    const failures: string[] = [];

    uploadResults.forEach((result, index) => {
      const file = files[index];
      if (result.status === 'fulfilled') {
        fileUrlMap.set(file, result.value.cloudfrontUrl);
      } else {
        failures.push(`${file.name}: ${String(result.reason)}`);
      }
    });

    if (failures.length > 0) {
      const uploadedFileKey = [...fileUrlMap.keys()].map(
        (f) => `community/${f.name}`,
      );
      await Promise.all(
        uploadedFileKey.map((key) => this.s3Service.deleteFile(key)),
      );

      throw new Error(
        `Failed to upload component files:\n${failures.join('\n')}`,
      );
    }

    return this.replaceFiles(components, fileUrlMap);
  };

  private readonly extractFiles = (
    node: unknown,
    collected: Set<File> = new Set(),
  ): File[] => {
    if (node instanceof File) {
      collected.add(node);
      return Array.from(collected);
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        this.extractFiles(item, collected);
      }
      return Array.from(collected);
    }

    if (this.isPlainObject(node)) {
      for (const value of Object.values(node)) {
        this.extractFiles(value, collected);
      }
    }

    return Array.from(collected);
  };

  private readonly replaceFiles = <T>(
    node: T,
    fileUrlMap: Map<File, string>,
  ): T => {
    if (node instanceof File) {
      const url = fileUrlMap.get(node);
      if (!url) {
        throw new Error(`Missing uploaded URL for file: ${node.name}`);
      }
      return url as unknown as T;
    }

    if (Array.isArray(node)) {
      return node.map((item) =>
        this.replaceFiles(item, fileUrlMap),
      ) as unknown as T;
    }

    if (this.isPlainObject(node)) {
      const cloned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node)) {
        if (value instanceof File) {
          const url = fileUrlMap.get(value);
          if (!url) {
            throw new Error(`Missing uploaded URL for file: ${value.name}`);
          }
          const targetKey = /url$/i.test(key) ? key : `${key}Url`;
          cloned[targetKey] = url;
        } else {
          cloned[key] = this.replaceFiles(value, fileUrlMap);
        }
      }
      return cloned as T;
    }

    return node;
  };

  private readonly isPlainObject = (
    value: unknown,
  ): value is Record<string, unknown> => {
    return Object.prototype.toString.call(value) === '[object Object]';
  };

  public saveBatch = async (payload: BatchLayoutComponentPayload) => {
    const result = BatchLayoutComponentPayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new UnprocessableEntityError(
        `Invalid layout components payload: ${result.error}`,
      );
    }
    const { components, deleteIds } = result.data;
    if (!components?.length && !deleteIds?.length) {
      throw new UnprocessableEntityError(
        'No layout components or delete IDs provided',
      );
    }

    await this.layoutComponentDao.withTransaction(async (trx) => {
      if (components?.length) {
        await this.layoutComponentDao.upsertBatch(
          await this.resolveComponentFiles(components),
          trx,
        );
      }

      if (deleteIds?.length) {
        await this.layoutComponentDao.deleteComponents(deleteIds, trx);
      }
    });
  };

  public delete = async (ids: string[]) => {
    const result = z.uuidv4().array().safeParse(ids);
    if (!result.success) {
      throw new UnprocessableEntityError(
        `Invalid layout component IDs: ${result.error}`,
      );
    }

    await this.layoutComponentDao.deleteComponents(result.data);
  };
}

const layoutComponentService = new LayoutComponentService(
  layoutComponentDao,
  s3Service,
);
export default layoutComponentService;

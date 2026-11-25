import { BadRequestError, InternalServerError } from '#/utils/http-errors.js';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer, { FileFilterCallback, MulterError, Options } from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

type MulterMiddlewareOptions = {
  storage?: Options['storage'];
  limits?: Options['limits'];
  filter?: Options['fileFilter'];
};

const tag = '[Multer Middleware]';
const tmpDir = tmpdir();
const multerTmpDir = path.join(tmpDir, 'bmk');

const checkTempDir = async () => {
  if (!fs.existsSync(multerTmpDir)) {
    try {
      await fs.promises.mkdir(tmpDir, { recursive: true, mode: 0o700 });
      console.log(
        `${tag} Tempdir for bmk created successfully at:`,
        multerTmpDir,
      );
    } catch (e) {
      console.error(`${tag} Error creating temp dir:`, e);
      throw new InternalServerError('Failed to initialize file upload system.');
    }
  }
};

const diskStorage = multer.diskStorage({
  destination: async (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    await checkTempDir();
    cb(null, tmpDir);
  },
  filename: (_, file, callback) => {
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = path.basename(file.originalname, ext);
    const newName = Buffer.from(`${randomBytes}-${filename}`).toString(
      'base64',
    );
    callback(null, `${newName}${ext}`);
  },
});

const memoryStorage = multer.memoryStorage();

export const DEFAULT_DISK_STORAGE = diskStorage;
export const DEFAULT_MEMORY_STORAGE = memoryStorage;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 * 5;
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 * 50;

export const DEFAULT_IMAGE_LIMITS: Options['limits'] = {
  fileSize: MAX_IMAGE_SIZE, // 5MB
};
export const DEFAULT_VIDEO_LIMITS: Options['limits'] = {
  fileSize: MAX_VIDEO_SIZE, // 50MB
};

const DEFAULT_LIMITS = DEFAULT_IMAGE_LIMITS;

const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|jpg|png|webp)$/;
const ALLOWED_VIDEO_TYPES = /^video\/(mp4)$/;

export const availableFilters = {
  IMAGE_ONLY: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) return cb(null, true);
    console.error(`${tag} Invalid file type for field '${file.fieldname}'.`, {
      mimetype: file.mimetype,
      originalname: file.originalname,
    });
    const err = new BadRequestError(
      `Invalid file type for field '${file.fieldname}'. 
        Only JPEG, JPG, PNG, GIF, or WEBP images are allowed.`,
    );
    cb(err);
  },
  MEDIA_ONLY: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const mimeType = file.mimetype.toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedMimeTypes = [ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES];
    const allowedExtensions = [
      '.jpeg',
      '.jpg',
      '.png',
      '.gif',
      '.webp',
      '.mp4',
    ];

    const isAllowedType = allowedMimeTypes.some((pattern) =>
      pattern.test(mimeType),
    );
    const isAllowedExt = allowedExtensions.includes(extension);

    // Check file type
    if (isAllowedType && isAllowedExt) {
      // Check file size
      if (ALLOWED_IMAGE_TYPES.test(mimeType)) {
        if (MAX_IMAGE_SIZE < file.size) {
          const err = new BadRequestError(
            `Image file size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
          );
          return cb(err);
        }
      } else if (ALLOWED_VIDEO_TYPES.test(mimeType)) {
        if (MAX_VIDEO_SIZE < file.size) {
          const err = new BadRequestError(
            `Video file size must be less than ${MAX_VIDEO_SIZE / 1024 / 1024}MB.`,
          );
          return cb(err);
        }
      }
      return cb(null, true);
    }
    console.error(`${tag} Invalid file type for field '${file.fieldname}'.`, {
      mimetype: file.mimetype,
      originalname: file.originalname,
    });

    const err = new BadRequestError(
      `Invalid file type for field '${file.fieldname}'. 
        Only JPEG, JPG, PNG, GIF, WEBP images, MP4/AVI/MOV videos, or MP3/WAV audio files are allowed.`,
    );

    cb(err);
  },
  ANY_FILE: (
    _req: Request,
    _file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    cb(null, true);
  },
} as const;

const mapMulterErrorToAppError = (err: Error) => {
  if (err instanceof MulterError) {
    const fieldInfo = err.field ? `(Field: ${err.field})` : '';
    console.error(`${tag} Multer error:`, err);
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return new BadRequestError(`File too large.${fieldInfo}.`);
      case 'LIMIT_FILE_COUNT':
        return new BadRequestError(`Too many files.${fieldInfo}.`);
      case 'LIMIT_FIELD_KEY':
        return new BadRequestError(`Field name is too long.${fieldInfo}.`);
      case 'LIMIT_FIELD_VALUE':
        return new BadRequestError(`Field value is too long.${fieldInfo}.`);
      case 'LIMIT_FIELD_COUNT':
        return new BadRequestError(`Too many fields in the form.`);
      case 'LIMIT_UNEXPECTED_FILE':
        return new BadRequestError(
          `Unexpected file or file type not allowed.${fieldInfo}`,
        );
      case 'LIMIT_PART_COUNT':
        return new BadRequestError(
          `Form data has too many parts (fields + files).`,
        );
      default:
        return new BadRequestError(
          `File upload error: ${err.message}.${fieldInfo}`,
        );
    }
  }

  console.error(`${tag} Unknown upload error:`, err);
  return new InternalServerError(
    `An unknown error occurred during file upload. Please try again later.`,
  );
};

const createMulterInstance = (options: MulterMiddlewareOptions = {}) => {
  const storage = options.storage ?? DEFAULT_DISK_STORAGE;
  const limits = {
    ...DEFAULT_LIMITS,
    ...options.limits,
  };
  const fileFilter = options.filter;
  return multer({
    storage,
    limits,
    fileFilter,
  });
};

const wrapMulterMiddleware = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, (err) => {
      if (err) return next(mapMulterErrorToAppError(err));
      next();
    });
  };
};

export const handleSingleUpload = (
  fieldName: string,
  options?: MulterMiddlewareOptions,
) => {
  const instance = createMulterInstance(options);
  const rawMulterMdw = instance.single(fieldName);
  return wrapMulterMiddleware(rawMulterMdw);
};

export const handleAnyUpload = (options?: MulterMiddlewareOptions) => {
  const instance = createMulterInstance(options);
  const rawMulterMdw = instance.any();
  return wrapMulterMiddleware(rawMulterMdw);
};

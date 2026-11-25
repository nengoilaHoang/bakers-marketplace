import { NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import qs from 'qs';
import qt from 'query-types';

/**
 * Convert a Multer file to a Web File object. This is used so that zod can recognize the file type.
 */
const toWebFile = async (file: Express.Multer.File): Promise<File> => {
  const buffer = file.buffer ?? (await fs.promises.readFile(file.path));
  if (file.path) {
    await fs.promises.unlink(file.path).catch(() => {});
  }
  return new File(
    [new Uint8Array(buffer)],
    file.filename || file.originalname,
    {
      type: file.mimetype,
    },
  );
};

const fileToText = async (file: File) => {
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
  return JSON.stringify({
    name: file.name,
    type: file.type,
    data: `data:${file.type};base64,${base64}`,
  });
};

const textToFile = (str: string) => {
  const { name, type, data } = JSON.parse(str);
  const buffer = Buffer.from(data.split(',')[1], 'base64');
  return new File([buffer], name, { type });
};

export const processMultiform = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (req.is(['multipart/form-data'])) {
      const { body, files } = req;
      if (!files) {
        next();
        return;
      }
      const groupedFiles: Record<string, string | string[]> = {};

      if (Array.isArray(files)) {
        const texts = await Promise.all(
          files.map(async (file) => fileToText(await toWebFile(file))),
        );
        for (const [idx, text] of texts.entries()) {
          const { fieldname } = files[idx];
          const existing = groupedFiles[fieldname];

          if (existing) {
            groupedFiles[fieldname] = Array.isArray(existing)
              ? [...existing, text]
              : [existing, text];
          } else {
            groupedFiles[fieldname] = text;
          }
        }
      } else if (files) {
        for (const [key, value] of Object.entries(files)) {
          const texts = await Promise.all(
            value.map(async (file) => fileToText(await toWebFile(file))),
          );
          groupedFiles[key] = texts.length === 1 ? texts[0] : texts;
        }
      }

      const parsed = qs.parse(
        qs.stringify({ ...body, ...groupedFiles }, { allowDots: true }),
        {
          allowDots: true,
          decoder(str, defaultDecoder, charset, type) {
            const decoded = defaultDecoder(str, defaultDecoder, charset);
            if (type === 'value') {
              if (decoded.startsWith('{"name":')) {
                try {
                  return textToFile(decoded);
                } catch {
                  return decoded;
                }
              }
              if (decoded.startsWith('[')) {
                try {
                  return JSON.parse(decoded);
                } catch {
                  return decoded;
                }
              }
              return qt.parseValue(decoded);
            }
            return decoded;
          },
        },
      );

      req.body = parsed;
    }

    next();
  } catch (err) {
    next(err);
  }
};

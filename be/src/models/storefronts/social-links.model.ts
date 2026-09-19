import { z } from 'zod';
import { ImageSchema } from '../images.model.js';

export const SocialLinkTableSchema = z.object({
	id: z.uuidv4().readonly(),
	name: z.string().trim().min(3).max(255),
	url: z.url().max(2048),
	urlHash: z.string().length(64),
	logo: z.uuidv4().nullable(),
	createdAt: z.date().readonly(),
});

export const SocialLinkSchema = SocialLinkTableSchema.omit({
	urlHash: true,
	logo: true,
}).extend({
	logo: ImageSchema,
});

export type SocialLinkRow = z.infer<typeof SocialLinkTableSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;

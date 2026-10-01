import { z } from 'zod';

export const PostTagSchema = z.object({
	id: z.uuidv4().optional(),
	postId: z.uuidv4(),
	name: z.string().trim().min(1).max(50),
	createdAt: z.date().optional(),
});

export type PostTagData = z.infer<typeof PostTagSchema>;

export class PostTag implements PostTagData {
	id!: string;
	postId!: string;
	name!: string;
	createdAt?: Date;

	constructor(data?: Partial<PostTagData>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}

export type File = {
	id: string;
	displayName: string | null;
	originalName: string | null;
	url: string;
	contentType: string | null;
	extName: string | null;
	size: number | null;
	checksum: string | null;
	uploadedAt: string | null;
	createdAt: string;
}

export type Image = File & {
	width: number;
	height: number;
}

export type Document = File & {
	pageCount: number;
}

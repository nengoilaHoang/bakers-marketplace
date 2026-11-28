export type MediaFile = {
  id: string;
  displayName: string | null;
  originalName: string | null;
  url: string;
  contentType: string | null;
  extName: string | null;
  size: string | null;
  checksum: string | null;
  uploadedAt: string | null;
};

export type RatingImage = MediaFile & {
  width: number | null;
  height: number | null;
  createdAt: string;
};

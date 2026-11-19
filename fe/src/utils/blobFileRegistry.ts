const blobFileMap = new Map<string, File>();

export const registerBlobFile = (blobUrl: string, file: File): void => {
  blobFileMap.set(blobUrl, file);
};

export const getBlobFile = (blobUrl: string): File | undefined => {
  return blobFileMap.get(blobUrl);
};

export const unregisterBlobFile = (blobUrl: string): void => {
  blobFileMap.delete(blobUrl);
};

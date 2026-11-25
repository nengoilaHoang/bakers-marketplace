import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const REGION = process.env.AWS_REGION!;
const CLOUDFRONT_PREFIX = process.env.CLOUDFRONT_PREFIX!;

export class S3Service {
  private readonly s3: S3Client;
  private readonly communityPrefix: string = 'community';
  constructor(
    private readonly bucketName: string,
    private readonly region: string,
    private readonly cloudfrontPrefix: string,
  ) {
    this.s3 = new S3Client({
      region,
    });
  }

  public uploadFiles = async (files: File[]) => {
    const commands = files.map(async (file) => {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Body: Buffer.from(await file.arrayBuffer()), // avoids stream-length errors
        Key: `${this.communityPrefix}/${file.name}`,
        ContentType: file.type,
      });
      const result = await this.s3.send(command);
      return {
        ...result,
        cloudfrontUrl: `${this.cloudfrontPrefix}/${this.communityPrefix}/${file.name}`,
      };
    });

    const results = await Promise.allSettled(commands);
    return results;
  };

  public deleteFile = async (key: string) => {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return await this.s3.send(command);
  };
}

const s3Service = new S3Service(BUCKET_NAME, REGION, CLOUDFRONT_PREFIX);
export default s3Service;

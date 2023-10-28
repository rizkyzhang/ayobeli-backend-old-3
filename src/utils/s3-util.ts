/* eslint-disable class-methods-use-this */
import {
  S3,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  ListObjectsV2CommandInput,
} from "@aws-sdk/client-s3";

export class S3Util {
  constructor(private readonly s3Client: S3) {}

  getKeyFromUrl(url: string) {
    const key = url.split(`${process.env.LINODE_OBJECT_STORAGE_HOST}/`)[1];
    return key;
  }

  keyToUrl(key: string) {
    return `${process.env.LINODE_OBJECT_STORAGE_HOST}/${key}`;
  }

  async uploadFileToObjectStorage(
    file: Buffer,
    key: string,
    contentType: string
  ) {
    const params: PutObjectCommandInput = {
      Bucket: String(process.env.LINODE_OBJECT_STORAGE_BUCKET),
      Key: `${process.env.LINODE_OBJECT_STORAGE_BUCKET_ROOT}/${key}`,
      Body: file,
      ACL: "public-read",
      ContentType: contentType,
    };

    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    await this.s3Client.putObject(params);

    return `${process.env.LINODE_OBJECT_STORAGE_HOST}/${process.env.LINODE_OBJECT_STORAGE_BUCKET_ROOT}/${key}`;
  }

  async deleteFileFromObjectStorageByUrl(url: string) {
    const key = this.getKeyFromUrl(url);

    const res = await this.deleteFileFromObjectStorageByKey(key);
    return res;
  }

  async deleteFileFromObjectStorageByKey(key: string) {
    const params: DeleteObjectCommandInput = {
      Bucket: String(process.env.LINODE_OBJECT_STORAGE_BUCKET),
      Key: key,
    };

    const res = await this.s3Client.deleteObject(params);
    return res;
  }

  async listKeysFromObjectStorage(path: string) {
    const params: ListObjectsV2CommandInput = {
      Bucket: String(process.env.LINODE_OBJECT_STORAGE_BUCKET),
      Prefix: `${process.env.LINODE_OBJECT_STORAGE_BUCKET_ROOT}/${path}`,
      MaxKeys: 100,
    };

    let cycle = true;
    const keys: string[] = [];

    while (cycle) {
      const { Contents, IsTruncated, NextContinuationToken } =
        // eslint-disable-next-line no-await-in-loop
        await this.s3Client.listObjectsV2(params);

      if (Contents) {
        Contents.forEach((item) => {
          if (item.Key) {
            keys.push(item.Key);
          }
        });
      }
      if (!IsTruncated || !NextContinuationToken) {
        cycle = false;
      }
      params.ContinuationToken = NextContinuationToken;
    }

    return keys;
  }
}

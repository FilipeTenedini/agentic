import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
      ...(env.AWS_S3_ENDPOINT
        ? {
            endpoint: env.AWS_S3_ENDPOINT,
            forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
          }
        : {}),
    });
  }
  return client;
}

export async function uploadObject(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    })
  );
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await getClient().send(
      new HeadObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (err: unknown) {
    const code = (err as { name?: string })?.name;
    if (code === "NotFound" || code === "NoSuchKey") return false;
    throw err;
  }
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(getClient(), command, {
    expiresIn: env.S3_SIGNED_URL_EXPIRES_SECONDS,
  });
}

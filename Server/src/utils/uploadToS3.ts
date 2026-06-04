// src/utils/uploadToS3.ts

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/s3';
import crypto from 'crypto';

export const uploadToS3 = async (file: Express.Multer.File) => {
  const fileName = `${crypto.randomUUID()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const getPresignedUrl = async (url: string): Promise<string> => {
  if (!url || !url.includes('amazonaws.com/')) return url;

  try {
    const key = url.split('amazonaws.com/')[1];
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });
    // URL expires in 1 hour
    return await getSignedUrl(s3, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return url;
  }
};

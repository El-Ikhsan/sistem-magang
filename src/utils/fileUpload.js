import { minioClient, bucketName } from '../../config/minio.js';
import path from 'path';

const uploadFile = async (file, fileName) => {
  try {
    await minioClient.putObject(bucketName, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });

    return fileName;
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

const deleteFile = async (fileName) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    return true;
  } catch (error) {
    if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
      console.log(`File ${fileName} not found in bucket, skipping delete.`);
      return false;
    }
    console.error(`Error deleting file ${fileName}:`, error);
    return false;
  }
};

const getFileUrl = (fileName) => {
  return `${process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`}/${bucketName}/${fileName}`;
};

export { uploadFile, deleteFile, getFileUrl };

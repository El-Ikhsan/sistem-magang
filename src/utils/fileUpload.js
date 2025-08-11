import { minioClient, bucketName } from '../../config/minio.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const uploadFile = async (file, folder = '') => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}${folder ? '/' : ''}${uuidv4()}${fileExtension}`;
    
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
    console.error(`Error deleting file ${fileName}:`, error);
    return false;
  }
};

const getFileUrl = (fileName) => {
  return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
};

const generatePresignedUrl = async (fileName, expiry = 24 * 60 * 60) => {
  try {
    const url = await minioClient.presignedGetObject(bucketName, fileName, expiry);
    return url;
  } catch (error) {
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
};

export { uploadFile, deleteFile, getFileUrl, generatePresignedUrl };

import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = process.env.MINIO_BUCKET || 'internship-files';

const createBucketIfNotExists = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);

    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Bucket ${bucketName} created`);

      // Set public read-only policy
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };

      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ Public read policy set for bucket ${bucketName}`);
    } else {
      console.log(`ℹ️ Bucket ${bucketName} already exists`);
    }

  } catch (error) {
    console.error('❌ Error ensuring bucket:', error);
  }
};

export {
  minioClient,
  bucketName,
  createBucketIfNotExists
};

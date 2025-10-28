import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import config from "../config/config.js";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl as getAwsSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: config.AWS_REGION,
  endpoint: "https://s3.ap-south-1.amazonaws.com", // ✅ Correct regional endpoint
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Upload File
export async function uploadFile(file) {
  try {
    const key = `${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: "devanshu-project-bucket", // ✅ Your bucket name
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);
    console.log(`✅ File uploaded successfully: ${key}`);
    return key;
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw new Error("File upload failed");
  }
}

// ✅ Generate Signed URL for File Access
export async function getSignedUrlForAccess(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: "devanshu-project-bucket",
      Key: key,
    });

    const signedUrl = await getAwsSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error("❌ Signed URL error:", error);
    throw new Error("Failed to generate signed URL");
  }
}

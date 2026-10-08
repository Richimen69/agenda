import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// =========================================================
// 1. CLIENTE ORIGINAL (Para los tickets)
// =========================================================
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadFileToR2 = async (file) => {
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const fileName = `${Date.now()}-${uniqueId}-${file.originalname.replace(/\s+/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME, // Apunta al bucket de tickets
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error("[R2 Storage] Error subiendo archivo:", error);
    throw new Error("Error al subir el archivo a la nube");
  }
};

// =========================================================
// 2. NUEVO CLIENTE (Exclusivo para el Knowledge Hub)
// =========================================================
const knowledgeS3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const generatePresignedUrl = async (fileName, fileType) => {
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const fileKey = `${Date.now()}-${uniqueId}-${fileName.replace(/\s+/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_KNOWLEDGE_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    // Usamos el NUEVO cliente aquí
    const presignedUrl = await getSignedUrl(knowledgeS3Client, command, {
      expiresIn: 900,
    });

    const publicUrl = `${process.env.R2_KNOWLEDGE_PUBLIC_URL}/${fileKey}`;

    return { presignedUrl, fileKey, publicUrl };
  } catch (error) {
    console.error("[R2 Storage] Error generando Presigned URL:", error);
    throw new Error("Error al generar enlace de subida");
  }
};

// =========================================================
// 3. ELIMINAR ARCHIVO
// =========================================================
export const deleteFileFromR2 = async (fileKey) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_KNOWLEDGE_BUCKET_NAME,
    Key: fileKey,
  });

  try {
    // Ahora sí encontrará el cliente sin problema
    await knowledgeS3Client.send(command);
    return true;
  } catch (error) {
    console.error("[R2 Storage] Error eliminando archivo:", error);
    throw new Error("Error al eliminar el archivo de la nube");
  }
};

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// 1. TU FUNCIÓN ACTUAL PARA TICKETS (Intacta)
export const uploadFileToR2 = async (file) => {
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const fileName = `${Date.now()}-${uniqueId}-${file.originalname.replace(/\s+/g, '_')}`;

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
// 2. NUEVA FUNCIÓN: Para el Knowledge Hub (Apunta al nuevo Bucket)
// =========================================================
export const generatePresignedUrl = async (fileName, fileType) => {
  const uniqueId = crypto.randomBytes(8).toString("hex");
  // Como ya es un bucket dedicado, no necesitamos subcarpetas, pero limpiamos el nombre
  const fileKey = `${Date.now()}-${uniqueId}-${fileName.replace(/\s+/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_KNOWLEDGE_BUCKET_NAME, // <--- APUNTA AL NUEVO BUCKET
    Key: fileKey,
    ContentType: fileType,
  });

  try {
    // Generamos la URL que expira en 15 minutos (900 segundos)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    
    // Construimos la URL pública usando la variable del nuevo bucket
    const publicUrl = `${process.env.R2_KNOWLEDGE_PUBLIC_URL}/${fileKey}`; // <--- NUEVA URL PÚBLICA

    return { presignedUrl, fileKey, publicUrl };
  } catch (error) {
    console.error("[R2 Storage] Error generando Presigned URL:", error);
    throw new Error("Error al generar enlace de subida");
  }
};
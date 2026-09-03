import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Configuración del cliente S3 apuntando a Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Sube un archivo a Cloudflare R2 y devuelve la URL pública
 */
export const uploadFileToR2 = async (file) => {
  // Generamos un nombre único para evitar sobreescribir archivos con el mismo nombre
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const fileName = `${Date.now()}-${uniqueId}-${file.originalname.replace(/\s+/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer, // El archivo en memoria (gracias a Multer)
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
    // Retornamos la URL pública para guardarla en la Base de Datos
    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error("[R2 Storage] Error subiendo archivo:", error);
    throw new Error("Error al subir el archivo a la nube");
  }
};
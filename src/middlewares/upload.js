import multer from "multer";

// Usamos memoryStorage para no saturar el disco del servidor
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10 MB por archivo
  },
});
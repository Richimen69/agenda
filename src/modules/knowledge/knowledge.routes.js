import { Router } from 'express';
import { getUploadUrl, createDocument, getDocuments, getCategories, getSidebarMenu, createCategory, updateCategory, deleteCategory, getCategoryById  } from './knowledge.controller.js';

const router = Router();

router.post('/upload-url', getUploadUrl);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.post('/documents', createDocument);
router.get('/documents', getDocuments);
router.get('/sidebar-menu', getSidebarMenu);

export default router;
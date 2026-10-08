import { Router } from 'express';
import { getUploadUrl, createDocument, getDocuments, getCategories, getSidebarMenu, createCategory, updateCategory, deleteCategory, getCategoryById, deleteDocument, searchKnowledge, createVehicle, deleteVehicle, getVehiclesByCategory, updateVehicle, getVehicles, updateDocument } from './knowledge.controller.js';
import { verifyToken } from '../../shared/auth/auth.middleware.js';

const router = Router();

router.get('/sidebar-menu', getSidebarMenu);
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.get('/documents', getDocuments);
router.get('/search', searchKnowledge);
router.post('/upload-url', verifyToken, getUploadUrl);
router.post('/documents', verifyToken, createDocument);
router.delete('/documents/:id', verifyToken, deleteDocument);
router.post('/categories', verifyToken, createCategory);
router.put('/categories/:id', verifyToken, updateCategory);
router.delete('/categories/:id', verifyToken, deleteCategory);
router.post('/vehicles', verifyToken, createVehicle);
router.delete('/vehicles/:id', verifyToken, deleteVehicle);
router.get('/vehicles/category', getVehiclesByCategory);
router.put('/vehicles/:id', verifyToken, updateVehicle);
router.get('/vehicles', getVehicles);
router.put('/documents/:id', verifyToken, updateDocument);

export default router;
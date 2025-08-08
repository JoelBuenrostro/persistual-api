import { Router } from 'express';
import {
  createCategoryHandler,
  getCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Rutas para gestión de categorías.
 * Todas protegidas con JWT (authMiddleware).
 */
router.post('/categories', authMiddleware, createCategoryHandler);
router.get('/categories', authMiddleware, getCategoriesHandler);
router.get('/categories/:id', authMiddleware, getCategoryByIdHandler);
router.put('/categories/:id', authMiddleware, updateCategoryHandler);
router.delete('/categories/:id', authMiddleware, deleteCategoryHandler);

export default router;

import { Router } from 'express';
import {
  createCategoryHandler,
  getCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/category.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/requireAdmin.middleware';

const router = Router();

/**
 * Rutas para gestión de categorías.
 * Todas protegidas con JWT (authMiddleware).
 */
router.post('/categories', authMiddleware, requireAdmin, createCategoryHandler);
router.get('/categories', authMiddleware, getCategoriesHandler);
router.get('/categories/:id', authMiddleware, getCategoryByIdHandler);
router.put(
  '/categories/:id',
  authMiddleware,
  requireAdmin,
  updateCategoryHandler,
);
router.delete(
  '/categories/:id',
  authMiddleware,
  requireAdmin,
  deleteCategoryHandler,
);

export default router;

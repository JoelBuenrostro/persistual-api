import { Router } from 'express';
import {
  createCategoryHandler,
  getCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/category.controller';

const router = Router();

router.post('/categories', createCategoryHandler);
router.get('/categories', getCategoriesHandler);
router.get('/categories/:id', getCategoryByIdHandler);
router.put('/categories/:id', updateCategoryHandler);
router.delete('/categories/:id', deleteCategoryHandler);

export default router;

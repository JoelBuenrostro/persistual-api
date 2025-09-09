import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { CategoryDTO } from '../models/Category';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../services/category.service';
import { HttpError } from '../services/user.service';

// Función auxiliar para manejo de errores
function handleControllerError(
  err: unknown,
  res: Response,
  req: Request,
): void {
  if (Array.isArray(err)) {
    const errors = err.flatMap(e =>
      e.constraints ? Object.values(e.constraints) : [],
    );
    res.status(400).json({ errors });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: req.t('error_internal') });
}

/**
 * Crea una nueva categoría
 * POST /api/categories
 */
export const createCategoryHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto = plainToInstance(CategoryDTO, req.body);
    await validateOrReject(dto);

    const cat = createCategory(dto);
    res.status(201).json(cat);
  } catch (err: unknown) {
    handleControllerError(err, res, req);
  }
};

/**
 * Obtiene todas las categorías
 * GET /api/categories
 */
export const getCategoriesHandler = (_req: Request, res: Response): void => {
  const list = getCategories();
  res.json(list);
};

/**
 * Obtiene una categoría por ID
 * GET /api/categories/:id
 */
export const getCategoryByIdHandler = (req: Request, res: Response): void => {
  try {
    const cat = getCategoryById(req.params.id);
    res.json(cat);
  } catch (err: unknown) {
    handleControllerError(err, res, req);
  }
};

/**
 * Actualiza una categoría existente
 * PUT /api/categories/:id
 */
export const updateCategoryHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto = plainToInstance(CategoryDTO, req.body);
    await validateOrReject(dto);

    const cat = updateCategory(req.params.id, dto);
    res.json(cat);
  } catch (err: unknown) {
    handleControllerError(err, res, req);
  }
};

/**
 * Elimina una categoría por ID
 * DELETE /api/categories/:id
 */
export const deleteCategoryHandler = (req: Request, res: Response): void => {
  try {
    deleteCategory(req.params.id);
    res.sendStatus(204);
  } catch (err: unknown) {
    handleControllerError(err, res, req);
  }
};

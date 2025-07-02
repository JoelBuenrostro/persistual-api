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

/**
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
    return;
  } catch (err: unknown) {
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
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * GET /api/categories
 */
export const getCategoriesHandler = (_req: Request, res: Response): void => {
  const list = getCategories();
  res.json(list);
};

/**
 * GET /api/categories/:id
 */
export const getCategoryByIdHandler = (req: Request, res: Response): void => {
  try {
    const cat = getCategoryById(req.params.id);
    res.json(cat);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
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
    return;
  } catch (err: unknown) {
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
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * DELETE /api/categories/:id
 */
export const deleteCategoryHandler = (req: Request, res: Response): void => {
  try {
    deleteCategory(req.params.id);
    res.sendStatus(204);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

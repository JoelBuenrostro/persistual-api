import { RequestHandler } from 'express';
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

export const createCategoryHandler: RequestHandler = async (req, res) => {
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
    res.status(500).json({ message: 'Error interno' });
  }
};

export const getCategoriesHandler: RequestHandler = (_req, res) => {
  const list = getCategories();
  res.json(list);
};

export const getCategoryByIdHandler: RequestHandler = (req, res) => {
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
    res.status(500).json({ message: 'Error interno' });
  }
};

export const updateCategoryHandler: RequestHandler = async (req, res) => {
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
    res.status(500).json({ message: 'Error interno' });
  }
};

export const deleteCategoryHandler: RequestHandler = (req, res) => {
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
    res.status(500).json({ message: 'Error interno' });
  }
};

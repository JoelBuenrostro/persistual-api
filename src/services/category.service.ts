import { v4 as uuid } from 'uuid';
import { CategoryDTO } from '../models/Category';
import { HttpError } from './user.service';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

/** Almacén en memoria de categorías */
const categoryStore = new Map<string, Category>();

/**
 * Crea una nueva categoría a partir del DTO.
 * @throws HttpError(400) si ya existe una categoría con el mismo nombre
 */
export function createCategory(dto: CategoryDTO): Category {
  // Evitar duplicados por nombre
  for (const cat of categoryStore.values()) {
    if (cat.name === dto.name) {
      throw new HttpError('Ya existe una categoría con ese nombre', 400);
    }
  }

  const category: Category = {
    id: uuid(),
    name: dto.name,
    createdAt: new Date().toISOString(),
  };
  categoryStore.set(category.id, category);
  return category;
}

/** Devuelve todas las categorías existentes */
export function getCategories(): Category[] {
  return Array.from(categoryStore.values());
}

/**
 * Busca una categoría por su ID.
 * @throws HttpError(404) si no existe
 */
export function getCategoryById(id: string): Category {
  const cat = categoryStore.get(id);
  if (!cat) {
    throw new HttpError('Categoría no encontrada', 404);
  }
  return cat;
}

/**
 * Actualiza el nombre de una categoría.
 * @throws HttpError(404) si no existe
 */
export function updateCategory(id: string, dto: CategoryDTO): Category {
  const existing = getCategoryById(id);
  existing.name = dto.name;
  return existing;
}

/**
 * Elimina una categoría.
 * @throws HttpError(404) si no existe
 */
export function deleteCategory(id: string): void {
  if (!categoryStore.has(id)) {
    throw new HttpError('Categoría no encontrada', 404);
  }
  categoryStore.delete(id);
}

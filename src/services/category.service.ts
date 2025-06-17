import { v4 as uuid } from 'uuid';
import { Category, CategoryDTO } from '../models/Category';
import { HttpError } from './user.service';

const categoryStore = new Map<string, Category>();

export function createCategory(dto: CategoryDTO): Category {
  // Opcional: verificar duplicados por nombre
  if ([...categoryStore.values()].some(c => c.name === dto.name)) {
    throw new HttpError('Categoría ya existe', 400);
  }
  const cat: Category = {
    id: uuid(),
    name: dto.name,
    createdAt: new Date().toISOString(),
  };
  categoryStore.set(cat.id, cat);
  return cat;
}

export function getCategories(): Category[] {
  return Array.from(categoryStore.values());
}

export function getCategoryById(id: string): Category {
  const cat = categoryStore.get(id);
  if (!cat) throw new HttpError('Categoría no encontrada', 404);
  return cat;
}

export function updateCategory(
  id: string,
  dto: Partial<CategoryDTO>,
): Category {
  const cat = getCategoryById(id);
  if (dto.name) {
    cat.name = dto.name;
  }
  return cat;
}

export function deleteCategory(id: string): void {
  if (!categoryStore.delete(id)) {
    throw new HttpError('Categoría no encontrada', 404);
  }
}

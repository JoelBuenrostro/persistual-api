import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Error HTTP personalizado.
 */
export class HttpError extends Error {
  public readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Representación interna del usuario en memoria.
 */
interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
}

/**
 * Almacén en memoria de usuarios.
 * Clave: email, Valor: StoredUser
 */
export const userStore = new Map<string, StoredUser>();

/**
 * Crea un nuevo usuario.
 * @throws 400 si el email ya está en uso.
 */
export async function createUser(
  email: string,
  password: string,
): Promise<{ id: string; email: string }> {
  if (userStore.has(email)) {
    throw new HttpError('Email en uso', 400);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  userStore.set(email, { id, email, passwordHash });
  return { id, email };
}

/**
 * Recupera los datos públicos de un usuario por su ID.
 * @throws 404 si no existe.
 */
export function getUserById(id: string): { id: string; email: string } {
  const user = Array.from(userStore.values()).find(u => u.id === id);
  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }
  return { id: user.id, email: user.email };
}

/**
 * Actualiza el email de un usuario.
 * @throws 404 si no existe.
 * @throws 400 si el nuevo email ya está en uso por otro usuario.
 */
export function updateUser(
  id: string,
  newEmail: string,
): { id: string; email: string } {
  // Buscar usuario actual
  const existing = Array.from(userStore.values()).find(u => u.id === id);
  if (!existing) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  // Si el email no cambió, devolver igual
  if (existing.email === newEmail) {
    return { id, email: newEmail };
  }

  // Verificar colisión de email
  if (userStore.has(newEmail)) {
    throw new HttpError('Email en uso', 400);
  }

  // Reinsertar bajo la nueva clave y eliminar la antigua
  userStore.delete(existing.email);
  existing.email = newEmail;
  userStore.set(newEmail, existing);

  return { id, email: newEmail };
}

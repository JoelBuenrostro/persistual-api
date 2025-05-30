import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
}

export const userStore = new Map<string, StoredUser>();

export class HttpError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Crea un nuevo usuario:
 * - Hashea la contraseña
 * - Lanza HttpError(400) si el email ya existe
 */
export async function createUser(
  email: string,
  password: string,
): Promise<{ id: string; email: string }> {
  if (userStore.has(email)) {
    throw new HttpError('Email en uso', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = { id: uuid(), email, passwordHash };
  userStore.set(email, user);

  return { id: user.id, email: user.email };
}

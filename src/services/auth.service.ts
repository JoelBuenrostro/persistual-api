import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { HttpError, userStore } from './user.service';

// Almacén en memoria para refresh tokens (clave: userId)
const refreshTokenStore = new Map<string, string>();

/**
 * Autentica un usuario y genera access & refresh tokens.
 *
 * @param email    Email del usuario
 * @param password Contraseña en texto plano
 * @returns Objeto con accessToken y refreshToken
 * @throws HttpError(401) si credenciales inválidas
 * @throws HttpError(500) si faltan secrets de JWT
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  // 1. Busca el usuario
  const stored = userStore.get(email);
  if (!stored) {
    throw new HttpError('Email o contraseña invalida', 401);
  }

  // 2. Verifica la contraseña
  const valid = await bcrypt.compare(password, stored.passwordHash);
  if (!valid) {
    throw new HttpError('Email o contraseña invalida', 401);
  }

  // 3. Carga variables de entorno
  const jwtSecret = process.env.JWT_SECRET!;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
  const accessTTL = process.env.ACCESS_TOKEN_TTL ?? '15m';
  const refreshTTL = process.env.REFRESH_TOKEN_TTL ?? '7d';

  if (!jwtSecret || !refreshSecret) {
    throw new HttpError('JWT no esta configurado', 500);
  }

  // 4. Prepara options tipados para TS
  const accessOptions: SignOptions = {
    // forzamos el tipo para que TS acepte tu string
    expiresIn: accessTTL as unknown as SignOptions['expiresIn'],
  };
  const refreshOptions: SignOptions = {
    expiresIn: refreshTTL as unknown as SignOptions['expiresIn'],
  };

  // 5. Genera los tokens usando las opciones tipadas
  const accessToken = jwt.sign(
    { sub: stored.id, email },
    jwtSecret,
    accessOptions,
  );

  const refreshToken = jwt.sign(
    { sub: stored.id },
    refreshSecret,
    refreshOptions,
  );

  // 6. Guarda el refresh token
  refreshTokenStore.set(stored.id, refreshToken);

  return { accessToken, refreshToken };
}

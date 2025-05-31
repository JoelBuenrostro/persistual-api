import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { HttpError, userStore } from './user.service';

/**
 * Almacén en memoria para refresh tokens
 * Clave: userId, Valor: refreshToken
 */
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
  const stored = userStore.get(email);
  if (!stored) {
    throw new HttpError('Email o contraseña inválida', 401);
  }

  const valid = await bcrypt.compare(password, stored.passwordHash);
  if (!valid) {
    throw new HttpError('Email o contraseña inválida', 401);
  }

  const jwtSecret = process.env.JWT_SECRET!;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
  const accessTTL = process.env.ACCESS_TOKEN_TTL ?? '15m';
  const refreshTTL = process.env.REFRESH_TOKEN_TTL ?? '7d';

  if (!jwtSecret || !refreshSecret) {
    throw new HttpError('JWT secrets not configured', 500);
  }

  const accessOptions: SignOptions = {
    expiresIn: accessTTL as unknown as SignOptions['expiresIn'],
  };
  const refreshOptions: SignOptions = {
    expiresIn: refreshTTL as unknown as SignOptions['expiresIn'],
  };

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

  refreshTokenStore.set(stored.id, refreshToken);
  return { accessToken, refreshToken };
}

/**
 * Renueva el access token dado un refresh token válido.
 *
 * @param token Refresh token enviado por el cliente
 * @returns Objeto con un nuevo accessToken
 * @throws HttpError(401) si el token es inválido, expirado o no coincide con el almacenado
 */
export function refreshAccessToken(token: string): { accessToken: string } {
  try {
    const payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as jwt.JwtPayload;

    const userId = payload.sub as string;
    if (!userId) {
      throw new Error('Payload missing sub');
    }

    const stored = refreshTokenStore.get(userId);
    if (stored !== token) {
      throw new Error('Token mismatch');
    }

    const accessOptions: SignOptions = {
      expiresIn: process.env
        .ACCESS_TOKEN_TTL as unknown as SignOptions['expiresIn'],
    };

    const user = Array.from(userStore.values()).find(u => u.id === userId);
    const email = user?.email;
    if (!email) {
      throw new Error('User not found');
    }

    const accessToken = jwt.sign(
      { sub: userId, email },
      process.env.JWT_SECRET!,
      accessOptions,
    );

    return { accessToken };
  } catch {
    // Mensaje en español para coincidir con la preferencia
    throw new HttpError('Token inválido o expirado', 401);
  }
}

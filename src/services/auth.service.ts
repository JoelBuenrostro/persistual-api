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
  // 1. Busca el usuario en el store
  const stored = userStore.get(email);
  if (!stored) {
    throw new HttpError('Email o contraseña inválida', 401);
  }

  // 2. Verifica la contraseña usando bcrypt
  const valid = await bcrypt.compare(password, stored.passwordHash);
  if (!valid) {
    throw new HttpError('Email o contraseña inválida', 401);
  }

  // 3. Carga variables de entorno y asigna defaults
  const jwtSecret = process.env.JWT_SECRET!;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
  const accessTTL = process.env.ACCESS_TOKEN_TTL ?? '15m';
  const refreshTTL = process.env.REFRESH_TOKEN_TTL ?? '7d';

  if (!jwtSecret || !refreshSecret) {
    throw new HttpError('Secrets de JWT no configurados', 500);
  }

  // 4. Prepara opciones tipadas para TS
  const accessOptions: SignOptions = {
    expiresIn: accessTTL as unknown as SignOptions['expiresIn'],
  };
  const refreshOptions: SignOptions = {
    expiresIn: refreshTTL as unknown as SignOptions['expiresIn'],
  };

  // 5. Genera accessToken y refreshToken
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

  // 6. Almacena el refreshToken para validaciones futuras
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
    // 1. Verifica firma y decodifica el payload
    const payload = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as jwt.JwtPayload;

    const userId = payload.sub as string;
    if (!userId) {
      throw new Error();
    }

    // 2. Comprueba que el refreshToken coincide con el almacenado
    const stored = refreshTokenStore.get(userId);
    if (stored !== token) {
      throw new Error();
    }

    // 3. Genera un nuevo access token
    const accessOptions: SignOptions = {
      expiresIn: process.env
        .ACCESS_TOKEN_TTL as unknown as SignOptions['expiresIn'],
    };

    // Busca email del usuario
    const user = Array.from(userStore.values()).find(u => u.id === userId);
    const email = user?.email;
    if (!email) {
      throw new Error();
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

// Core y terceros
import { Request, Response } from 'express';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

// Servicios y utilidades
import {
  googleTokenStore,
  getGoogleAuthUrl,
  authenticateUser,
  refreshAccessToken,
  resetPassword,
} from '../services/auth.service';
import { createUser, HttpError } from '../services/user.service';

// Modelos
import { UserDTO } from '../models/User';
import { LoginDTO } from '../models/Auth';

/**
 * GET /api/auth/google/callback?code=...
 * Intercambia el code por tokens y los guarda en memoria
 */
export async function googleCallback(
  req: Request,
  res: Response,
): Promise<void> {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: 'Missing code parameter' });
    return;
  }
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };
    const response = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/json' },
    });
    const { access_token, refresh_token, id_token } = response.data;
    // Guardar tokens en memoria (por ejemplo, usando el email extraído del id_token)
    // Aquí solo guardamos por id_token para simplificar
    googleTokenStore.set(id_token, {
      accessToken: access_token,
      refreshToken: refresh_token,
    });
    res.json({ access_token, refresh_token, id_token });
  } catch (err: unknown) {
    res.status(502).json({
      error: 'Google integration error',
      details: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * GET /api/auth/google/url
 * Devuelve la URL de autorización de Google OAuth
 */
export function googleAuthUrl(req: Request, res: Response): void {
  try {
    const url = getGoogleAuthUrl();
    res.json({ url });
  } catch (_err) {
    res.status(500).json({ error: 'Error generating Google Auth URL' });
  }
}

/**
 * Maneja el registro de usuarios (POST /api/auth/register)
 */
export async function registerHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // Convierte y valida el DTO
    const dto = plainToInstance(UserDTO, req.body);
    await validateOrReject(dto);

    // Crea el usuario y devuelve id + email
    const result = await createUser(dto.email, dto.password);
    res.status(201).json(result);
  } catch (err: unknown) {
    // Errores de validación de class-validator
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
      return;
    }
    // Errores específicos del servicio (HttpError)
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    // Cualquier otro error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    // Fallback
    res.status(500).json({ message: req.t('error_internal') });
  }
}

/**
 * Maneja el login de usuarios (POST /api/auth/login)
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    // Convierte y valida el DTO
    const dto = plainToInstance(LoginDTO, req.body);
    await validateOrReject(dto);

    // Autentica y genera tokens
    const tokens = await authenticateUser(dto.email, dto.password);
    res.status(200).json(tokens);
  } catch (err: unknown) {
    // Errores de validación de class-validator
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
      return;
    }
    // Errores específicos del servicio (HttpError)
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    // Cualquier otro error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    // Fallback
    res.status(500).json({ message: req.t('error_internal') });
  }
}

/**
 * Maneja la renovación de access token (POST /api/auth/refresh)
 */
export async function refreshHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    // Verifica que se envió el token en el body
    if (typeof refreshToken !== 'string') {
      res.status(400).json({ message: 'Debe proveer el refreshToken' });
      return;
    }

    // Genera nuevo access token
    const { accessToken } = refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken });
  } catch (err: unknown) {
    // Errores específicos del servicio (HttpError)
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    // Cualquier otro error
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
    // Fallback
    res.status(500).json({ message: req.t('error_internal') });
  }
}

/**
 * POST /api/auth/forgot
 * (Funcionalidad no implementada)
 */
export async function forgotPasswordHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email: _email } = req.body;
    res.status(501).json({
      message: 'Funcionalidad no implementada: forgotPassword',
    });
  } catch (_err: unknown) {
    res.status(500).json({ message: req.t('error_internal') });
  }
}

/**
 * POST /api/auth/reset
 * (Funcionalidad no implementada)
 */
export async function resetPasswordHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: req.t('validation_password') });
      return;
    }

    await resetPassword(token, newPassword);
    res
      .status(501)
      .json({ message: 'Funcionalidad no implementada: resetPassword' });
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: req.t('error_internal') });
    }
  }
}

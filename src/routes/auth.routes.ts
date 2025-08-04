import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  googleAuthUrl,
  googleCallback,
} from '../controllers/auth.controller';

const router = Router();

// Registro de nuevos usuarios
router.post('/auth/register', registerHandler);

// Google OAuth endpoints
router.get('/auth/google/url', googleAuthUrl);
router.get('/auth/google/callback', googleCallback);

// Login: genera access & refresh tokens
router.post('/auth/login', loginHandler);

// Refresh: renueva el access token
router.post('/auth/refresh', refreshHandler);

// Nueva ruta para "forgot password"
router.post('/auth/forgot', forgotPasswordHandler);

// Nueva ruta para "reset password"
router.post('/auth/reset', resetPasswordHandler);

export default router;

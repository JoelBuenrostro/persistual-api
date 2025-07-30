import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from '../controllers/auth.controller';

const router = Router();

// Registro de nuevos usuarios
router.post('/auth/register', registerHandler);

// Login: genera access & refresh tokens
router.post('/auth/login', loginHandler);

// Refresh: renueva el access token
router.post('/auth/refresh', refreshHandler);

// Nueva ruta para "forgot password"
router.post('/auth/forgot', forgotPasswordHandler);

// Nueva ruta para "reset password"
router.post('/auth/reset', resetPasswordHandler);

export default router;

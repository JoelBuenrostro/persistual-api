import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
} from '../controllers/auth.controller';

const router = Router();

// Ruta para registro de usuarios
router.post('/auth/register', registerHandler);

// Ruta para login (obtención de access & refresh tokens)
router.post('/auth/login', loginHandler);

// Ruta para renovar access token usando un refresh token
router.post('/auth/refresh', refreshHandler);

export default router;

import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
} from '../controllers/auth.controller';

const router = Router();

// Registro de usuarios
router.post('/auth/register', registerHandler);

// Login (obtención de access & refresh tokens)
router.post('/auth/login', loginHandler);

// Renovar access token usando un refresh token
router.post('/auth/refresh', refreshHandler);

export default router;

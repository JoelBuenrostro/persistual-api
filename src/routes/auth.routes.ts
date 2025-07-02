import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
} from '../controllers/auth.controller';

const router = Router();

// Registro de nuevos usuarios
router.post('/auth/register', registerHandler);

// Login: genera access & refresh tokens
router.post('/auth/login', loginHandler);

// Refresh: renueva el access token
router.post('/auth/refresh', refreshHandler);

export default router;

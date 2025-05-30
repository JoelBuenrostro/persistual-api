import { Router } from 'express';
import { registerHandler, loginHandler } from '../controllers/auth.controller';

const router = Router();

router.post('/auth/register', registerHandler);
router.post('/auth/login', loginHandler);

export default router;

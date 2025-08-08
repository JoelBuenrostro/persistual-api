import { Router } from 'express';
import {
  getProfileHandler,
  updateProfileHandler,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/users/me', authMiddleware, getProfileHandler);
router.patch('/users/me', authMiddleware, updateProfileHandler);

export default router;

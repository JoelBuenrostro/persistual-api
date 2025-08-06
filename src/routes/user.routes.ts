import { Router } from 'express';
import {
  getProfileHandler,
  updateProfileHandler,
  updateUserRoleHandler,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/requireAdmin.middleware';

const router = Router();

router.get('/users/me', authMiddleware, getProfileHandler);
router.patch('/users/me', authMiddleware, updateProfileHandler);

// Solo admin puede cambiar roles
router.patch(
  '/users/:id/role',
  authMiddleware,
  requireAdmin,
  updateUserRoleHandler,
);

export default router;

import { Router } from 'express';
import {
  createNotificationHandler,
  deleteNotificationHandler,
} from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/notifications', authMiddleware, createNotificationHandler);
router.delete('/notifications/:id', authMiddleware, deleteNotificationHandler);

export default router;

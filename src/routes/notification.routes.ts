import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createNotificationHandler,
  deleteNotificationHandler,
} from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

// Rate limiter for delete notification route
const deleteNotificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 delete requests per windowMs
  message: 'Too many delete requests from this IP, please try again later.',
});

const router = Router();

router.post('/notifications', authMiddleware, createNotificationHandler);
router.delete('/notifications/:id', authMiddleware, deleteNotificationLimiter, deleteNotificationHandler);

export default router;

import { Router } from 'express';
import { createHabitHandler } from '../controllers/habit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicamos el middleware de autenticación a todas las rutas de hábitos
router.use(authMiddleware);

// POST /api/habits
router.post('/', createHabitHandler);

export default router;

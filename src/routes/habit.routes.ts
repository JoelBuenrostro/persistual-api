import { Router } from 'express';
import {
  createHabitHandler,
  getHabitsHandler,
  updateHabitHandler,
  deleteHabitHandler,
  checkHabitHandler,
  getHabitStreakHandler,
} from '../controllers/habit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// C01: Crear hábito
router.post('/habits', authMiddleware, createHabitHandler);

// C02: Listar hábitos del usuario
router.get('/habits', authMiddleware, getHabitsHandler);

// C03: Actualizar hábito existente
router.put('/habits/:habitId', authMiddleware, updateHabitHandler);

// C04: Eliminar hábito
router.delete('/habits/:habitId', authMiddleware, deleteHabitHandler);

// C05: Marcar hábito (check para racha)
router.post('/habits/:habitId/check', authMiddleware, checkHabitHandler);

// C06: Obtener racha de un hábito
router.get('/habits/:habitId/streak', authMiddleware, getHabitStreakHandler);

export default router;

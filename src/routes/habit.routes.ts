import { Router } from 'express';
import {
  createHabitHandler,
  getHabitsHandler,
  updateHabitHandler,
  deleteHabitHandler,
} from '../controllers/habit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', createHabitHandler); // C01
router.get('/', getHabitsHandler); // C02
router.put('/:habitId', updateHabitHandler); // C03
router.delete('/:habitId', deleteHabitHandler); // C04 (anticipado)

export default router;

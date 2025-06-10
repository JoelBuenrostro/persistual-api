import { Router } from 'express';
import {
  createHabitHandler,
  getHabitsHandler,
  updateHabitHandler,
  deleteHabitHandler,
} from '../controllers/habit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', createHabitHandler);
router.get('/', getHabitsHandler);
router.put('/:habitId', updateHabitHandler);
router.delete('/:habitId', deleteHabitHandler);

export default router;

import { Router } from 'express';
import {
  createHabitHandler,
  getHabitsHandler,
  updateHabitHandler,
  deleteHabitHandler,
  markHabitHandler,
  getHabitStreakHandler,
} from '../controllers/habit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', createHabitHandler);
router.get('/', getHabitsHandler);
router.put('/:habitId', updateHabitHandler);
router.delete('/:habitId', deleteHabitHandler);
router.post('/:habitId/check', markHabitHandler);
router.get('/:habitId/streak', getHabitStreakHandler);

export default router;

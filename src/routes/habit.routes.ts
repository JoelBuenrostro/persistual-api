import { Router } from 'express';
import {
  createHabitHandler,
  getHabitsHandler,
  updateHabitHandler,
  deleteHabitHandler,
  markHabitHandler,
} from '../controllers/habit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/', createHabitHandler);
router.get('/', getHabitsHandler);
router.put('/:habitId', updateHabitHandler);
router.delete('/:habitId', deleteHabitHandler);
router.post('/:habitId/check', markHabitHandler);

export default router;

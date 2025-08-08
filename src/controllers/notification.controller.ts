import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { NotificationDTO } from '../models/NotificationDTO';
import {
  scheduleReminder,
  deleteReminder,
} from '../services/notification.service';
import { HttpError } from '../services/user.service';

export async function createNotificationHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const dto = plainToInstance(NotificationDTO, req.body);
    await validateOrReject(dto);

    const userId = req.user!.sub as string;
    const notification = scheduleReminder(userId, dto.habitId, dto.date);
    res.status(201).json(notification);
  } catch (err: unknown) {
    if (Array.isArray(err)) {
      const errors = err.flatMap(e =>
        e.constraints ? Object.values(e.constraints) : [],
      );
      res.status(400).json({ errors });
    } else if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({
        message: err instanceof Error ? err.message : req.t('error_internal'),
      });
    }
  }
}

export async function deleteNotificationHandler(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.sub as string;
    deleteReminder(id, userId);
    res.sendStatus(204);
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
    } else {
      res.status(500).json({ message: req.t('error_internal') });
    }
  }
}

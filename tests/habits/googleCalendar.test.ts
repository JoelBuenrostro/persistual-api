import nock from 'nock';
import {
  checkHabit,
  habitStore,
  checkStore,
} from '../../src/services/habit.service';
import { googleTokenStore } from '../../src/services/auth.service';

describe('Google Calendar integration', () => {
  const habitId = 'habit-1';
  const userId = 'user-1';
  const accessToken = 'test-access-token';

  beforeEach(() => {
    habitStore.set(habitId, {
      id: habitId,
      userId,
      name: 'Test Habit',
      description: 'desc',
      createdAt: new Date().toISOString(),
    });
    checkStore.set(habitId, []);
    googleTokenStore.set('test', { accessToken, refreshToken: 'test-refresh' });
  });

  afterEach(() => {
    nock.cleanAll();
    habitStore.clear();
    checkStore.clear();
    googleTokenStore.clear();
  });

  it('should call Google Calendar API when checking a habit', async () => {
    const scope = nock('https://www.googleapis.com')
      .post('/calendar/v3/calendars/primary/events')
      .reply(200, { id: 'event-1' });

    const result = await checkHabit(habitId, userId);
    expect(result).toHaveProperty('habitId', habitId);
    expect(scope.isDone()).toBe(true);
  });

  it('should return 502 if Google Calendar API fails', async () => {
    nock('https://www.googleapis.com')
      .post('/calendar/v3/calendars/primary/events')
      .reply(500, { error: 'Internal error' });

    await expect(checkHabit(habitId, userId)).rejects.toThrow(
      /Google Calendar integration error/,
    );
  });
});

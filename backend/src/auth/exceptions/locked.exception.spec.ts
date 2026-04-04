import { LockedException } from './locked.exception';

describe('LockedException', () => {
  it('should have status code 423', () => {
    const futureDate = new Date(Date.now() + 30 * 60 * 1000);
    const exception = new LockedException(futureDate);
    expect(exception.getStatus()).toBe(423);
  });

  it('should include lockedUntil ISO string in response', () => {
    const futureDate = new Date(Date.now() + 30 * 60 * 1000);
    const exception = new LockedException(futureDate);
    const response = exception.getResponse() as any;
    expect(response.lockedUntil).toBe(futureDate.toISOString());
  });

  it('should calculate retryAfter in seconds correctly', () => {
    const futureDate = new Date(Date.now() + 60 * 1000); // 60 seconds from now
    const exception = new LockedException(futureDate);
    const response = exception.getResponse() as any;
    expect(response.retryAfter).toBe(60);
  });

  it('should include ISO timestamp in message', () => {
    const futureDate = new Date(Date.now() + 30 * 60 * 1000);
    const exception = new LockedException(futureDate);
    const response = exception.getResponse() as any;
    expect(response.message).toContain(futureDate.toISOString());
  });
});

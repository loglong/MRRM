import { HttpException } from '@nestjs/common';

export class LockedException extends HttpException {
  constructor(lockedUntil: Date) {
    const retryAfterSeconds = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
    const response = {
      statusCode: 423,
      message: `Account locked until ${lockedUntil.toISOString()}`,
      error: 'Locked',
      lockedUntil: lockedUntil.toISOString(),
      retryAfter: retryAfterSeconds,
    };
    super(response, 423);
  }
}

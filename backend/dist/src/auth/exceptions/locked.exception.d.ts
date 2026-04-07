import { HttpException } from '@nestjs/common';
export declare class LockedException extends HttpException {
    constructor(lockedUntil: Date);
}

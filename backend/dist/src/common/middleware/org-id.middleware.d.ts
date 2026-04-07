import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
declare global {
    namespace Express {
        interface Request {
            orgId?: string;
            userId?: string;
        }
    }
}
export declare class OrgIdMiddleware implements NestMiddleware {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}

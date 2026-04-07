import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        sub: any;
        email: any;
        orgId: any;
        roles: never[];
        permissions: never[];
    } | {
        sub: string;
        email: string;
        orgId: string;
        roles: string[];
        permissions: string[];
    }>;
}
export {};

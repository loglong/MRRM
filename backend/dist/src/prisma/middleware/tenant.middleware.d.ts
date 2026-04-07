import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class TenantMiddleware implements OnModuleInit {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private addTenantFilter;
}

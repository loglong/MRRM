import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PermissionsService implements OnModuleInit {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<any[]>;
    findByCode(code: string): Promise<any | null>;
    findById(id: string): Promise<any | null>;
    seedDefaultPermissions(): Promise<void>;
}

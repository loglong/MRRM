import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class RolesService implements OnModuleInit {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    findAll(orgId: string): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByCode(code: string, orgId: string): Promise<any | null>;
    create(data: {
        name: string;
        code: string;
        description?: string;
        orgId: string;
        permissionIds?: string[];
    }): Promise<any>;
    update(id: string, data: {
        name?: string;
        description?: string;
        permissionIds?: string[];
    }): Promise<any>;
    delete(id: string): Promise<any>;
    seedDefaultRoles(): Promise<void>;
}

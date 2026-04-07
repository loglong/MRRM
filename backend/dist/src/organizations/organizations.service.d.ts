import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
export declare class OrganizationsService implements OnModuleInit {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private seedSystemOrganization;
    findById(id: string): Promise<any>;
    findByCode(code: string): Promise<any>;
    findAll(page?: number, limit?: number): Promise<any>;
    create(data: CreateOrganizationDto): Promise<any>;
    update(id: string, data: UpdateOrganizationDto): Promise<any>;
    delete(id: string): Promise<any>;
    createSuperAdminOrg(_userId: string, userEmail: string): Promise<any>;
}

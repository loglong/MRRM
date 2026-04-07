import { PrismaService } from '../common/prisma/prisma.service';
export interface AuditLogDto {
    userId?: string;
    orgId: string;
    action: string;
    entityType: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestPath?: string;
    requestBody?: any;
    responseStatus?: number;
    errorMessage?: string;
}
export declare class AuditService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    log(dto: AuditLogDto): Promise<void>;
    findAll(orgId: string, page?: number, limit?: number, filters?: Record<string, unknown>): Promise<any>;
    findByOrg(orgId: string, page?: number, limit?: number): Promise<any>;
    findByEntity(entityType: string, entityId: string, orgId: string): Promise<any[]>;
    getLogsForExport(orgId: string, startDate: Date, endDate: Date): Promise<any[]>;
}

import { Response } from 'express';
import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    findAll(req: any, page?: number, limit?: number, userId?: string, action?: string, entityType?: string, startDate?: string, endDate?: string): Promise<any>;
    findByEntity(req: any, entityType: string, entityId: string): Promise<any[]>;
    exportLogs(req: any, startDate: string, endDate: string, res: Response): Promise<void>;
}

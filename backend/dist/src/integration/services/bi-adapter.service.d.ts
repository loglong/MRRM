import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
export declare class BiAdapterService {
    private configService;
    private prisma;
    private readonly logger;
    private readonly TIMEOUT_MS;
    constructor(configService: ConfigService, prisma: PrismaService);
    pushMetricsReport(orgId: string, date: string): Promise<void>;
    pushPatientAnalytics(orgId: string): Promise<void>;
}

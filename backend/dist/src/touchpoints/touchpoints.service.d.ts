import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTouchpointDto } from './dto/create-touchpoint.dto';
import { UpdateTouchpointDto } from './dto/update-touchpoint.dto';
import { TouchpointFiltersDto } from './dto/touchpoint-filters.dto';
export declare class TouchpointsService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    create(data: CreateTouchpointDto, orgId: string, userId?: string): Promise<any>;
    findAll(orgId: string, filters?: TouchpointFiltersDto): Promise<any>;
    findById(id: string, orgId: string): Promise<any>;
    update(id: string, data: UpdateTouchpointDto, orgId: string): Promise<any>;
    void(id: string, reason: string, orgId: string): Promise<any>;
    getAnalytics(orgId: string, startDate?: string, endDate?: string, granularity?: 'day' | 'week' | 'month'): Promise<any>;
    private getDateKey;
}

import { PrismaService } from '../common/prisma/prisma.service';
import { CreateDemandDtoType } from './dto/create-demand.dto';
import { UpdateDemandDtoType } from './dto/update-demand.dto';
import { ChangeStatusDemandDtoType } from './dto/change-status-demand.dto';
import { FilterDemandDtoType } from './dto/filter-demand.dto';
export declare class DemandsService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    create(data: CreateDemandDtoType, orgId: string, userId: string): Promise<any>;
    findAll(orgId: string, filters?: FilterDemandDtoType): Promise<any>;
    findById(id: string, orgId: string): Promise<any>;
    update(id: string, orgId: string, data: UpdateDemandDtoType): Promise<any>;
    changeStatus(id: string, orgId: string, userId: string, data: ChangeStatusDemandDtoType): Promise<any>;
    getStatusHistory(demandId: string, orgId: string): Promise<any[]>;
    getPatientDemands(patientId: string, orgId: string): Promise<any[]>;
    getDemandStats(orgId: string): Promise<any>;
}

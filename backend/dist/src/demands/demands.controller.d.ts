import { DemandsService } from './demands.service';
import { CreateDemandDtoType } from './dto/create-demand.dto';
import { UpdateDemandDtoType } from './dto/update-demand.dto';
import { ChangeStatusDemandDtoType } from './dto/change-status-demand.dto';
export declare class DemandsController {
    private readonly demandsService;
    constructor(demandsService: DemandsService);
    create(createDemandDto: CreateDemandDtoType, req: any): Promise<any>;
    findAll(req: any, page?: string, limit?: string, status?: 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'LOST', type?: 'CONSULTATION' | 'TREATMENT' | 'FOLLOWUP' | 'OTHER', priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', patientId?: string): Promise<any>;
    getStats(req: any): Promise<any>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateDemandDto: UpdateDemandDtoType, req: any): Promise<any>;
    changeStatus(id: string, changeStatusDto: ChangeStatusDemandDtoType, req: any): Promise<any>;
    getStatusHistory(id: string, req: any): Promise<any[]>;
}
export declare class PatientDemandsController {
    private readonly demandsService;
    constructor(demandsService: DemandsService);
    getPatientDemands(patientId: string, req: any): Promise<any[]>;
}

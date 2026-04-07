import { PatientsService } from './patients.service';
import { CreatePatientDtoType } from './dto/create-patient.dto';
import { UpdatePatientDtoType } from './dto/update-patient.dto';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(createPatientDto: CreatePatientDtoType, req: any): Promise<any>;
    findAll(req: any, page?: string, limit?: string, tier?: string, search?: string): Promise<any>;
    search(req: any, query: string, field?: 'name' | 'phone' | 'all'): Promise<any[]>;
    getStats(req: any): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updatePatientDto: UpdatePatientDtoType): Promise<any>;
    remove(id: string): Promise<any>;
}

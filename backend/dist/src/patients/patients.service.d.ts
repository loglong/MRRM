import { PrismaService } from '../common/prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { CreatePatientDtoType } from './dto/create-patient.dto';
import { UpdatePatientDtoType } from './dto/update-patient.dto';
export declare class PatientsService {
    private prisma;
    private encryption;
    private logger;
    private readonly encryptedFields;
    constructor(prisma: PrismaService, encryption: EncryptionService);
    create(data: CreatePatientDtoType, orgId: string): Promise<any>;
    findAll(orgId: string, page?: number, limit?: number, filters?: {
        tier?: string;
        search?: string;
    }): Promise<any>;
    findById(id: string): Promise<any>;
    update(id: string, data: UpdatePatientDtoType): Promise<any>;
    delete(id: string): Promise<any>;
    search(orgId: string, query: string, field?: 'name' | 'phone' | 'all'): Promise<any[]>;
    getStats(orgId: string): Promise<any>;
    private encryptSensitiveFields;
    private decryptSensitiveFields;
}

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
export declare class OrganizationsController {
    private orgsService;
    constructor(orgsService: OrganizationsService);
    findAll(page?: number, limit?: number): Promise<any>;
    findOne(id: string): Promise<any>;
    findByCode(code: string): Promise<any>;
    create(data: CreateOrganizationDto): Promise<any>;
    update(id: string, data: UpdateOrganizationDto): Promise<any>;
    delete(id: string): Promise<any>;
}

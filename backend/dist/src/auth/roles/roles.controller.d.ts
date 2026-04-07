import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(req: any): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(createRoleDto: any, req: any): Promise<any>;
    update(id: string, updateRoleDto: any): Promise<any>;
    remove(id: string): Promise<any>;
}

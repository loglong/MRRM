import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(req: any, page?: number, limit?: number): Promise<any>;
    findOne(id: string): Promise<any>;
    create(data: any, req: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    assignRoles(id: string, roleIds: string[]): Promise<{
        success: boolean;
    }>;
    delete(id: string, req: any): Promise<any>;
    changeStatus(id: string, status: 'ACTIVE' | 'INACTIVE', req: any): Promise<any>;
}

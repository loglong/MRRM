import { PrismaService } from '../common/prisma/prisma.service';
export declare class UsersService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    findByEmail(email: string, orgId?: string): Promise<any>;
    findById(id: string): Promise<any>;
    findAll(orgId: string, page?: number, limit?: number): Promise<any>;
    create(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        orgId: string;
    }): Promise<any>;
    createFromSSO(data: {
        email: string;
        name: string;
        orgId: string;
    }): Promise<any>;
    update(id: string, data: any): Promise<any>;
    incrementFailedLogin(id: string): Promise<void>;
    resetFailedLogin(id: string): Promise<void>;
    assignRoles(userId: string, roleIds: string[]): Promise<void>;
    delete(id: string): Promise<any>;
    changeStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<any>;
}

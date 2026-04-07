import { TouchpointsService } from './touchpoints.service';
export declare class TouchpointsController {
    private readonly touchpointsService;
    constructor(touchpointsService: TouchpointsService);
    create(body: any, req: any): Promise<any>;
    findAll(query: any, req: any): Promise<any>;
    getAnalytics(startDate?: string, endDate?: string, granularity?: 'day' | 'week' | 'month', req?: any): Promise<any>;
    findById(id: string, req: any): Promise<any>;
    update(id: string, body: any, req: any): Promise<any>;
    void(id: string, body: {
        reason: string;
    }, req: any): Promise<any>;
}

import { PrismaService } from '../common/prisma/prisma.service';
import { JourneyResponse } from './entities/journey-event.entity';
export declare class JourneyService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService);
    getPatientJourney(patientId: string, orgId: string, page?: number, limit?: number): Promise<JourneyResponse>;
}

import { JourneyService } from './journey.service';
export declare class JourneyController {
    private readonly journeyService;
    constructor(journeyService: JourneyService);
    getPatientJourney(patientId: string, query: any, req: any): Promise<import("./entities/journey-event.entity").JourneyResponse>;
}

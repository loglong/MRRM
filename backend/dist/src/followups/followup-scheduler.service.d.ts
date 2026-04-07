import { FollowupsService } from './followups.service';
export declare class FollowupSchedulerService {
    private followupsService;
    private logger;
    constructor(followupsService: FollowupsService);
    handleOverdueDetection(): Promise<void>;
}

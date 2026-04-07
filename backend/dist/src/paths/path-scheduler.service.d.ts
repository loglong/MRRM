import { PathsService } from './paths.service';
export declare class PathSchedulerService {
    private pathsService;
    private logger;
    constructor(pathsService: PathsService);
    handleOverdueDetection(): Promise<void>;
}

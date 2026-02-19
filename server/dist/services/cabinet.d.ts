import { TaskStatus } from '../models/task';
export declare class CabinetService {
    runCabinet(userInput: string): Promise<number>;
    private executeFourStepProcess;
    getTaskStatus(taskId: number): Promise<{
        status: TaskStatus;
        progress: number;
    }>;
    getTaskResult(taskId: number): Promise<{
        user_input: string;
        planning_result?: string;
        execution_result?: string;
        review_result?: string;
        final_result?: string;
        template?: string;
        status: TaskStatus;
    }>;
}
export declare const cabinetService: CabinetService;
//# sourceMappingURL=cabinet.d.ts.map
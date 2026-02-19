import { Sequelize, Model } from 'sequelize';
declare const sequelize: Sequelize;
export declare enum TaskStatus {
    PENDING = "pending",
    PLANNING = "planning",
    EXECUTING = "executing",
    REVIEWING = "reviewing",
    FINALIZING = "finalizing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class Task extends Model {
    id: number;
    user_input: string;
    status: TaskStatus;
    planning_result?: string;
    execution_result?: string;
    review_result?: string;
    final_result?: string;
    template?: string;
    created_at: Date;
    updated_at: Date;
}
export declare const syncDatabase: () => Promise<void>;
export { sequelize };
//# sourceMappingURL=task.d.ts.map
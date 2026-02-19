export declare const ROLES: {
    PLANNER: string;
    EXECUTOR: string;
    REVIEWER: string;
    FINALIZER: string;
};
export declare function callKimiAPI(role: string, content: string, context?: string): Promise<string>;
export declare function checkReviewPass(reviewResult: string): boolean;
export declare function extractReviewSuggestions(reviewResult: string): string;
//# sourceMappingURL=kimi.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cabinetService = exports.CabinetService = void 0;
const task_1 = require("../models/task");
const ai_1 = require("./ai");
// 数字内阁服务
class CabinetService {
    async runCabinet(userInput) {
        try {
            const task = await task_1.Task.create({
                user_input: userInput,
                status: task_1.TaskStatus.PENDING
            });
            this.executeFourStepProcess(task.id).catch(error => {
                console.error(`任务 ${task.id} 执行失败:`, error);
                task_1.Task.update({ status: task_1.TaskStatus.FAILED }, { where: { id: task.id } });
            });
            return task.id;
        }
        catch (error) {
            console.error('创建任务失败:', error);
            throw new Error('创建任务失败');
        }
    }
    async executeFourStepProcess(taskId) {
        try {
            const task = await task_1.Task.findByPk(taskId);
            if (!task)
                throw new Error('任务不存在');
            // 第一步：谋局者
            await task_1.Task.update({ status: task_1.TaskStatus.PLANNING }, { where: { id: taskId } });
            const planningResult = await this.callAIWithFallback(ai_1.ROLES.PLANNER, task.user_input);
            await task_1.Task.update({ planning_result: planningResult }, { where: { id: taskId } });
            // 第二步到第三步
            let executionResult = '';
            let reviewResult = '';
            let retryCount = 0;
            const maxRetries = 3; // 减少重试次数，避免超时
            do {
                await task_1.Task.update({ status: task_1.TaskStatus.EXECUTING }, { where: { id: taskId } });
                const executorInput = retryCount > 0 && reviewResult
                    ? `根据以下修改建议重新执行（第${retryCount + 1}轮，最多${maxRetries}轮）：\n${reviewResult}\n\n原始计划：${planningResult}`
                    : planningResult;
                executionResult = await this.callAIWithFallback(ai_1.ROLES.EXECUTOR, executorInput);
                await task_1.Task.update({ execution_result: executionResult }, { where: { id: taskId } });
                await task_1.Task.update({ status: task_1.TaskStatus.REVIEWING }, { where: { id: taskId } });
                reviewResult = await this.callAIWithFallback(ai_1.ROLES.REVIEWER, executionResult);
                await task_1.Task.update({ review_result: reviewResult }, { where: { id: taskId } });
                retryCount++;
            } while (!(0, ai_1.checkReviewPass)(reviewResult) && retryCount < maxRetries);
            if (!(0, ai_1.checkReviewPass)(reviewResult)) {
                await task_1.Task.update({
                    status: task_1.TaskStatus.FAILED,
                    fail_reason: `审核未通过，已达到最大重试次数（${maxRetries}次）`,
                    fail_step: 'reviewing',
                    retry_count: retryCount,
                    review_result: reviewResult,
                    execution_result: executionResult
                }, { where: { id: taskId } });
                throw new Error('审核未通过，已达到最大重试次数');
            }
            // 第四步：沉淀者
            await task_1.Task.update({ status: task_1.TaskStatus.FINALIZING }, { where: { id: taskId } });
            const fullProcess = `用户需求: ${task.user_input}\n\n` +
                `第一步 - 谋局者结果: ${planningResult}\n\n` +
                `第二步 - 执行者结果: ${executionResult}\n\n` +
                `第三步 - 找茬者结果: ${reviewResult}`;
            const finalResult = await this.callAIWithFallback(ai_1.ROLES.FINALIZER, fullProcess);
            
            // 解析沉淀者的输出，分离总结和模板
            let finalSummary = finalResult;
            let template = finalResult;
            
            // 尝试提取两部分
            const summaryMatch = finalResult.match(/===== 沉淀者总结 =====([\s\S]*?)(?====== 万能模板 =====|$)/);
            const templateMatch = finalResult.match(/===== 万能模板 =====([\s\S]*?)$/);
            
            if (summaryMatch && summaryMatch[1]) {
                finalSummary = summaryMatch[1].trim();
            }
            if (templateMatch && templateMatch[1]) {
                template = templateMatch[1].trim();
            }
            
            await task_1.Task.update({
                status: task_1.TaskStatus.COMPLETED,
                final_result: finalSummary,
                template: template
            }, { where: { id: taskId } });
        }
        catch (error) {
            console.error(`四步流程执行失败 (任务 ${taskId}):`, error);
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            await task_1.Task.update({
                status: task_1.TaskStatus.FAILED,
                fail_reason: errorMessage
            }, { where: { id: taskId } });
            throw error;
        }
    }
    async callAIWithFallback(role, content, context) {
        try {
            return await (0, ai_1.callKimiAPI)(role, content, context);
        }
        catch (kimiError) {
            console.log('Kimi 调用失败，切换到 DeepSeek');
            return await (0, ai_1.callDeepSeekAPI)(role, content, context);
        }
    }
    async getTaskStatus(taskId) {
        const task = await task_1.Task.findByPk(taskId);
        if (!task)
            throw new Error('任务不存在');
        let progress = 0;
        switch (task.status) {
            case task_1.TaskStatus.PENDING:
                progress = 0;
                break;
            case task_1.TaskStatus.PLANNING:
                progress = 25;
                break;
            case task_1.TaskStatus.EXECUTING:
                progress = 50;
                break;
            case task_1.TaskStatus.REVIEWING:
                progress = 75;
                break;
            case task_1.TaskStatus.FINALIZING:
                progress = 90;
                break;
            case task_1.TaskStatus.COMPLETED:
                progress = 100;
                break;
            case task_1.TaskStatus.FAILED:
                progress = 0;
                break;
        }
        return {
            taskId: task.id,
            status: task.status,
            progress,
            planningResult: task.planning_result,
            executionResult: task.execution_result,
            reviewResult: task.review_result,
            failReason: task.fail_reason,
            failStep: task.fail_step,
            retryCount: task.retry_count
        };
    }
    async getTaskResult(taskId) {
        const task = await task_1.Task.findByPk(taskId);
        if (!task)
            throw new Error('任务不存在');
        return {
            taskId: task.id,
            status: task.status,
            userInput: task.user_input,
            planningResult: task.planning_result,
            executionResult: task.execution_result,
            reviewResult: task.review_result,
            finalResult: task.final_result,
            template: task.template,
            failReason: task.fail_reason,
            failStep: task.fail_step,
            retryCount: task.retry_count,
            createdAt: task.created_at,
            updatedAt: task.updated_at
        };
    }
}
exports.CabinetService = CabinetService;
exports.cabinetService = new CabinetService();
//# sourceMappingURL=cabinet.js.map
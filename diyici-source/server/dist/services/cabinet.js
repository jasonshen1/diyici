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
            const maxRetries = 5; // 增加重试次数，确保任务能完成
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
            
            // 尝试提取两部分（支持多种格式）
            // 格式1: ===== 沉淀者总结 ===== / ===== 万能模板 =====
            // 格式2: ## 沉淀者总结 / ## 万能模板
            // 格式3: 沉淀者总结： / 万能模板：
            
            const summaryPatterns = [
                /[=\-#]{3,}\s*沉淀者总结\s*[=\-#]{3,}([\s\S]*?)(?=[=\-#]{3,}\s*万能模板\s*[=\-#]{3,}|$)/i,
                /沉淀者总结[：:]([\s\S]*?)(?=万能模板[：:]|$)/i,
                /[=\-#]{3,}\s*总结\s*[=\-#]{3,}([\s\S]*?)(?=[=\-#]{3,}\s*模板\s*[=\-#]{3,}|$)/i
            ];
            
            const templatePatterns = [
                /[=\-#]{3,}\s*万能模板\s*[=\-#]{3,}([\s\S]*?)$/i,
                /万能模板[：:]([\s\S]*?)$/i,
                /[=\-#]{3,}\s*模板\s*[=\-#]{3,}([\s\S]*?)$/i
            ];
            
            // 尝试匹配总结部分
            for (const pattern of summaryPatterns) {
                const match = finalResult.match(pattern);
                if (match && match[1] && match[1].trim().length > 100) {
                    finalSummary = match[1].trim();
                    break;
                }
            }
            
            // 尝试匹配模板部分
            for (const pattern of templatePatterns) {
                const match = finalResult.match(pattern);
                if (match && match[1] && match[1].trim().length > 100) {
                    template = match[1].trim();
                    break;
                }
            }
            
            // 如果模板和总结一样，或者模板为空，从总结中提取简化版
            if (template === finalSummary || template.length < 100) {
                // 从总结中提取核心框架作为模板
                const lines = finalSummary.split('\n');
                const keyPoints = [];
                for (const line of lines) {
                    // 提取标题、列表项、关键数据
                    if (line.match(/^#{1,3}\s/) || line.match(/^\d+\./) || line.match(/^[-*]\s/) || line.match(/\d+[%\d]/)) {
                        keyPoints.push(line);
                    }
                }
                if (keyPoints.length > 3) {
                    template = '【核心要点提取】\n\n' + keyPoints.slice(0, 20).join('\n');
                }
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
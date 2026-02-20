import { Task, TaskStatus } from '../models/task';
import { callKimiAPI, callDeepSeekAPI, ROLES, checkReviewPass } from './ai';

// 数字内阁服务
export class CabinetService {
  async runCabinet(userInput: string): Promise<number> {
    try {
      const task = await Task.create({
        user_input: userInput,
        status: TaskStatus.PENDING
      });

      this.executeFourStepProcess(task.id).catch(error => {
        console.error(`任务 ${task.id} 执行失败:`, error);
        Task.update({ status: TaskStatus.FAILED }, { where: { id: task.id } });
      });

      return task.id;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw new Error('创建任务失败');
    }
  }

  async executeFourStepProcess(taskId: number): Promise<void> {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) throw new Error('任务不存在');

      // 第一步：谋局者
      await Task.update({ status: TaskStatus.PLANNING }, { where: { id: taskId } });
      const planningResult = await this.callAIWithFallback(ROLES.PLANNER, task.user_input);
      await Task.update({ planning_result: planningResult }, { where: { id: taskId } });

      // 第二步到第三步
      let executionResult = '';
      let reviewResult = '';
      let retryCount = 0;
      const maxRetries = 5;

      do {
        await Task.update({ status: TaskStatus.EXECUTING }, { where: { id: taskId } });
        const executorInput = retryCount > 0 && reviewResult 
          ? `根据以下修改建议重新执行：\n${reviewResult}\n\n原始计划：${planningResult}`
          : planningResult;
        executionResult = await this.callAIWithFallback(ROLES.EXECUTOR, executorInput);
        await Task.update({ execution_result: executionResult }, { where: { id: taskId } });

        await Task.update({ status: TaskStatus.REVIEWING }, { where: { id: taskId } });
        reviewResult = await this.callAIWithFallback(ROLES.REVIEWER, executionResult);
        await Task.update({ review_result: reviewResult }, { where: { id: taskId } });

        retryCount++;
      } while (!checkReviewPass(reviewResult) && retryCount < maxRetries);

      if (!checkReviewPass(reviewResult)) {
        throw new Error('审核未通过，已达到最大重试次数');
      }

      // 第四步：沉淀者
      await Task.update({ status: TaskStatus.FINALIZING }, { where: { id: taskId } });
      const fullProcess = `用户需求: ${task.user_input}\n\n` +
        `第一步 - 谋局者结果: ${planningResult}\n\n` +
        `第二步 - 执行者结果: ${executionResult}\n\n` +
        `第三步 - 找茬者结果: ${reviewResult}`;
      const finalResult = await this.callAIWithFallback(ROLES.FINALIZER, fullProcess);

      await Task.update({
        status: TaskStatus.COMPLETED,
        final_result: finalResult,
        template: finalResult
      }, { where: { id: taskId } });

    } catch (error) {
      console.error(`四步流程执行失败 (任务 ${taskId}):`, error);
      await Task.update({ status: TaskStatus.FAILED }, { where: { id: taskId } });
      throw error;
    }
  }

  private async callAIWithFallback(role: string, content: string, context?: string): Promise<string> {
    try {
      return await callKimiAPI(role, content, context);
    } catch (kimiError) {
      console.log('Kimi 调用失败，切换到 DeepSeek');
      return await callDeepSeekAPI(role, content, context);
    }
  }

  async getTaskStatus(taskId: number) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('任务不存在');

    let progress = 0;
    switch (task.status) {
      case TaskStatus.PENDING: progress = 0; break;
      case TaskStatus.PLANNING: progress = 25; break;
      case TaskStatus.EXECUTING: progress = 50; break;
      case TaskStatus.REVIEWING: progress = 75; break;
      case TaskStatus.FINALIZING: progress = 90; break;
      case TaskStatus.COMPLETED: progress = 100; break;
      case TaskStatus.FAILED: progress = 0; break;
    }

    return { taskId: task.id, status: task.status, progress };
  }

  async getTaskResult(taskId: number) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('任务不存在');

    return {
      taskId: task.id,
      status: task.status,
      userInput: task.user_input,
      planningResult: task.planning_result,
      executionResult: task.execution_result,
      reviewResult: task.review_result,
      finalResult: task.final_result,
      template: task.template,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    };
  }
}

export const cabinetService = new CabinetService();

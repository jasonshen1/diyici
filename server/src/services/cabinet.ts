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
      const planningStart = Date.now();
      await Task.update({ status: TaskStatus.PLANNING }, { where: { id: taskId } });
      const planningResult = await this.callAIWithFallback(ROLES.PLANNER, task.user_input);
      const planningDuration = Math.floor((Date.now() - planningStart) / 1000);
      await Task.update({ 
        planning_result: planningResult,
        planning_duration: planningDuration
      }, { where: { id: taskId } });

      // 第二步到第三步
      let executionResult = '';
      let reviewResult = '';
      let retryCount = 0;
      let totalExecutionDuration = 0;
      let totalReviewDuration = 0;
      const maxRetries = 3;

      do {
        // 执行者步骤
        const executionStart = Date.now();
        await Task.update({ status: TaskStatus.EXECUTING }, { where: { id: taskId } });
        const executorInput = retryCount > 0 && reviewResult 
          ? `根据以下修改建议重新执行：\n${reviewResult}\n\n原始计划：${planningResult}`
          : planningResult;
        executionResult = await this.callAIWithFallback(ROLES.EXECUTOR, executorInput);
        totalExecutionDuration += Math.floor((Date.now() - executionStart) / 1000);
        await Task.update({ 
          execution_result: executionResult,
          execution_duration: totalExecutionDuration
        }, { where: { id: taskId } });

        // 审核者步骤
        const reviewStart = Date.now();
        await Task.update({ status: TaskStatus.REVIEWING }, { where: { id: taskId } });
        reviewResult = await this.callAIWithFallback(ROLES.REVIEWER, executionResult);
        totalReviewDuration += Math.floor((Date.now() - reviewStart) / 1000);
        await Task.update({ 
          review_result: reviewResult,
          review_duration: totalReviewDuration
        }, { where: { id: taskId } });

        retryCount++;
      } while (!checkReviewPass(reviewResult) && retryCount < maxRetries);

      // 第四步：沉淀者
      const finalizingStart = Date.now();
      await Task.update({ status: TaskStatus.FINALIZING }, { where: { id: taskId } });
      
      const reviewPassed = checkReviewPass(reviewResult);
      const finalizerInput = `用户需求: ${task.user_input}\n\n` +
        `第一步 - 谋局者结果: ${planningResult}\n\n` +
        `第二步 - 执行者结果: ${executionResult}\n\n` +
        `第三步 - 找茬者结果: ${reviewResult}\n\n` +
        `审核状态: ${reviewPassed ? '已通过' : '未通过（已尝试' + retryCount + '次修改）'}\n\n` +
        `请生成最终成果和万能模板。${!reviewPassed ? '注意：虽然审核未完全通过，但仍需总结当前最优版本，并标注改进建议。' : ''}`;
      
      const finalResult = await this.callAIWithFallback(ROLES.FINALIZER, finalizerInput);
      const finalizingDuration = Math.floor((Date.now() - finalizingStart) / 1000);

      await Task.update({
        status: TaskStatus.COMPLETED,
        final_result: finalResult,
        template: finalResult,
        retry_count: retryCount,
        finalizing_duration: finalizingDuration
      }, { where: { id: taskId } });

    } catch (error) {
      console.error(`四步流程执行失败 (任务 ${taskId}):`, error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      await Task.update({ 
        status: TaskStatus.FAILED,
        fail_reason: errorMessage
      }, { where: { id: taskId } });
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

  async getTaskResult(taskId: number) {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('任务不存在');

    // 计算总耗时
    const createdAt = task.created_at ? new Date(task.created_at) : null;
    const updatedAt = task.updated_at ? new Date(task.updated_at) : new Date();
    const totalDuration = createdAt ? Math.floor((updatedAt.getTime() - createdAt.getTime()) / 1000) : 0;

    // 从 finalResult 中提取 Skill 配置
    let skillConfig = null;
    if (task.final_result) {
      // 查找 YAML 代码块
      const yamlMatch = task.final_result.match(/```yaml\n([\s\S]*?)\n```/);
      if (yamlMatch) {
        skillConfig = yamlMatch[1].trim();
      }
    }

    return {
      taskId: task.id,
      status: task.status,
      userInput: task.user_input,
      planningResult: task.planning_result,
      executionResult: task.execution_result,
      reviewResult: task.review_result,
      finalResult: task.final_result,
      template: task.template,
      skillConfig: skillConfig, // 添加 Skill 配置
      failReason: task.fail_reason,
      failStep: task.fail_step,
      retryCount: task.retry_count,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      // 各步骤耗时（秒）
      planningDuration: task.planning_duration || 0,
      executionDuration: task.execution_duration || 0,
      reviewDuration: task.review_duration || 0,
      finalizingDuration: task.finalizing_duration || 0,
      totalDuration: totalDuration
    };
  }
}

export const cabinetService = new CabinetService();

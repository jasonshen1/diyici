import { Task, TaskStatus } from '../models/task';
import { callKimiAPI, ROLES, checkReviewPass, extractReviewSuggestions } from './kimi';

// 数字内阁服务
export class CabinetService {
  // 运行数字内阁
  async runCabinet(userInput: string): Promise<number> {
    try {
      // 创建新任务
      const task = await Task.create({
        user_input: userInput,
        status: TaskStatus.PENDING
      });
      
      // 异步执行四步流程
      this.executeFourStepProcess(task.id).catch(error => {
        console.error(`任务 ${task.id} 执行失败:`, error);
        Task.update(
          { status: TaskStatus.FAILED },
          { where: { id: task.id } }
        );
      });
      
      return task.id;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw new Error('创建任务失败');
    }
  }
  
  // 执行四步流程
  private async executeFourStepProcess(taskId: number): Promise<void> {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) throw new Error('任务不存在');
      
      // 第一步：谋局者（首辅）
      await Task.update({ status: TaskStatus.PLANNING }, { where: { id: taskId } });
      const planningResult = await callKimiAPI(
        ROLES.PLANNER,
        task.user_input
      );
      await Task.update(
        { planning_result: planningResult },
        { where: { id: taskId } }
      );
      
      // 第二步到第三步：执行者和找茬者（最多循环3次）
      let executionResult: string;
      let reviewResult: string | undefined;
      let retryCount = 0;
      const maxRetries = 3;
      
      do {
        // 第二步：执行者（干吏）
        await Task.update({ status: TaskStatus.EXECUTING }, { where: { id: taskId } });
        executionResult = await callKimiAPI(
          ROLES.EXECUTOR,
          planningResult,
          reviewResult
        );
        await Task.update(
          { execution_result: executionResult },
          { where: { id: taskId } }
        );
        
        // 第三步：找茬者（御史）
        await Task.update({ status: TaskStatus.REVIEWING }, { where: { id: taskId } });
        reviewResult = await callKimiAPI(
          ROLES.REVIEWER,
          executionResult
        );
        await Task.update(
          { review_result: reviewResult },
          { where: { id: taskId } }
        );
        
        retryCount++;
      } while (!checkReviewPass(reviewResult) && retryCount < maxRetries);
      
      // 如果超过最大重试次数仍然失败
      if (!checkReviewPass(reviewResult)) {
        throw new Error('审核未通过，已达到最大重试次数');
      }
      
      // 第四步：沉淀者（史官）
      await Task.update({ status: TaskStatus.FINALIZING }, { where: { id: taskId } });
      const fullProcess = `用户需求: ${task.user_input}\n\n` +
                     `第一步 - 谋局者结果: ${planningResult}\n\n` +
                     `第二步 - 执行者结果: ${executionResult}\n\n` +
                     `第三步 - 找茬者结果: ${reviewResult}`;
      
      const finalResult = await callKimiAPI(
        ROLES.FINALIZER,
        fullProcess
      );
      
      // 提取万能模板（简单处理，实际可能需要更复杂的解析）
      const template = finalResult;
      
      // 更新最终结果
      await Task.update(
        {
          status: TaskStatus.COMPLETED,
          final_result: finalResult,
          template: template
        },
        { where: { id: taskId } }
      );
      
    } catch (error) {
      console.error(`四步流程执行失败 (任务 ${taskId}):`, error);
      await Task.update(
        { status: TaskStatus.FAILED },
        { where: { id: taskId } }
      );
      throw error;
    }
  }
  
  // 获取任务状态
  async getTaskStatus(taskId: number): Promise<{ status: TaskStatus; progress: number }> {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('任务不存在');
    
    // 计算进度
    let progress = 0;
    switch (task.status) {
      case TaskStatus.PENDING:
        progress = 0;
        break;
      case TaskStatus.PLANNING:
        progress = 25;
        break;
      case TaskStatus.EXECUTING:
        progress = 50;
        break;
      case TaskStatus.REVIEWING:
        progress = 75;
        break;
      case TaskStatus.FINALIZING:
        progress = 90;
        break;
      case TaskStatus.COMPLETED:
        progress = 100;
        break;
      case TaskStatus.FAILED:
        progress = 0;
        break;
    }
    
    return { status: task.status, progress };
  }
  
  // 获取任务结果
  async getTaskResult(taskId: number): Promise<{
    user_input: string;
    planning_result?: string;
    execution_result?: string;
    review_result?: string;
    final_result?: string;
    template?: string;
    status: TaskStatus;
  }> {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error('任务不存在');
    
    return {
      user_input: task.user_input,
      planning_result: task.planning_result,
      execution_result: task.execution_result,
      review_result: task.review_result,
      final_result: task.final_result,
      template: task.template,
      status: task.status
    };
  }
}

// 导出单例实例
export const cabinetService = new CabinetService();
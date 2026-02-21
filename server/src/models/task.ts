import { Sequelize, DataTypes, Model } from 'sequelize';

// 初始化Sequelize连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  REVIEWING = 'reviewing',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 任务模型
export class Task extends Model {
  public id!: number;
  public user_input!: string;
  public status!: TaskStatus;
  public planning_result?: string;
  public execution_result?: string;
  public review_result?: string;
  public final_result?: string;
  public template?: string;
  public fail_reason?: string;
  public fail_step?: string;
  public retry_count?: number;
  // 各步骤耗时（秒）
  public planning_duration?: number;
  public execution_duration?: number;
  public review_duration?: number;
  public finalizing_duration?: number;
  public created_at!: Date;
  public updated_at!: Date;
}

// 定义模型结构
Task.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_input: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...Object.values(TaskStatus)),
    defaultValue: TaskStatus.PENDING
  },
  planning_result: {
    type: DataTypes.TEXT
  },
  execution_result: {
    type: DataTypes.TEXT
  },
  review_result: {
    type: DataTypes.TEXT
  },
  final_result: {
    type: DataTypes.TEXT
  },
  template: {
    type: DataTypes.TEXT
  },
  fail_reason: {
    type: DataTypes.TEXT
  },
  fail_step: {
    type: DataTypes.STRING
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 各步骤耗时（秒）
  planning_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  execution_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  review_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  finalizing_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// OCR 统计模型
export class OCRStats extends Model {
  public id!: number;
  public month!: string; // YYYY-MM
  public tencent_count!: number;
  public created_at!: Date;
  public updated_at!: Date;
}

OCRStats.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  month: {
    type: DataTypes.STRING(7),
    allowNull: false,
    unique: true
  },
  tencent_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'OCRStats',
  tableName: 'ocr_stats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 同步数据库
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

export { sequelize };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.syncDatabase = exports.Task = exports.TaskStatus = void 0;
const sequelize_1 = require("sequelize");
// 初始化Sequelize连接
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});
exports.sequelize = sequelize;
// 任务状态枚举
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["PLANNING"] = "planning";
    TaskStatus["EXECUTING"] = "executing";
    TaskStatus["REVIEWING"] = "reviewing";
    TaskStatus["FINALIZING"] = "finalizing";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
// 任务模型
class Task extends sequelize_1.Model {
}
exports.Task = Task;
// 定义模型结构
Task.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_input: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(TaskStatus)),
        defaultValue: TaskStatus.PENDING
    },
    planning_result: {
        type: sequelize_1.DataTypes.TEXT
    },
    execution_result: {
        type: sequelize_1.DataTypes.TEXT
    },
    review_result: {
        type: sequelize_1.DataTypes.TEXT
    },
    final_result: {
        type: sequelize_1.DataTypes.TEXT
    },
    template: {
        type: sequelize_1.DataTypes.TEXT
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
// 同步数据库
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('数据库同步成功');
    }
    catch (error) {
        console.error('数据库同步失败:', error);
    }
};
exports.syncDatabase = syncDatabase;
//# sourceMappingURL=task.js.map
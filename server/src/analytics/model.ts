import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../models/task';

// 访问记录模型
export const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referrer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  page: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'visits',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// 页面浏览统计
export const PageView = sequelize.define('PageView', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  page: {
    type: DataTypes.STRING,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'page_views',
  timestamps: false
});

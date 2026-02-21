import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 知识库目录 - 使用绝对路径避免工作目录问题
const KNOWLEDGE_DIR = '/var/www/diyici.ai/knowledge';
const KNOWLEDGE_INDEX = path.join(KNOWLEDGE_DIR, 'index.json');

// 确保知识库目录存在
if (!fs.existsSync(KNOWLEDGE_DIR)) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
}

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// POST /api/knowledge/publish
// 发布知识到知识库
router.post('/publish', async (req, res) => {
  try {
    const { title, category, summary, content, creator } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: '标题和内容不能为空'
      });
    }

    // 生成文件名
    const id = generateId();
    const filename = `${id}.md`;
    const filepath = path.join(KNOWLEDGE_DIR, filename);

    // 保存 Markdown 文件
    fs.writeFileSync(filepath, content, 'utf-8');

    // 读取或创建索引文件
    let index: any = { 
      version: '1.0', 
      updated: new Date().toISOString(), 
      entries: [] 
    };
    
    if (fs.existsSync(KNOWLEDGE_INDEX)) {
      try {
        index = JSON.parse(fs.readFileSync(KNOWLEDGE_INDEX, 'utf-8'));
      } catch (e) {
        console.log('[知识库] 索引文件损坏，创建新索引');
      }
    }
    
    // 确保 entries 数组存在
    if (!index.entries) {
      index.entries = [];
    }

    // 生成开创者名称
    const finalCreator = creator || `开创者${Math.floor(Math.random() * 9000) + 1000}`;

    // 添加到索引 - 使用统一的字段格式
    const knowledgeItem = {
      id,
      title,
      subtitle: summary || '暂无简介',
      description: summary || '暂无简介',
      category: category || '其他',
      file: filename,
      size: `${Math.round(content.length / 1024)}KB`,
      creator: finalCreator,
      created_at: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    index.entries.unshift(knowledgeItem);
    index.updated = new Date().toISOString();

    // 保存索引文件
    fs.writeFileSync(KNOWLEDGE_INDEX, JSON.stringify(index, null, 2), 'utf-8');

    console.log(`[知识库] 新方案已发布: ${title} (ID: ${id})`);

    res.json({
      success: true,
      data: {
        id,
        title,
        category: knowledgeItem.category,
        creator: finalCreator,
        file: knowledgeItem.file,
        autoCategorized: !category
      }
    });
  } catch (error) {
    console.error('发布知识失败:', error);
    res.status(500).json({
      success: false,
      error: '发布失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
});

// GET /api/knowledge/list
// 获取知识库列表
router.get('/list', async (req, res) => {
  try {
    if (!fs.existsSync(KNOWLEDGE_INDEX)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const index = JSON.parse(fs.readFileSync(KNOWLEDGE_INDEX, 'utf-8'));
    res.json({
      success: true,
      data: index.entries || []
    });
  } catch (error) {
    console.error('获取知识库列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取列表失败'
    });
  }
});

export default router;

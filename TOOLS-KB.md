# 知识液化自动发布工具

## 快速发布命令

### 方式1: 手动确认发布
```bash
cd /root/.openclaw/workspace/diyici-source/scripts
./auto-publish.sh
```

### 方式2: 自动发布（无需确认）
```bash
cd /root/.openclaw/workspace/diyici-source/scripts
./auto-publish.sh --auto
```

### 方式3: 发布特定知识
```bash
cd /root/.openclaw/workspace/diyici-source/scripts
./publish-knowledge.sh [知识名称]
```

---

## 自动化工作流（推荐）

### 1. 创建新技能 → 自动发布

```bash
# 1. 初始化技能
python3 skills/skill-creator/scripts/init_skill.py my-skill --path skills --resources scripts

# 2. 编辑 SKILL.md 和脚本
# ...

# 3. 打包技能
python3 skills/skill-creator/scripts/package_skill.py skills/my-skill

# 4. 创建知识文档
cp skills/my-skill/SKILL.md diyici-source/public/knowledge/my-skill.md

# 5. 一键发布
./diyici-source/scripts/auto-publish.sh --auto
```

### 2. OpenClaw 快捷指令

在 OpenClaw 中直接说：

> "发布知识到网站"

我会自动执行：
1. 扫描 workspace 中的新技能
2. 更新知识库索引
3. 构建并部署
4. 返回发布后的访问地址

---

## 文件结构

```
diyici-source/
├── public/
│   ├── knowledge/          # 知识文档 (.md)
│   │   ├── index.json      # 知识库索引
│   │   ├── quad-brain.md
│   │   └── xhs-quad-brain.md
│   └── skills/             # 技能包 (.skill)
│       ├── quad-brain.skill
│       └── xhs-quad-brain.skill
└── scripts/
    ├── publish-knowledge.sh    # 单知识发布
    └── auto-publish.sh         # 自动扫描发布
```

---

## 发布后的访问地址

- **知识库首页**: https://diyici.ai/#/kb
- **知识文档**: https://diyici.ai/knowledge/{name}.md
- **技能包下载**: https://diyici.ai/skills/{name}.skill

---

## 示例: 发布流程

### 示例1: 发布新技能

```bash
# 在 workspace 中
openclaw skill init my-tool
# 编辑...
openclaw skill package my-tool
openclaw kb publish  # 一键发布
```

### 示例2: 在 OpenClaw 中

**用户**: "把刚才的四脑协作技能发布到网站"

**AI**:
> 正在发布...
> - 更新知识库索引 ✓
> - 同步技能包 ✓  
> - 构建项目 ✓
> - 部署到网站 ✓
> 
> 发布成功！
> 🌐 https://diyici.ai/#/kb

---

## 更新记录

- 2026-02-19: 创建自动发布脚本

# 项目开发步骤文档

## 项目概述
创建一个基于 Svelte + Vite + TailwindCSS + shadcn-svelte 的网站，用户可以上传随机人名列表，系统会根据愤怒/讨厌/厌恶程度使用 Groq AI 生成相应的辱骂语句。

## 技术栈
- **前端**: Svelte + Vite
- **样式**: TailwindCSS
- **UI组件**: shadcn-svelte
- **后端**: Node.js (Express) 或 Vite 代理
- **AI服务**: Groq API

## 开发步骤

### 第一步：项目初始化
1. 初始化 Svelte + Vite 项目
2. 安装基础依赖
3. 配置 TailwindCSS
4. 安装和配置 shadcn-svelte

### 第二步：项目结构搭建
```
annoying-people/
├── src/
│   ├── components/         # Svelte 组件
│   ├── server/             # 后端 API（集成到 Vite）
│   │   └── api.js         # API 路由
│   ├── lib/
│   │   └── utils.js
│   ├── App.svelte
│   ├── main.js
│   └── app.css
├── .env.local             # 本地环境变量（不提交到git）
├── .env.local.example     # 环境变量示例
├── .gitignore
├── package.json
├── vite.config.js         # Vite 配置（包含 API 服务器）
└── tailwind.config.js
```

### 第三步：后端 API 开发
1. 在 `src/server/api.js` 中创建 API 处理函数
2. 实现 Groq API 代理端点
   - 接收：人名、愤怒程度（1-10）
   - 调用 Groq API 生成内容
   - 返回生成的文本
3. 在 `vite.config.js` 中使用 Vite 插件集成 Express 服务器
4. 使用环境变量存储 GROQ_API_KEY（在项目根目录的 `.env.local`）
5. 添加 localhost 访问限制
6. 添加 CORS 支持
7. 添加错误处理

### 第四步：前端组件开发
1. **文件上传组件**
   - 支持上传 .txt 或 .csv 文件
   - 解析人名列表
   - 显示上传的人名列表

2. **随机选择组件**
   - 从列表中随机选择一个人名
   - 显示选中的人名

3. **情绪程度输入组件**
   - 滑块或输入框选择愤怒程度（1-10）
   - 显示当前选择的程度

4. **AI 生成组件**
   - 调用后端 API
   - 显示加载状态
   - 显示生成的辱骂语句

5. **主页面布局**
   - 整合所有组件
   - 响应式设计

### 第五步：样式和用户体验优化
1. 使用 TailwindCSS 美化界面
2. 添加加载动画
3. 添加错误提示
4. 响应式布局优化

### 第六步：安全配置
1. 确保 .env.local 在 .gitignore 中
2. 后端验证输入参数
3. 限制 API 调用频率（可选）
4. 错误信息不暴露敏感信息

### 第七步：测试和优化
1. 测试文件上传功能
2. 测试 API 调用
3. 测试不同愤怒程度的效果
4. 优化用户体验

## API 设计

### POST /api/generate
**请求体:**
```json
{
  "name": "张三",
  "angerLevel": 7
}
```

**响应:**
```json
{
  "success": true,
  "content": "生成的辱骂语句..."
}
```

## 环境变量配置

### 项目根目录 .env.local
```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_TEMPERATURE=0.7
GROQ_TEMPERATURE_MULTIPLIER=0.03
GROQ_MAX_TOKENS=100
```

**模型配置说明**:
- `GROQ_MODEL`: Groq 模型名称，默认 `llama-3.1-70b-versatile`
- `GROQ_TEMPERATURE`: 基础温度值（0-2），默认 `0.7`
- `GROQ_TEMPERATURE_MULTIPLIER`: 愤怒程度对温度的调整倍数，默认 `0.03`
- `GROQ_MAX_TOKENS`: 最大生成 token 数，默认 `100`

**注意**: 环境变量文件位于项目根目录，而不是 server 目录。

## 注意事项
1. **API KEY 安全**: 永远不要在前端代码中暴露 API KEY
2. **Localhost 限制**: API 服务器只允许 localhost 访问，确保安全性
3. **CORS 配置**: 确保后端正确配置 CORS 以允许前端请求
4. **错误处理**: 所有错误都要妥善处理，不暴露敏感信息
5. **输入验证**: 验证所有用户输入，防止恶意请求

## 启动命令

### 开发环境
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 GROQ_API_KEY

# 启动开发服务器（前端和后端一起启动）
npm run dev
```

**注意**: 后端已集成到 Vite 开发服务器中，只需一个命令即可启动，且只允许 localhost 访问。

### 生产环境
```bash
# 构建前端
npm run build

# 预览构建结果
npm run preview
```

**注意**: 生产环境需要单独配置 API 服务器，或者使用 Vite 预览模式（仅用于测试）。


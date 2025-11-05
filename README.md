# 随机人名辱骂生成器

基于 Svelte + Vite + TailwindCSS 的网站，用户可以上传随机人名列表，系统会根据愤怒/讨厌/厌恶程度使用 OpenAI API 生成相应的语句。

## 技术栈

- **前端**: Svelte + Vite
- **样式**: TailwindCSS
- **后端**: Node.js (Express)
- **AI服务**: OpenAI API 或 Groq API（可通过环境变量切换）

## 项目结构

```
annoying-people/
├── src/
│   ├── components/          # Svelte 组件
│   │   ├── FileUpload.svelte
│   │   ├── NameSelector.svelte
│   │   ├── AngerLevelInput.svelte
│   │   └── ContentGenerator.svelte
│   ├── server/              # 后端 API（集成到 Vite）
│   │   └── api.js
│   ├── lib/
│   │   └── utils.js
│   ├── App.svelte
│   ├── main.js
│   └── app.css
├── package.json
├── vite.config.js          # Vite 配置（包含 API 服务器）
└── tailwind.config.js
```

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录下创建 `.env.local` 文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，配置 AI 服务提供商和相关 API Key：

```
# AI 服务提供商选择: 'openai' 或 'groq'（默认: openai）
AI_PROVIDER=openai

# OpenAI 配置（当 AI_PROVIDER=openai 时使用）
OPENAI_API_KEY=你的_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_TEMPERATURE_MULTIPLIER=0.03
OPENAI_MAX_TOKENS=100

# Groq 配置（当 AI_PROVIDER=groq 时使用）
GROQ_API_KEY=你的_groq_api_key
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_TEMPERATURE=0.7
GROQ_TEMPERATURE_MULTIPLIER=0.03
GROQ_MAX_TOKENS=100

# 代理配置（仅本地环境使用，生产环境不使用）
# 如果设置了 HTTPS_PROXY 或 HTTP_PROXY，本地环境会自动使用代理
# HTTPS_PROXY=http://your-proxy-server:port
```

**AI 服务提供商配置**:
- `AI_PROVIDER`: 选择使用的 AI 服务，可选值：
  - `openai`: 使用 OpenAI API（默认）
  - `groq`: 使用 Groq API

**OpenAI 配置说明**（当 `AI_PROVIDER=openai` 时）:
- `OPENAI_API_KEY`: OpenAI API Key（通常以 `sk-` 开头）
- `OPENAI_MODEL`: OpenAI 模型名称，默认 `gpt-4o-mini`（推荐使用，性价比高）。其他可选模型：
  - `gpt-4o`: 最新最强模型
  - `gpt-4o-mini`: 快速且经济实惠（推荐）
  - `gpt-4-turbo`: GPT-4 Turbo 模型
  - `gpt-3.5-turbo`: 更便宜的选项
- `OPENAI_TEMPERATURE`: 基础温度值（0-2），默认 `0.7`
- `OPENAI_TEMPERATURE_MULTIPLIER`: 愤怒程度对温度的调整倍数，默认 `0.03`
- `OPENAI_MAX_TOKENS`: 最大生成 token 数，默认 `100`

**Groq 配置说明**（当 `AI_PROVIDER=groq` 时）:
- `GROQ_API_KEY`: Groq API Key（通常以 `gsk_` 开头）
- `GROQ_MODEL`: Groq 模型名称，默认 `llama-3.1-70b-versatile`。其他可选模型：
  - `llama-3.1-70b-versatile`: 强大且通用（推荐）
  - `llama-3.1-8b-instant`: 快速响应
  - `mixtral-8x7b-32768`: Mixtral 模型
- `GROQ_TEMPERATURE`: 基础温度值（0-2），默认 `0.7`
- `GROQ_TEMPERATURE_MULTIPLIER`: 愤怒程度对温度的调整倍数，默认 `0.03`
- `GROQ_MAX_TOKENS`: 最大生成 token 数，默认 `100`

**代理配置**（仅本地环境）:
- 本地环境（`NODE_ENV !== 'production'`）会自动检测并使用代理配置
- 生产环境不会使用代理，直接连接 API
- 如果设置了 `HTTPS_PROXY` 或 `HTTP_PROXY` 环境变量，本地环境会自动使用代理

**注意**: `.env.local.example` 文件已包含在项目中，你可以直接复制使用。

**重要**: 不要将 `.env.local` 提交到 Git！

## 启动项目

### 开发环境

后端已集成到 Vite 开发服务器中，只需一个命令启动：

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

**注意**: 
- API 服务器会自动集成在 Vite 开发服务器中
- 服务器监听在 `0.0.0.0:5173`，可以从局域网内其他设备访问
- API 只允许本地网络访问（localhost、127.0.0.1 或局域网 IP：192.168.x.x, 10.x.x.x, 172.16-31.x.x）
- 启动后，Vite 会显示网络 URL，可以使用该 URL 从局域网内其他设备访问

### 生产环境

**构建前端:**
```bash
npm run build
```

**预览构建结果:**
```bash
npm run preview
```

**注意**: 生产环境需要单独配置 API 服务器，或者使用 Vite 预览模式（仅用于测试）。

## 使用说明

1. **上传人名列表**: 点击上传区域或拖放文件，支持 .txt、.csv 或 Excel (.xlsx/.xls) 格式
2. **选择目标**: 点击"随机选择"按钮或从列表中选择一个人名
3. **设置愤怒程度**: 使用滑块调整愤怒程度（1-10）
4. **生成内容**: 点击"生成内容"按钮，AI 会根据愤怒程度生成相应语句

## 文件格式示例

### .txt 格式
```
张三
李四
王五
赵六
```

### .csv 格式
```
张三,李四,王五,赵六
```

### Excel 格式 (.xlsx/.xls)
Excel 文件支持任意格式，系统会读取第一个工作表的所有单元格内容，自动提取人名。

**示例**:
- 第一列可以是人名，其他列可以是任意内容
- 支持多行多列的人名列表
- 系统会自动提取所有非空单元格的内容作为人名

## 安全注意事项

1. **API KEY 安全**: API KEY 仅存储在 `.env.local` 文件中，永远不会暴露给前端
2. **本地网络限制**: API 服务器只允许本地网络访问（localhost、127.0.0.1 或局域网 IP），确保安全性
3. **输入验证**: 所有用户输入都经过验证，防止恶意请求
4. **错误处理**: 错误信息不暴露敏感信息
5. **局域网访问**: 服务器监听在 `0.0.0.0`，可以从局域网内其他设备访问，但 API 仍限制在本地网络范围内

## 获取 OpenAI API Key

1. 访问 https://platform.openai.com/
2. 注册账号并登录
3. 在 API Keys 页面（https://platform.openai.com/api-keys）创建新的 API Key
4. 将 API Key 添加到项目根目录的 `.env.local` 文件中

**注意事项**:
- API Key 通常以 `sk-` 开头
- 确保账户有足够的余额（OpenAI API 是付费服务）
- 如果遇到 403 错误，可能是：
  - API Key 无效或已过期
  - API Key 没有权限访问该模型
  - 账户余额不足
  - 需要检查 OpenAI 账户状态
- **重要**: OpenAI API 是付费服务，请确保账户有足够的余额。建议使用 `gpt-4o-mini` 模型，性价比最高

## 许可证

MIT


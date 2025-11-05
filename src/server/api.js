import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保加载环境变量（在服务器端运行时）
const projectRoot = join(__dirname, '../../');
// 使用 override: false 确保系统环境变量优先
// 但会加载 .env 文件中不存在于系统环境变量中的值
dotenv.config({ path: join(projectRoot, '.env.local'), override: false });
dotenv.config({ path: join(projectRoot, '.env'), override: false });

// 判断是否使用代理（本地环境使用，生产环境不使用）
const isLocalEnv = process.env.NODE_ENV !== 'production';
const useProxy = isLocalEnv && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY);

let openaiClient = null;
let groqClient = null;

// 获取代理配置（仅本地环境）
function getProxyAgent() {
  if (!useProxy) {
    return undefined;
  }
  
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxyUrl) {
    console.log('本地环境检测到代理配置，使用代理:', proxyUrl);
    return new HttpsProxyAgent(proxyUrl);
  }
  return undefined;
}

function getOpenAIClient() {
  if (!openaiClient) {
    let apiKey = process.env.OPENAI_API_KEY;
    console.log('原始 OpenAI API Key:', apiKey ? apiKey.substring(0, 15) + '...' : '未设置');
    console.log('API Key 长度:', apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      console.error('环境变量 OPENAI_API_KEY 未设置');
      throw new Error('OPENAI_API_KEY 环境变量未设置');
    }
    
    // 清理 API Key（去除可能的空格和换行符）
    apiKey = apiKey.trim();
    
    // 检查 API Key 格式（OpenAI API Key 通常以 sk- 开头）
    if (!apiKey.startsWith('sk-')) {
      console.warn('警告: API Key 格式可能不正确（OpenAI API Key 通常以 sk- 开头）');
    }
    
    const httpAgent = getProxyAgent();
    console.log('创建 OpenAI 客户端，使用 API Key:', apiKey.substring(0, 15) + '...');
    console.log('环境:', isLocalEnv ? '本地（' + (httpAgent ? '使用代理' : '不使用代理') + '）' : '生产');
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
      httpAgent: httpAgent  // 本地环境使用代理，生产环境不使用
    });
    console.log('OpenAI 客户端创建成功');
  }
  return openaiClient;
}

function getGroqClient() {
  if (!groqClient) {
    let apiKey = process.env.GROQ_API_KEY;
    console.log('原始 Groq API Key:', apiKey ? apiKey.substring(0, 15) + '...' : '未设置');
    console.log('API Key 长度:', apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      console.error('环境变量 GROQ_API_KEY 未设置');
      throw new Error('GROQ_API_KEY 环境变量未设置');
    }
    
    // 清理 API Key（去除可能的空格和换行符）
    apiKey = apiKey.trim();
    
    // 检查 API Key 格式（Groq API Key 通常以 gsk_ 开头）
    if (!apiKey.startsWith('gsk_')) {
      console.warn('警告: API Key 格式可能不正确（Groq API Key 通常以 gsk_ 开头）');
    }
    
    const httpAgent = getProxyAgent();
    console.log('创建 Groq 客户端，使用 API Key:', apiKey.substring(0, 15) + '...');
    console.log('环境:', isLocalEnv ? '本地（' + (httpAgent ? '使用代理' : '不使用代理') + '）' : '生产');
    
    groqClient = new Groq({
      apiKey: apiKey,
      httpAgent: httpAgent  // 本地环境使用代理，生产环境不使用
    });
    console.log('Groq 客户端创建成功');
  }
  return groqClient;
}

export async function generateContent(req, res) {
  try {
    const { name, angerLevel } = req.body;

    // 输入验证
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '请输入有效的人名'
      });
    }

    if (!angerLevel || typeof angerLevel !== 'number' || angerLevel < 1 || angerLevel > 10) {
      return res.status(400).json({
        success: false,
        error: '愤怒程度必须在 1-10 之间'
      });
    }

    // 根据愤怒程度生成不同的提示词
    const angerDescriptions = {
      1: '轻微不满',
      2: '有点不满',
      3: '不太喜欢',
      4: '有点讨厌',
      5: '比较讨厌',
      6: '相当讨厌',
      7: '非常讨厌',
      8: '极度厌恶',
      9: '深恶痛绝',
      10: '恨之入骨'
    };

    const description = angerDescriptions[angerLevel] || '讨厌';

    // 构建提示词
    const prompt = `请根据愤怒程度为 ${angerLevel}（${description}），针对"${name}"这个人，生成一句符合该愤怒程度的批判性语句。要求：
    1. 语句要符合愤怒程度 ${angerLevel} 的强度
    2. 语言要犀利但不涉及违法内容
    3. 长度控制在 20-50 字之间
    4. 直接输出语句，不要添加任何解释`;

    // 根据环境变量决定使用哪个 AI 服务
    const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    console.log('使用 AI 服务提供商:', aiProvider);

    let content = '生成失败';

    if (aiProvider === 'groq') {
      // 使用 Groq API
      const groq = getGroqClient();
      
      // 从环境变量获取模型配置，如果没有则使用默认值
      const model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
      const baseTemperature = parseFloat(process.env.GROQ_TEMPERATURE || '0.7');
      const maxTokens = parseInt(process.env.GROQ_MAX_TOKENS || '100');
      const temperatureMultiplier = parseFloat(process.env.GROQ_TEMPERATURE_MULTIPLIER || '0.03');
      
      // 根据愤怒程度调整温度
      const temperature = baseTemperature + (angerLevel * temperatureMultiplier);
      
      console.log('使用 Groq 模型配置:', { model, temperature, maxTokens });
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: model,
        temperature: temperature,
        max_tokens: maxTokens
      });

      content = completion.choices[0]?.message?.content?.trim() || '生成失败';
      
    } else {
      // 使用 OpenAI API（默认）
      const openai = getOpenAIClient();
      
      // 从环境变量获取模型配置，如果没有则使用默认值
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const baseTemperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');
      const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '100');
      const temperatureMultiplier = parseFloat(process.env.OPENAI_TEMPERATURE_MULTIPLIER || '0.03');
      
      // 根据愤怒程度调整温度
      const temperature = baseTemperature + (angerLevel * temperatureMultiplier);
      
      console.log('使用 OpenAI 模型配置:', { model, temperature, maxTokens });
      
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: model,
        temperature: temperature,
        max_tokens: maxTokens
      });

      content = completion.choices[0]?.message?.content?.trim() || '生成失败';
    }

    res.json({
      success: true,
      content: content
    });

  } catch (error) {
    const aiProvider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    const providerName = aiProvider === 'groq' ? 'Groq' : 'OpenAI';
    
    console.error(`${providerName} API 错误:`, error);
    console.error('错误详情:', {
      status: error.status,
      message: error.message,
      error: error.error,
      name: error.name
    });
    
    // 检查 API Key 状态
    const apiKey = aiProvider === 'groq' ? process.env.GROQ_API_KEY : process.env.OPENAI_API_KEY;
    const expectedPrefix = aiProvider === 'groq' ? 'gsk_' : 'sk-';
    
    console.error('API Key 状态:', {
      '是否存在': !!apiKey,
      '长度': apiKey ? apiKey.length : 0,
      '前缀': apiKey ? apiKey.substring(0, 10) + '...' : '无',
      '格式': apiKey ? (apiKey.startsWith(expectedPrefix) ? '正确' : '可能不正确') : '未设置'
    });
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = '生成内容时发生错误，请稍后重试';
    let statusCode = 500;
    
    if (error.status === 403 || error.status === 401) {
      const apiKeyEnv = aiProvider === 'groq' ? 'GROQ_API_KEY' : 'OPENAI_API_KEY';
      errorMessage = 'API Key 无效或权限不足。请检查：\n' +
                     `1. ${apiKeyEnv} 是否正确配置\n` +
                     '2. API Key 是否有效且未过期\n' +
                     '3. API Key 是否有权限访问该模型\n' +
                     (aiProvider === 'openai' ? '4. 账户余额是否充足' : '4. 账户配额是否充足');
      statusCode = 403;
    } else if (error.status === 429) {
      errorMessage = 'API 调用频率过高，请稍后再试';
      statusCode = 429;
    } else if (error.status === 400) {
      errorMessage = '请求参数错误，请检查模型配置';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
}


// 使用官方推荐的方式测试 Groq API（支持代理配置）
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';

// 加载环境变量
dotenv.config({ path: '.env.local' });

console.log('=== 使用官方方式测试 Groq API ===\n');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : '未设置');

// 配置代理（如果设置了 HTTP_PROXY 或 HTTPS_PROXY 环境变量）
let httpAgent = undefined;
if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  console.log('检测到代理配置:', proxyUrl);
  httpAgent = new HttpsProxyAgent(proxyUrl);
}

// 官方方式：不显式传入 apiKey，让 SDK 自动从环境变量读取
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // 明确指定，确保使用正确的 key
  httpAgent: httpAgent // 如果设置了代理，则使用代理
});

console.log('\n测试模型: llama-3.3-70b-versatile\n');

try {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Say 'Hello World' in Chinese"
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1,
    max_completion_tokens: 100, // 官方使用 max_completion_tokens
    top_p: 1,
    stream: false // 先不用 stream，便于调试
  });

  console.log('✅ API 调用成功！');
  console.log('响应:', chatCompletion.choices[0]?.message?.content);
  
} catch (error) {
  console.error('❌ API 调用失败');
  console.error('错误:', error.status, error.message);
  console.error('错误详情:', error.error);
  
  if (error.status === 403) {
    console.error('\n尝试其他模型...\n');
    
    // 尝试 llama-3.1 系列
    try {
      const result = await groq.chat.completions.create({
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3.1-70b-versatile",
        max_completion_tokens: 10
      });
      console.log('✅ llama-3.1-70b-versatile 可用！');
    } catch (err) {
      console.error('❌ llama-3.1-70b-versatile 失败:', err.status);
    }
    
    // 尝试 8b 模型
    try {
      const result = await groq.chat.completions.create({
        messages: [{ role: "user", content: "Hello" }],
        model: "llama-3.1-8b-instant",
        max_completion_tokens: 10
      });
      console.log('✅ llama-3.1-8b-instant 可用！');
    } catch (err) {
      console.error('❌ llama-3.1-8b-instant 失败:', err.status);
    }
  }
}


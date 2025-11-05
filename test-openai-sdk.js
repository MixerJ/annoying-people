// 使用 OpenAI SDK 访问 Groq API
import OpenAI from "openai";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

console.log('=== 使用 OpenAI SDK 访问 Groq API ===\n');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : '未设置');

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

console.log('\n测试基本文本对话...\n');

try {
  // 测试基本的 chat completion
  const chatCompletion = await client.chat.completions.create({
    model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    messages: [
      {
        role: "user",
        content: "Say 'Hello World' in Chinese"
      }
    ],
    max_tokens: 50
  });

  console.log('✅ API 调用成功！');
  console.log('响应:', chatCompletion.choices[0]?.message?.content);
  
} catch (error) {
  console.error('❌ API 调用失败');
  console.error('状态码:', error.status);
  console.error('错误信息:', error.message);
  console.error('错误详情:', error.error);
  
  if (error.status === 403) {
    console.error('\n尝试其他模型...\n');
    
    const testModels = [
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma-7b-it'
    ];
    
    for (const model of testModels) {
      try {
        const result = await client.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 10
        });
        console.log(`✅ ${model} 可用！`);
        console.log(`   响应: ${result.choices[0]?.message?.content}`);
        break;
      } catch (err) {
        console.error(`❌ ${model} 失败: ${err.status}`);
      }
    }
  }
}


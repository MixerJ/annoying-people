import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('=== 使用 OpenAI Responses API 测试 Groq ===');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 15) + '...' : '未设置');

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

try {
  const response = await client.responses.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "What are the main colors in this image? Give me the hex code for each color in a list.",
          },
          {
            type: "input_image",
            detail: "auto",
            image_url: "https://console.groq.com/og_cloud.png",
          },
        ],
      },
    ],
  });

  console.log('\n✅ Responses API 调用成功！');
  console.log('输出文本:\n', response.output_text);
} catch (error) {
  console.error('\n❌ Responses API 调用失败');
  console.error('状态码:', error.status);
  console.error('错误信息:', error.message);
  console.error('错误详情:', error.error);
}

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateContent } from './src/server/api.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量（支持 .env.local 和 .env）
// 使用 override: false 确保系统环境变量优先，但会加载 .env 文件中不存在于系统环境变量中的值
// 先加载 .env.local（如果存在），再加载 .env
dotenv.config({ path: join(__dirname, '.env.local'), override: false });
dotenv.config({ path: join(__dirname, '.env'), override: false });

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'api-server',
      configureServer(server) {
        // 确保环境变量已加载（在服务器启动时重新加载）
        // 使用 override: false 确保系统环境变量优先
        dotenv.config({ path: join(__dirname, '.env.local'), override: false });
        dotenv.config({ path: join(__dirname, '.env'), override: false });
        
        console.log('API 服务器启动，检查环境变量...');
        console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '已设置 (' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : '未设置');
        console.log('环境变量来源:', {
          'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? '已设置' : '未设置',
          'OPENAI_MODEL': process.env.OPENAI_MODEL || '使用默认值',
          'OPENAI_TEMPERATURE': process.env.OPENAI_TEMPERATURE || '使用默认值'
        });
        
        // 创建 Express 应用
        const app = express();

        // 中间件
        app.use(express.json());
        app.use(cors({
          origin: (origin, callback) => {
            // 允许 localhost、127.0.0.1 和局域网 IP 访问
            if (!origin || 
                origin.includes('localhost') || 
                origin.includes('127.0.0.1') ||
                /^http:\/\/192\.168\./.test(origin) ||
                /^http:\/\/10\./.test(origin) ||
                /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./.test(origin)) {
              callback(null, true);
            } else {
              callback(new Error('不允许的源'));
            }
          },
          credentials: true
        }));

        // 只允许本地网络访问的中间件（localhost 或局域网 IP）
        app.use((req, res, next) => {
          const host = req.headers.host || '';
          const referer = req.headers.referer || '';
          const ip = req.socket.remoteAddress || '';
          
          // 检查是否是 localhost、127.0.0.1 或局域网 IP（192.168.x.x, 10.x.x.x, 172.16-31.x.x）
          const isLocalhost = host.includes('localhost') || 
                             host.includes('127.0.0.1') ||
                             referer.includes('localhost') ||
                             referer.includes('127.0.0.1') ||
                             /^192\.168\./.test(ip) ||
                             /^10\./.test(ip) ||
                             /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
                             ip === '::1' ||
                             ip === '::ffff:127.0.0.1';
          
          if (isLocalhost) {
            next();
          } else {
            res.status(403).json({
              success: false,
              error: '只允许从本地网络访问'
            });
          }
        });

        // 健康检查
        app.get('/api/health', (req, res) => {
          res.json({ status: 'ok' });
        });

        // API 路由
        app.post('/api/generate', generateContent);

        // 错误处理
        app.use((err, req, res, next) => {
          console.error('API 服务器错误:', err);
          res.status(500).json({
            success: false,
            error: '服务器内部错误'
          });
        });

        // 将 Express 应用挂载到 Vite 开发服务器
        server.middlewares.use(app);
      }
    }
  ],
  server: {
    port: 5173,
    host: '0.0.0.0', // 允许从其他设备访问（局域网）
    strictPort: true
  }
});

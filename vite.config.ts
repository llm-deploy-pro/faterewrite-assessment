import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ✅ 固定端口 5178；strictPort = true 表示被占用就报错，不自动换端口
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5178,
    strictPort: true,
    open: true, // 启动自动打开浏览器
  },
  preview: {
    host: true,
    port: 5178,
    strictPort: true,
    open: true,
  },
  // 🔺 新增：路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
/*
 * @Descripttion: vite配置
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:35:28
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-23 10:26:35
 */
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium'
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cesium()
  ],
  resolve: {
    // https://cnvitejs.dev/config/#resolve-alias
    alias: {
      // 设置路径
      '~': path.resolve(__dirname, './'),
      // 设置别名
      '@': path.resolve(__dirname, './src'),
      '@img': path.resolve(__dirname, './src/assets/img'), // 设置别名路径，根据实际目录结构进行调整
    }
    // https://cn.vitejs.dev/config/#resolve-extensions
    // extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.html']
  },
  // const env = loadEnv(mode, process.cwd()),
  define: {
    'process.env': {               // 内容自定义，根据项目需求
      VUE_APP_UCS_URL: '/ucs',                  // 内容自定义，根据项目需求
      VUE_APP_UCS_UPLOAD_URL: '/upload',         // 内容自定义，根据项目需求
      VUE_APP_BASE_API: '/api'
    },
  },
  server: {
    port: 81,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
}
)

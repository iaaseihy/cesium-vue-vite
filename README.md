# Cesium + Vue 3 + Vite 三维展示平台

## 环境要求

- **Node.js** >= 16（推荐 18 LTS）
- **npm** >= 8

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 浏览器访问 http://localhost:5173
```

## 构建生产版本

```bash
npm run build
```

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | ^3.5 | 前端框架 |
| Vite 3 | ^3.2 | 构建工具 |
| Cesium | 1.104.0 | 三维地球引擎 |
| Element Plus | ^2.2 | UI 组件库 |
| Vuex 4 | ^4.0 | 状态管理 |
| Vue Router 4 | ^4.0 | 路由 |
| Three.js | ^0.138 | 3D 渲染（部分场景） |

## 项目结构

```
src/
  ├── components/       # 组件
  │   ├── commonJS/     # 公共工具（createViewer, config 等）
  │   └── views/        # 页面视图
  │       ├── cesium/   # Cesium 相关功能页面
  │       └── three/    # Three.js 相关页面
  ├── router/           # 路由配置
  ├── store/            # Vuex 状态管理
  └── main.js           # 入口文件
```

## 说明

- 默认使用在线高德影像和 Cesium Ion 全球地形，无需本地数据服务
- 倾斜摄影模型使用 mars3d 公共在线数据
- 如需使用本地数据服务，修改 `src/components/commonJS/config.js` 中的 URL 即可

/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:49:25
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-28 10:24:51
 */

import { createRouter, createWebHashHistory } from 'vue-router'
/** * @description: 公共路由 */
export const constantRoutes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/Home/login.vue')
  },
  {
    path: '/animationgroup',
    name: 'Animationgroup',
    component: () => import('@/components/views/misc_animation_groups.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/Home/register/index.vue'),
    hidden: true
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home/index.vue')
  },
  {
    path: '/cesiumContainer',
    name: 'CesiumContainer',
    component: () => import('@/components/views/CesiumContainer.vue')// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
  },
  {
    path: '/heatmap2d',
    name: 'Heatmap2d',
    component: () => import('@/components/views/cesium/heatmap2D/Heatmap2D.vue')// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
  },
  {
    path: '/windy2D',
    name: 'canvasWindy2D',
    component: () => import('@/components/views/cesium/canvasWindy2D/canvasWindy2D.vue')// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
  },
  {
    path: '/windy3D',
    name: 'canvasWindy3D',
    component: () => import('@/components/views/cesium/canvasWindy3D/canvasWindy3D.vue')// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
  },
  {
    path: '/pointCluster',
    name: 'PointCluster',
    component: () => import('@/components/views/cesium/pointCluster/PointCluster.vue')// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
  },
  {
    path: '/primitiveCluster',
    name: 'PrimitiveCluster',
    component: () => import('@/components/views/cesium/pointCluster/PrimitiveCluster.vue')// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
  },
  {
    path: '/radarscan',
    name: 'CesiumRadarScan',
    component: () => import('@/components/views/CesiumRadarScan.vue')
  },
  {
    path: '/animationbinding',
    name: 'AnimationBinding',
    component: () => import('@/components/views/AnimationBinding.vue')
  },
  {
    path: '/view',
    name: 'defaultView',
    component: () => import('../views/CesiumContainer.vue')
  },
  {
    path: '/roaming',
    name: 'Roam',
    component: () => import('../components/views/three/roaming/Roaming.vue')
  },
  {
    path: '/fireFence',
    name: 'FireFence',
    component: () => import('../components/views/three/fireFence/FireFence.vue')
  },
  {
    path: '/eldenRing',
    name: 'EldenRing',
    component: () => import('../components/views/three/eldenRing/EldenRing.vue')
  },
  {
    path: '/qrcodeScan',
    name: 'QRcodeScan',
    component: () => import('../components/views/webRTC/h5ScanQrcode/home.vue')
  }
  ,
  {
    path: '/scan',
    name: 'Scan',
    component: () => import('../components/views/webRTC/h5ScanQrcode/scan.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

export default router

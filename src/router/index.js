/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:49:25
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 17:26:06
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
})

export default router

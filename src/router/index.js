/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-05-29 16:56:11
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-19 14:28:35
 */

// import { createRouter, createWebHashHistory } from 'vue-router'
/** * @description: 公共路由 */
const EmptyRouterView = () =>
  import("@/views/routerViews/emptyRouterViews.vue");
const routes = [
  {
    path: "/login",
    component: EmptyRouterView,
    meta: {
      title: "注册登录",
    },
    children: [
      {
        path: '/',
        name: 'Login',
        component: () => import('@/views/Home/login.vue'),
        meta: {
          title: "登录",
          activePath: "/login/login",
        },
      },
      {
        path: '/register',
        component: () => import('@/views/Home/register/index.vue'),
        hidden: true,
        meta: {
          title: "注册",
          activePath: "/login/register",
        },
      },
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home/index.vue'),
        meta: {
          title: "主页",
          activePath: "/login/home",
        },
      },
    ]
  },
  {
    path: "/threejs",
    component: EmptyRouterView,
    meta: {
      title: "threejs",
    },
    children: [
      {
        path: '/animationgroup',
        name: 'Animationgroup',
        component: () => import('@/components/views/misc_animation_groups.vue'),
        meta: {
          title: "animationgroup",
          activePath: "/threejs/animationgroup",
        },
      },
      {
        path: '/roaming',
        name: 'Roam',
        component: () => import('../components/views/three/roaming/Roaming.vue'),
        meta: {
          title: "roaming",
          activePath: "/threejs/roaming",
        },
      },
      {
        path: '/fireFence',
        name: 'FireFence',
        component: () => import('../components/views/three/fireFence/FireFence.vue'),
        meta: {
          title: "火焰围墙",
          activePath: "/threejs/fireFence",
        },
      },
      {
        path: '/eldenRing',
        name: 'EldenRing',
        component: () => import('../components/views/three/eldenRing/EldenRing.vue'),
        meta: {
          title: "艾尔登法环",
          activePath: "/threejs/eldenRing",
        },
      },
      {
        path: '/threeHeatmap',
        name: 'ThreeHeatmap',
        component: () => import('../components/views/three/heatmap3D/ThreeHeatmap3D.vue'),
        meta: {
          title: "高度热力图",
          activePath: "/threejs/threeHeatmap",
        },
      },
      {
        path: '/animationbinding',
        name: 'AnimationBinding',
        component: () => import('@/components/views/AnimationBinding.vue'),
        meta: {
          title: "animationbinding",
          activePath: "/threejs/animationbinding",
        },
      },
    ]
  },
  {
    path: "/cesium",
    component: EmptyRouterView,
    meta: {
      title: "cesium",
    },
    children: [
      {
        path: '/cesiumContainer',
        name: 'CesiumContainer',
        component: () => import('@/components/views/CesiumContainer.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "cesium主页",
          activePath: "/cesium/cesiumContainer",
        },
      },
      {
        path: '/heatmap2d',
        name: 'Heatmap2d',
        component: () => import('@/components/views/cesium/heatmap2D/Heatmap2D2.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "2d热力图",
          activePath: "/cesium/heatmap2d",
        },
      },
      {
        path: '/heatmap2d2',
        name: 'Heatmap2d2',
        component: () => import('@/components/views/cesium/heatmap2D/way2/Heatmap2d.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "2d热力图方法二",
          activePath: "/cesium/heatmap2d2",
        },
      },
      {
        path: '/heatmap3d',
        name: 'Heatmap3d',
        component: () => import('@/components/views/cesium/heatmap3D/Heatmap3D.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "3d热力图",
          activePath: "/cesium/heatmap3d",
        },
      },
      {
        path: '/dynamicCircle',
        name: 'DynamicCircle',
        component: () => import('@/components/views/cesium/dynamicCircle/DynamicCircle.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "动态扩散圆环",
          activePath: "/cesium/dynamicCircle",
        },
      },
      {
        path: '/classification',
        name: 'Classification',
        component: () => import('@/components/views/cesium/classification/Classification.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "分层分户",
          activePath: "/cesium/classification",
        },
      },
      {
        path: '/modelSeprate',
        name: 'ModelSeprate',
        component: () => import('@/components/views/cesium/classification/ModelSeprate.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "模型拆解",
          activePath: "/cesium/modelSeprate",
        },
      },
      {
        path: '/monomerSingle',
        name: 'MonomerSingle',
        component: () => import('@/components/views/cesium/classification/dynamicMonomer/DynamicMonomerSingle1.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "动态单体化single",
          activePath: "/cesium/monomerSingle",
        },
      },
      {
        path: '/monomerWhole',
        name: 'MonomerWhole',
        component: () => import('@/components/views/cesium/classification/dynamicMonomer/DynamicMonomerWhole.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "动态单体化whole",
          activePath: "/cesium/monomerWhole",
        },
      },
      {
        path: '/busRoutes',
        name: 'BusRoutes',
        component: () => import('@/components/views/cesium/multiRoutesPlay/BusSimulation.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "班车轨迹回放",
          activePath: "/cesium/busRoutes",
        },
      },
      {
        path: '/edgeStage',
        name: 'EdgeStage',
        component: () => import('@/components/views/cesium/edgeStage/EdgeStage.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "entity primitive 3dtiles描边",
          activePath: "/cesium/edgeStage",
        },
      },
      {
        path: '/windy2D',
        name: 'canvasWindy2D',
        component: () => import('@/components/views/cesium/canvasWindy2D/canvasWindy2D.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "2d风场",
          activePath: "/cesium/windy2D",
        },
      },
      {
        path: '/windy3D',
        name: 'canvasWindy3D',
        component: () => import('@/components/views/cesium/canvasWindy3D/canvasWindy3D.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "3d风场",
          activePath: "/cesium/windy3D",
        },
      },
      {
        path: '/pointCluster',
        name: 'PointCluster',
        component: () => import('@/components/views/cesium/pointCluster/PointCluster.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "entity点聚合",
          activePath: "/cesium/pointCluster",
        },
      },
      {
        path: '/primitiveCluster',
        name: 'PrimitiveCluster',
        component: () => import('@/components/views/cesium/pointCluster/PrimitiveCluster1.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "primitive点聚合",
          activePath: "/cesium/primitiveCluster",
        },
      },
      {
        path: '/cesiumRoad',
        name: 'CesiumRoad',
        component: () => import('@/components/views/cesium/road/throughRoad.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "道路穿梭",
          activePath: "/cesium/cesiumRoad",
        },
      },
      {
        path: '/radarscan',
        name: 'CesiumRadarScan',
        component: () => import('@/components/views/CesiumRadarScan.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "雷达扫描",
          activePath: "/cesium/radarscan",
        },
      },
      {
        path: '/view',
        name: 'defaultView',
        component: () => import('../views/CesiumContainer.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "默认视图",
          activePath: "/cesium/view",
        },
      },
    ]
  },
  {
    path: "/webRTC",
    component: EmptyRouterView,
    meta: {
      title: "webRTC",
    },
    children: [
      {
        path: '/qrcodeScan',
        name: 'QRcodeScan',
        component: () => import('../components/views/webRTC/h5ScanQrcode/home.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "二维码扫描",
          activePath: "/webRTC/qrcodeScan",
        },
      },
      {
        path: '/scan',
        name: 'Scan',
        component: () => import('../components/views/webRTC/h5ScanQrcode/scan.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "二维码扫描",
          activePath: "/webRTC/scan",
        },
      }
    ]
  }
]
export default routes;

// const router = createRouter({
//   history: createWebHashHistory(),
//   routes: constantRoutes
// })

// export default router

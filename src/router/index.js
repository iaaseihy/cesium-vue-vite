/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-05-29 16:56:11
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-11-03 16:32:36
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
      {
        path: '/timeTunnel',
        name: 'TimeTunnel',
        component: () => import('@/components/views/three/timeTunnel/TimeTunnel.vue'),
        meta: {
          title: "时空隧道",
          activePath: "/threejs/timeTunnel",
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
        path: '/clipModel',
        name: 'ClipModel',
        component: () => import('@/components/views/cesium/modelClip/ModelClip.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "模型裁剪",
          activePath: "/cesium/clipModel",
        },
      },
      {
        path: '/fppRoaming',
        name: 'FppRoaming',
        component: () => import('@/components/views/cesium/fppRoaming/FPPRoming.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "第一人称漫游",
          activePath: "/cesium/fppRoaming",
        },
      },
      {
        path: '/roaming2',
        name: 'Roaming',
        component: () => import('@/components/views/cesium/roaming/FPPRoming.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "漫游2",
          activePath: "/cesium/roaming",
        },
      },
      {
        path: '/rocket',
        name: 'Rocket',
        component: () => import('@/components/views/cesium/rocketLaunch/rocket.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "火箭发射",
          activePath: "/cesium/rocket",
        },
      },
      {
        path: '/wmsLayer',
        name: 'WmsLayer',
        component: () => import('@/components/views/cesium/wmsLayer/wmsLayer.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "wms查询",
          activePath: "/cesium/wmsLayer",
        },
      },
      {
        path: '/trackMatte',
        name: 'TrackMatte',
        component: () => import('@/components/views/cesium/trackMatte/trackMatte.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "反选遮罩",
          activePath: "/cesium/trackMatte",
        },
      },
      {
        path: '/cloud',
        name: 'Cloud',
        component: () => import('@/components/views/cesium/cloud/cloud.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "添加云层",
          activePath: "/cesium/cloud",
        },
      },
      {
        path: '/dynamicWall',
        name: 'DynamicWall',
        component: () => import('@/components/views/cesium/shaderEdit/dynamicWall.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "动态立体墙",
          activePath: "/cesium/dynamicWall",
        },
      },
      {
        path: '/unrealBloom',
        name: 'UnrealBloom',
        component: () => import('@/components/views/cesium/unrealBloom/unrealBloom.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "UnrealBloom泛光",
          activePath: "/cesium/unrealBloom",
        },
      },
      {
        path: '/multiView',
        name: 'MultiView',
        component: () => import('@/components/views/cesium/multiView/index.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "多屏分屏",
          activePath: "/cesium/multiView",
        },
      },
      {
        path: '/texture3D',
        name: 'Texture3D',
        component: () => import('@/components/views/cesium/texture3D/texture3D.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "体渲染",
          activePath: "/cesium/texture3D",
        },
      },
      {
        path: '/subMerged',
        name: 'subMerged',
        component: () => import('@/components/views/cesium/subMerged/subMerged.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "淹没分析",
          activePath: "/cesium/subMerged",
        },
      },
      {
        path: '/dam',
        name: 'dam',
        component: () => import('@/components/views/cesium/dam/layout/layout.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "大坝",
          activePath: "/cesium/dam",
        },
      },
      {
        path: '/measure',
        name: 'measure',
        component: () => import('@/components/views/cesium/measure/measure.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "测量工具",
          activePath: "/cesium/measure",
        },
      },
      {
        path: '/darkMap',
        name: 'DarkMap',
        component: () => import('@/components/views/cesium/darkMap/darkMap.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "暗色电子地图",
          activePath: "/cesium/darkMap",
        },
      },
      {
        path: '/modifyRegion',
        name: 'ModifyRegion',
        component: () => import('@/components/views/cesium/modifyRegion/ModifyRegion.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "地形抹平",
          activePath: "/cesium/modifyRegion",
        },
      },
      {
        path: '/markGrid',
        name: 'MarkGrid',
        component: () => import('@/components/views/cesium/markGrid/markGrid.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "标注网格",
          activePath: "/cesium/markGrid",
        },
      },
      {
        path: '/trailLineFlyPath',
        name: 'TrailLineFlyPath',
        component: () => import('@/components/views/cesium/trailLineFlyPath/TrailLineFlyPath.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "航行路线",
          activePath: "/cesium/trailLineFlyPath",
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
      {
        path: '/vFor',
        name: 'vFor',
        component: () => import('@/components/views/cesium/vFor/vFor.vue'),// 路由懒加载，直接在这里引入了CesiumContainer并且赋值给了component;
        meta: {
          title: "v_for v-if",
          activePath: "/cesium/vFor",
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

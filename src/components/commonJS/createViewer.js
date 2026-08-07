/**
 * Cesium Viewer 工厂函数
 * 统一管理 Viewer 创建的公共配置，避免每个页面重复编写
 *
 * 使用方式:
 *   import { createViewer } from '@/components/commonJS/createViewer'
 *   const viewer = createViewer('cesiumContainer', {
 *     imageryProvider: new Cesium.UrlTemplateImageryProvider({ ... }),
 *     terrainProvider: Cesium.createWorldTerrain(),
 *     showLatLng: true,        // 是否显示经纬度HUD
 *     showSkyBox: true,        // 是否显示自定义星空
 *     showFps: true,           // 是否显示帧率
 *     shouldAnimate: true,
 *   })
 *
 * 所有参数均可覆盖，未提供的将使用默认值
 */
import * as Cesium from 'cesium'
import {
  LOCAL_IMG_URL,
  LOCAL_TERRAIN_URL,
} from './config'
import {
  BaiduImageryProvider,
  AmapImageryProvider,
} from './BaiduImageryProvider'
import positiveX from '@img/SkyBox/00h+00.jpg'
import negativeX from '@img/SkyBox/12h+00.jpg'
import positiveY from '@img/SkyBox/06h+00.jpg'
import negativeY from '@img/SkyBox/18h+00.jpg'
import positiveZ from '@img/SkyBox/06h+90.jpg'
import negativeZ from '@img/SkyBox/06h-90.jpg'

/** 默认 Ion token（使用项目中出现最多的那个） */
export const DEFAULT_ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMmEyNjk5Ni02YjM4LTQ1NWUtOTk3Ny1mMzg5ZDFkZGEwYjYiLCJpZCI6MjYzODMsImlhdCI6MTY2NTczNDAwNX0.E8DSOKZagTy0leqyheZVzpjwrh3AactCSgQF3v22T2Q'

/** 默认 UI 控件配置（大多数页面共用） */
export const DEFAULT_UI_OPTIONS = {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  geocoder: false,
  infoBox: false,
  selectionIndicator: false,
  navigationInstructionsInitiallyVisible: false,
}

/** 默认影像 Provider（本地影像） */
export function createDefaultImageryProvider() {
  return new Cesium.UrlTemplateImageryProvider({
    url: LOCAL_IMG_URL,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    fileExtension: 'png',
    minimumLevel: 0,
    maximumLevel: 19,
  })
}

/** 默认地形 Provider（Google 全球地形） */
export function createDefaultTerrainProvider() {
  return Cesium.createWorldTerrain({
    requestVertexNormals: true,
    requestWaterMask: false,
  })
}

/** 自定义星空盒 */
export function createDefaultSkyBox() {
  return new Cesium.SkyBox({
    sources: {
      positiveX,
      negativeX,
      positiveY,
      negativeY,
      positiveZ,
      negativeZ,
    },
  })
}

/**
 * 创建经纬度 / 海拔 HUD
 * @param {Cesium.Viewer} viewer
 * @returns {Cesium.ScreenSpaceEventHandler} handler（用于后续销毁）
 */
export function setupLatLngHUD(viewer) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
  const ellipsoid = viewer.scene.globe.ellipsoid
  const longitudeEl = document.getElementById('longitude_show')
  const latitudeEl = document.getElementById('latitude_show')
  const altitudeEl = document.getElementById('altitude_show')
  const elevationEl = document.getElementById('elevation_show')

  handler.setInputAction(function (movement) {
    const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid)
    if (cartesian) {
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)
      const latStr = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7)
      const lonStr = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7)
      const altStr = (viewer.camera.positionCartographic.height / 1000).toFixed(5)
      if (longitudeEl) longitudeEl.innerHTML = lonStr
      if (latitudeEl) latitudeEl.innerHTML = latStr
      if (altitudeEl) altitudeEl.innerHTML = altStr
      if (elevationEl) {
        const h = viewer.scene.globe.getHeight(cartographic)
        elevationEl.innerHTML = h ? h.toFixed(7) : ''
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  return handler
}

/**
 * 工厂函数：创建 Cesium Viewer
 *
 * @param {string | HTMLElement} container - DOM 元素或 ID
 * @param {Object} [userOptions={}] - 用户自定义选项
 * @param {Cesium.ImageryProvider} [userOptions.imageryProvider] - 影像图层，不传则使用默认本地影像
 * @param {Cesium.TerrainProvider} [userOptions.terrainProvider] - 地形图层，不传则使用 Google 全球地形
 * @param {boolean} [userOptions.showSkyBox=true] - 是否设置自定义星空
 * @param {boolean} [userOptions.showLatLng=false] - 是否显示经纬度 HUD
 * @param {boolean} [userOptions.showFps=false] - 是否显示帧率
 * @param {boolean} [userOptions.hideCredit=true] - 是否隐藏 Cesium credit
 * @param {boolean} [userOptions.storeToVuex=false] - 是否自动存入 Vuex store
 * @param {boolean} [userOptions.setWindowGlobal=false] - 是否挂载到 window.cesiumViewer
 * @param {Object} [userOptions.viewerOptions] - 直接传递给 Cesium.Viewer 的额外选项（覆盖默认）
 * @returns {Cesium.Viewer}
 */
export function createViewer(container, userOptions = {}) {
  const {
    imageryProvider,
    terrainProvider,
    showSkyBox = true,
    showLatLng = false,
    showFps = false,
    hideCredit = true,
    storeToVuex = false,
    setWindowGlobal = false,
    viewerOptions = {},
    ...rest
  } = userOptions

  // 设置 Ion token
  Cesium.Ion.defaultAccessToken = DEFAULT_ION_TOKEN

  // 合并 UI 选项：先取默认，再用 viewerOptions 覆盖
  // imageryProvider / terrainProvider 传 false 表示不设置（使用 Cesium 默认椭球）
  const mergedOptions = {
    ...DEFAULT_UI_OPTIONS,
    shouldAnimate: true,
    terrainExaggeration: 0.95,
    imageryProvider: imageryProvider === false ? undefined : (imageryProvider || createDefaultImageryProvider()),
    terrainProvider: terrainProvider === false ? undefined : (terrainProvider || createDefaultTerrainProvider()),
    ...viewerOptions,
    ...rest,
  }

  const viewer = new Cesium.Viewer(container, mergedOptions)

  // 隐藏 credit
  if (hideCredit) {
    viewer._cesiumWidget._creditContainer.style.display = 'none'
  }

  // 设置自定义星空
  if (showSkyBox) {
    viewer.scene.skyBox = createDefaultSkyBox()
  }

  // 显示帧率
  if (showFps) {
    viewer.scene.debugShowFramesPerSecond = true
  }

  // 经纬度 HUD
  if (showLatLng) {
    const handler = setupLatLngHUD(viewer)
    // 挂载到 viewer 上方便后续销毁
    viewer._latLngHandler = handler
  }

  // 挂载到全局
  if (setWindowGlobal) {
    window.cesiumViewer = viewer
  }

  // 存入 Vuex
  if (storeToVuex) {
    // 动态引入避免循环依赖
    import('@/store/store.js').then((mod) => {
      mod.default.commit('initViewer', viewer)
    })
  }

  return viewer
}

/**
 * 销毁 Viewer 及关联资源
 * @param {Cesium.Viewer} viewer
 */
export function destroyViewer(viewer) {
  if (!viewer || viewer.isDestroyed()) return
  // 销毁经纬度 handler
  if (viewer._latLngHandler && !viewer._latLngHandler.isDestroyed()) {
    viewer._latLngHandler.destroy()
  }
  viewer.destroy()
}

export default {
  createViewer,
  destroyViewer,
  createDefaultImageryProvider,
  createDefaultTerrainProvider,
  createDefaultSkyBox,
  setupLatLngHUD,
  DEFAULT_ION_TOKEN,
  DEFAULT_UI_OPTIONS,
}

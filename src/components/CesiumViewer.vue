<!--
  * CesiumViewer 公共组件
  * 统一管理 Cesium Viewer 的创建、DOM 容器和资源销毁
  *
  * 使用方式:
  *   <CesiumViewer ref="cesiumViewer" :options="viewerOptions" @ready="onViewerReady" />
  *
  * props:
  *   options    - 传递给 createViewer 的配置对象
  *   showLatLng - 是否显示经纬度HUD（默认 false）
  *   showFps    - 是否显示帧率（默认 false）
  *   showSkyBox - 是否显示自定义星空（默认 true）
  *
  * 通过 ref 可访问: this.$refs.cesiumViewer.viewer
  * 通过 @ready 事件可获取: viewer 实例
  * 组件卸载时自动销毁 viewer 和相关资源
-->
<template>
  <div class="cesium-viewer-container">
    <div :id="containerId" class="cesium-canvas"></div>
    <div v-if="showLatLng" id="latlng_show" class="latlng-hud">
      <div class="latlng-row"><font size="1" color="white">经度：<span id="longitude_show"></span></font></div>
      <div class="latlng-row"><font size="1" color="white">纬度：<span id="latitude_show"></span></font></div>
      <div class="latlng-row"><font size="1" color="white">视角高：<span id="altitude_show"></span>km</font></div>
      <div class="latlng-row"><font size="1" color="white">海拔高：<span id="elevation_show"></span>m</font></div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { createViewer, destroyViewer } from '@/components/commonJS/createViewer.js'

export default {
  name: 'CesiumViewer',
  props: {
    /** 传递给 createViewer 的配置（imageryProvider, terrainProvider 等） */
    options: {
      type: Object,
      default: () => ({})
    },
    /** 容器 DOM ID，默认自动生成唯一 ID */
    containerId: {
      type: String,
      default: ''
    },
    /** 是否显示经纬度 HUD */
    showLatLng: {
      type: Boolean,
      default: false
    },
    /** 是否显示帧率 */
    showFps: {
      type: Boolean,
      default: false
    },
    /** 是否显示自定义星空 */
    showSkyBox: {
      type: Boolean,
      default: true
    },
    /** 是否自动存入 Vuex store */
    storeToVuex: {
      type: Boolean,
      default: false
    },
  },
  emits: ['ready'],
  setup(props, { emit }) {
    const store = useStore()
    const viewer = ref(null)
    // 生成唯一 ID 避免多实例冲突
    const uid = 'cesium_' + Math.random().toString(36).substr(2, 9)
    const actualContainerId = props.containerId || uid

    onMounted(() => {
      const mergedOptions = {
        ...props.options,
        showSkyBox: props.showSkyBox,
        showLatLng: props.showLatLng,
        showFps: props.showFps,
        storeToVuex: props.storeToVuex,
      }
      viewer.value = createViewer(actualContainerId, mergedOptions)
      emit('ready', viewer.value)
    })

    onUnmounted(() => {
      if (viewer.value) {
        destroyViewer(viewer.value)
        viewer.value = null
      }
    })

    return {
      viewer,
      actualContainerId,
    }
  },
}
</script>

<style scoped>
.cesium-viewer-container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.cesium-canvas {
  width: 100%;
  height: 100%;
}
.latlng-hud {
  position: absolute;
  bottom: 40px;
  right: 0;
  width: 340px;
  z-index: 100;
  font-size: 1px;
}
.latlng-row {
  float: left;
  clear: both;
}
</style>

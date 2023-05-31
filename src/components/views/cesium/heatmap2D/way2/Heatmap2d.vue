<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-31 16:55:26
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="addHeatmap2d()">添加</span>
        <span @click="handleClear()">清空</span>
      </li>
    </ul>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";
import { getGeojson } from "@/api/api.js";
import { CesiumHeatmap } from "@/components/views/cesium/heatmap2D/way2/cesiumHeatMap.js";
import CesiumContainer from "@/views/CesiumContainer.vue";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let cesiumHeatMap = ref(null);
    // const { viewer } = store.state;

    // 添加热力图
    const addHeatmap2d = async () => {
      const { viewer } = store.state;
      const { res } = await getGeojson("static/geojson/heatMap.json");
      const { features } = res;
      console.log(res);
      let heatData = [];
      if (features?.length) {
        heatData = features.map((item) => {
          return {
            x: item.properties.lng - 0.05,
            y: item.properties.lat - 0.04,
            value: item.properties.num,
          };
        });
      }
      cesiumHeatMap = new CesiumHeatmap(viewer, {
        zoomToLayer: true,
        points: heatData,
        heatmapDataOptions: { max: 1, min: 0 },
        heatmapOptions: {
          maxOpacity: 1,
          minOpacity: 0,
        },
      });
    };
    const handleClear = () => {
      cesiumHeatMap?.remove();
    };
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      addHeatmap2d,
      cesiumHeatMap,
    };
  },
});
</script>

<style scoped>
/* @bgc:#000; */
#cesiumContainer {
  background: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}
.cesiumContainerRight {
  width: 30%;
  height: 69%;
  position: absolute;
  bottom: 0;
  right: 0;
}
:deep(.cesium-viewer-cesium3DTilesInspectorContainer) {
  right: 400px;
  top: 200px;
}
.slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 4px;
  height: 100%;
  z-index: 9999;
}
.slider:hover {
  cursor: ew-resize;
}
#creditContainer {
  display: none;
}
.panel_view {
  position: absolute;
  top: 500px;
  right: 100px;
  z-index: 200;
  width: 200px;
  height: 300px;
  background: rgba(0, 255, 255, 0.7);
  border: 1px solid #529dd6;
  border-radius: 5px;
}
.volume-main {
  line-height: 26px;
  padding: 0 10px;
}
.volume-main li {
  list-style-type: none;
}
.volume-clear {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed;
  color: #ffffff;
  padding-bottom: 6px;
}
.volume-color {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
.volume-clear span {
  cursor: pointer;
}
.volume-item {
  margin-top: 8px;
}
.volume-color {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
</style>

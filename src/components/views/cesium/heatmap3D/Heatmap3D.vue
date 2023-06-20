<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-12 16:36:14
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="addHeatmap3d()">添加</span>
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
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import Heatmap3d from "./heatmap3d.js";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let heatMap = ref();
    // const { viewer } = store.state;

    // 添加热力图
    const addHeatmap3d = () => {
      const { viewer } = store.state;
      let list = [];
      for (let i = 0; i < 100; i++) {
        list.push({
          lnglat: [
            117.28 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1),
            31.923 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1),
          ],
          value: 1000 * Math.random(),
        });
      }
      heatMap = new Heatmap3d(viewer, {
        list: list,
        raduis: 15,
        baseHeight: 800,
        primitiveType: "TRNGLE",
        gradient: {
          ".3": "blue",
          ".5": "green",
          ".7": "yellow",
          ".95": "red",
        },
      });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            117.28,
            31.923,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
      console.log("heatmap3d: ", heatMap);
    };
    // 设置相机是否进入地下
    const limitCameraToGround = (isOpen) => {
      //  if (limitCameraHandler) {
      //             limitCameraHandler();
      //             limitCameraHandler = null;
      //         }
      let limitCameraHandler = viewer.camera.changed.addEventListener(
        function () {
          if (
            viewer.camera._suspendTerrainAdjustment &&
            viewer.scene.mode === Cesium.SceneMode.SCENE3D
          ) {
            viewer.camera._suspendTerrainAdjustment = !isOpen;
            viewer.camera._adjustHeightForTerrain();
          }
        }
      );
    };
    const handleClear = () => {
      if (heatMap) {
        heatMap.destroy();
      }
    };
    onMounted(() => {
      // initViewer();
    });
    return {
      handleClear,
      addHeatmap3d,
      limitCameraToGround,
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
  
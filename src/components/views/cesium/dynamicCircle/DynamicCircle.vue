<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-16 11:01:39
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="addDynamicCircle()">添加圆形扩散</span>
        <span @click="addMulticolorDynamicCircle()">添加多彩圆形扩散</span>
        <span @click="addDiffuseDynamicCircle()">添加多彩圆形扩散</span>
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
import CesiumContainer from "@/views/CesiumContainer.vue";
import { createDynamicCircleStage } from "./dynamicCircle.js";
import { MyCesiumExtensions } from "./circleColorfulMaterialProperty.js";
import CircleDiffusion from "./diffuse.js";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let dynamicCircle = ref();
    let circleDiffusion = ref();
    // const { viewer } = store.state;

    // 添加红色圆形扩散(视角变化的时候圆形扩散有位置跟着移动的问题)
    const addDynamicCircle = () => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测
      var lng = 117.90365282568267;
      var lat = 40.16773126252592;
      var cartographicCenter = new Cesium.Cartographic(
        Cesium.Math.toRadians(lng),
        Cesium.Math.toRadians(lat),
        0
      );
      var scanColor = new Cesium.Color(1.0, 0.0, 0.0, 1);
      // 创建自定义的 PostProcessStage
      dynamicCircle = createDynamicCircleStage(
        viewer,
        Cesium,
        cartographicCenter,
        1500,
        scanColor,
        4000
      );
      // 添加进场景
      viewer.scene.postProcessStages.add(dynamicCircle);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          117.90365282568267,
          40.16773126252592,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    };
    // 添加多彩扩散圆形
    const addMulticolorDynamicCircle = () => {
      const { viewer } = store.state;
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(113.9236839, 22.528061),
        name: "多彩圆",
        ellipse: {
          semiMinorAxis: 1000.0,
          semiMajorAxis: 1000.0,
          material: new MyCesiumExtensions.CircleColorfulMaterialProperty({
            color: new Cesium.Color(1, 1, 0, 0.7),
            speed: 12.0,
          }),
        },
      });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          113.9236839,
          22.528061,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    };
    // 添加扩散圆形
    const addDiffuseDynamicCircle = () => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测
      circleDiffusion = new CircleDiffusion(viewer, "circle");
      circleDiffusion.add([120.36, 36.09, 10], "#F7EB08", 2000, 5000);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          120.36,
          36.09,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
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
      const { viewer } = store.state;
      if (dynamicCircle) {
        viewer.scene.postProcessStages.remove(dynamicCircle);
      }
      if (circleDiffusion) {
        circleDiffusion.clear();
      }
    };
    onMounted(() => {
      // initViewer();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      addDynamicCircle,
      addMulticolorDynamicCircle,
      addDiffuseDynamicCircle,
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
  
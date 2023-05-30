<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-30 15:31:31
-->
<template>
  <cesium-container ref="cesiumContainer">
    
  </cesium-container>
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
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";
import * as h337 from "heatmap.js";
import Heatmap from "./heatmap2D.js";
import CesiumContainer from '@/views/CesiumContainer.vue'
import {
  LOCAL_IMG_URL,
  LOCAL_TERRAIN_URL,
  DAYANTA3DTILES,
  BAIMO3DTILES,
  GAODE_IMG_URL,
} from "../../../commonJS/config";
import {
  BaiduImageryProvider,
  AmapImageryProvider,
} from "../../../commonJS/BaiduImageryProvider";
import positiveX from "@img/SkyBox/00h+00.jpg";
import negativeX from "@img/SkyBox/12h+00.jpg";
import positiveY from "@img/SkyBox/06h+00.jpg";
import negativeY from "@img/SkyBox/18h+00.jpg";
import positiveZ from "@img/SkyBox/06h+90.jpg";
import negativeZ from "@img/SkyBox/06h-90.jpg";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    
    const store = useStore();
    let heatMap = ref();
// const { viewer } = store.state;
    
    // 添加热力图
    const addHeatmap2d = () => {
        const { viewer } = store.state;
      let bounds = {
        west: 120.65290308330879,
        south: 31.273633917763892,
        east: 120.79146729222676,
        north: 31.410010681404547,
      };

      console.log(viewer);
      // init heatmap
      heatMap = CesiumHeatmap.create(
        viewer, // your cesium viewer
        bounds, // bounds for heatmap layer
        {
          // heatmap.js options go here
          // maxOpacity: 0.3
          gradient: {
            0.05: "rgb(0,0,255)",
            0.25: "rgb(0 255 127)",
            0.45: "rgb(0,255,0)",
            0.65: "rgb(255 255 0)",
            0.85: "rgb(255 165 0)",
            "1.00": "rgb(255,0,0)",
          },
          radius: 30,
        }
      );

      // 苏州矩形坐标
      let data = [
        {
          x: 120.668435,
          y: 31.374082,
          value: 100,
        },
        {
          x: 120.686138,
          y: 31.383773,
          value: 57,
        },
        {
          x: 120.688073,
          y: 31.388262,
          value: 58,
        },
        {
          x: 120.697757,
          y: 31.392517,
          value: 60,
        },
        {
          x: 120.700801,
          y: 31.393463,
          value: 53,
        },
        {
          x: 120.705782,
          y: 31.396772,
          value: 7,
        },
        {
          x: 120.710763,
          y: 31.398663,
          value: 37,
        },
        {
          x: 120.714361,
          y: 31.392283,
          value: 13,
        },
        {
          x: 120.707998,
          y: 31.378816,
          value: 19,
        },
        {
          x: 120.706128,
          y: 31.377039,
          value: 83,
        },
        {
          x: 120.706959,
          y: 31.373496,
          value: 30,
        },
        {
          x: 120.706889,
          y: 31.371754,
          value: 88,
        },
        {
          x: 120.711039,
          y: 31.364196,
          value: 36,
        },
        {
          x: 120.714082,
          y: 31.36396,
          value: 26,
        },
        {
          x: 120.717402,
          y: 31.362543,
          value: 9,
        },
        {
          x: 120.722658,
          y: 31.359944,
          value: 83,
        },
        {
          x: 120.732062,
          y: 31.354984,
          value: 69,
        },
        {
          x: 120.738148,
          y: 31.352385,
          value: 46,
        },
        {
          x: 120.741742,
          y: 31.346243,
          value: 49,
        },
        {
          x: 120.743677,
          y: 31.337739,
          value: 11,
        },
        {
          x: 120.75446,
          y: 31.316947,
          value: 9,
        },
        {
          x: 120.754183,
          y: 31.316239,
          value: 61,
        },
        {
          x: 120.75916,
          y: 31.306721,
          value: 2,
        },
        {
          x: 120.759989,
          y: 31.297031,
          value: 72,
        },
        {
          x: 120.75031,
          y: 31.2968,
          value: 98,
        },
        {
          x: 120.729571,
          y: 31.297987,
          value: 48,
        },
        {
          x: 120.714641,
          y: 31.303423,
          value: 10,
        },
        {
          x: 120.713257,
          y: 31.309094,
          value: 18,
        },
        {
          x: 120.726805,
          y: 31.314291,
          value: 15,
        },
        {
          x: 120.714915,
          y: 31.319253,
          value: 9,
        },
        {
          x: 120.702482,
          y: 31.327047,
          value: 80,
        },
        {
          x: 120.701097,
          y: 31.338858,
          value: 77,
        },
        {
          x: 120.707635,
          y: 31.34932,
          value: 65,
        },
        {
          x: 120.713997,
          y: 31.335148,
          value: 72,
        },
        {
          x: 120.713445,
          y: 31.326645,
          value: 17,
        },
        {
          x: 120.700175,
          y: 31.314833,
          value: 95,
        },
        {
          x: 120.688565,
          y: 31.308925,
          value: 56,
        },
        {
          x: 120.681381,
          y: 31.298291,
          value: 70,
        },
        {
          x: 120.682487,
          y: 31.297347,
          value: 96,
        },
        {
          x: 120.712897,
          y: 31.290264,
          value: 5,
        },
        {
          x: 120.718426,
          y: 31.2905,
          value: 91,
        },
        {
          x: 120.729761,
          y: 31.296642,
          value: 38,
        },
        {
          x: 120.743585,
          y: 31.297348,
          value: 19,
        },
        {
          x: 120.744692,
          y: 31.300183,
          value: 32,
        },
        {
          x: 120.745521,
          y: 31.301836,
          value: 79,
        },
        {
          x: 120.748299,
          y: 31.306119,
          value: 64,
        },
        {
          x: 120.748853,
          y: 31.308481,
          value: 56,
        },
        {
          x: 120.74913,
          y: 31.31297,
          value: 30,
        },
        {
          x: 120.74111,
          y: 31.315335,
          value: 79,
        },
        {
          x: 120.72839,
          y: 31.317463,
          value: 26,
        },
        {
          x: 120.726454,
          y: 31.319353,
          value: 99,
        },
        {
          x: 120.714287,
          y: 31.325494,
          value: 32,
        },
        {
          x: 120.71401,
          y: 31.325731,
          value: 92,
        },
        {
          x: 120.738015,
          y: 31.32767,
          value: 82,
        },
        {
          x: 120.744185,
          y: 31.317248,
          value: 3,
        },
        {
          x: 120.725062,
          y: 31.307079,
          value: 65,
        },
        {
          x: 120.710421,
          y: 31.308218,
          value: 68,
        },
        {
          x: 120.710104,
          y: 31.299549,
          value: 59,
        },
        {
          x: 120.717484,
          y: 31.29713,
          value: 32,
        },
        {
          x: 120.722824,
          y: 31.296944,
          value: 73,
        },
        {
          x: 120.723274,
          y: 31.290495,
          value: 58,
        },
        {
          x: 120.727456,
          y: 31.287032,
          value: 28,
        },
        {
          x: 120.69478,
          y: 31.283772,
          value: 60,
        },
        {
          x: 120.676413,
          y: 31.283046,
          value: 77,
        },
        {
          x: 120.675549,
          y: 31.282865,
          value: 31,
        },
        {
          x: 120.680282,
          y: 31.276796,
          value: 4,
        },
        {
          x: 120.698247,
          y: 31.273269,
          value: 34,
        },
        {
          x: 120.723374,
          y: 31.272218,
          value: 100,
        },
        {
          x: 120.736585,
          y: 31.275035,
          value: 100,
        },
        {
          x: 120.745777,
          y: 31.279471,
          value: 100,
        },
        {
          x: 120.751088,
          y: 31.282693,
          value: 100,
        },
        {
          x: 120.757373,
          y: 31.287752,
          value: 100,
        },
        {
          x: 120.758732,
          y: 31.30273,
          value: 100,
        },
        {
          x: 120.758945,
          y: 31.316499,
          value: 100,
        },
        {
          x: 120.761492,
          y: 31.344917,
          value: 3,
        },
        {
          x: 120.76694,
          y: 31.382806,
          value: 83,
        },
        {
          x: 120.76589,
          y: 31.387562,
          value: 35,
        },
        {
          x: 120.758214,
          y: 31.394899,
          value: 91,
        },
        {
          x: 120.730968,
          y: 31.403159,
          value: 100,
        },
        {
          x: 120.711442,
          y: 31.404812,
          value: 100,
        },
        {
          x: 120.690595,
          y: 31.401832,
          value: 100,
        },
        {
          x: 120.679832,
          y: 31.393932,
          value: 100,
        },
        {
          x: 120.670814,
          y: 31.381412,
          value: 100,
        },
        {
          x: 120.672233,
          y: 31.368546,
          value: 100,
        },
        {
          x: 120.673351,
          y: 31.353035,
          value: 100,
        },
        {
          x: 120.684359,
          y: 31.372061,
          value: 100,
        },
        {
          x: 120.695252,
          y: 31.368108,
          value: 100,
        },
        {
          x: 120.690044,
          y: 31.355587,
          value: 100,
        },
        {
          x: 120.689004,
          y: 31.347558,
          value: 100,
        },
        {
          x: 120.689228,
          y: 31.34297,
          value: 100,
        },
        {
          x: 120.690055,
          y: 31.335568,
          value: 100,
        },
        {
          x: 120.691422,
          y: 31.335963,
          value: 100,
        },
        {
          x: 120.697691,
          y: 31.342086,
          value: 100,
        },
        {
          x: 120.704069,
          y: 31.347567,
          value: 100,
        },
        {
          x: 120.705733,
          y: 31.346608,
          value: 100,
        },
        {
          x: 120.706342,
          y: 31.342177,
          value: 100,
        },
        {
          x: 120.703215,
          y: 31.334653,
          value: 100,
        },
        {
          x: 120.697903,
          y: 31.338251,
          value: 100,
        },
        {
          x: 120.697903,
          y: 31.338251,
          value: 83,
        },
        {
          x: 120.702118,
          y: 31.306084,
          value: 91,
        },
      ];
      let valueMin = 0;
      let valueMax = 100;

      // add data to heatmap
      heatMap.setWGS84Data(valueMin, valueMax, data);
      // viewer.camera.setView({
      //   destination: Cesium.Rectangle.fromDegrees(
      //     bounds.west,
      //     bounds.south,
      //     bounds.east,
      //     bounds.north
      //   ),
      // });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          (bounds.west + bounds.east) / 2,
          (bounds.south + bounds.north) / 2,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
      console.log("heatmap2d: ", heatMap);
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
        heatMap._layer ? heatMap._cesium.entities.remove(heatMap._layer) : ''
        heatMap._layer = undefined
      }
    };
    onMounted(() => {
      // initViewer();
    });
    return {
      handleClear,
      addHeatmap2d,
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

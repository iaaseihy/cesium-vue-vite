<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-21 14:46:42
-->
<template>
  <div>
    <div id="cesiumContainer"></div>
    <div class="panel_view">
      <ul class="volume-main">
        <li class="volume-clear">
          <span @click="addRoutesPlay()">添加</span>
          <span @click="handleClear()">清空</span>
        </li>
      </ul>
    </div>
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
import busLines from "./bus.json";
import moment from "moment";
import CoordinateTransform from "./coorTransform.js";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let viewer = null;
    // const { viewer } = store.state;

    // 添加班车轨迹模拟
    const addRoutesPlay = () => {
      // const { viewer } = store.state;
      viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(
          -2284843.6893539904,
          5030084.459916646,
          3197419.22233534
        ),
        orientation: {
          heading: 5.9824121245820825,
          pitch: -0.35321351463230544,
          roll: 6.282263350033762,
        },
      });

      var startTime = Cesium.JulianDate.fromDate(
        moment("2099-01-01 01:00:00", "YYYY-MM-DD HH:mm:ss").toDate()
      );
      var stopTime = Cesium.JulianDate.fromDate(
        moment("1999-01-01 01:01:01", "YYYY-MM-DD HH:mm:ss").toDate()
      );
      var properties = [];
      let coordinateTransform = new CoordinateTransform();

      busLines.forEach(function (busLine) {
        var tempStartTime = Cesium.JulianDate.fromDate(
          moment(busLine[0].gps_time, "YYYY-MM-DD HH:mm:ss").toDate()
        );
        var tempStopTime = Cesium.JulianDate.fromDate(
          moment(
            busLine[busLine.length - 1].gps_time,
            "YYYY-MM-DD HH:mm:ss"
          ).toDate()
        );

        if (tempStartTime < startTime) startTime = tempStartTime;
        if (tempStopTime > stopTime) stopTime = tempStopTime;

        var property = new Cesium.SampledPositionProperty();
        busLine.forEach(function (linePoint) {
          var time = Cesium.JulianDate.fromDate(
            moment(linePoint.gps_time, "YYYY-MM-DD HH:mm:ss").toDate()
          );

          var gcj = coordinateTransform.bd09togcj02(
            parseFloat(linePoint.lng),
            parseFloat(linePoint.lat)
          );
          var wg4 = coordinateTransform.gcj02towgs84(gcj[0], gcj[1]);
          var position = Cesium.Cartesian3.fromDegrees(wg4[0], wg4[1]);
          property.addSample(time, position);
        });
        properties.push(property);
      });

      console.log(startTime, stopTime);

      viewer.clock.startTime = startTime.clone();
      viewer.clock.stopTime = stopTime.clone();
      viewer.clock.currentTime = startTime.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      viewer.clock.multiplier = 25;
      viewer.timeline.zoomTo(startTime, stopTime);

      properties.forEach(function (property, index) {
        let movingEntity = viewer.entities.add({
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: startTime,
              stop: stopTime,
            }),
          ]),
          position: property,
          orientation: new Cesium.VelocityOrientationProperty(property),
          model: {
            uri: "Cesium_Man.glb",
            minimumPixelSize: 24,
          },
          label: {
            text: index + 1 + "号班车",
            font: "10pt sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, //FILL  FILL_AND_OUTLINE OUTLINE
            fillColor: Cesium.Color.YELLOW,
            showBackground: true, //指定标签后面背景的可见性
            backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8), // 背景颜色
            backgroundPadding: new Cesium.Cartesian2(6, 6), //指定以像素为单位的水平和垂直背景填充padding
            pixelOffset: new Cesium.Cartesian2(0, -25),
          },
          path: {
            // leadTime: 0.2,
            // trailTime: 0.2,
            resolution: 1,
            width: 4,
            // material: new Cesium.PolylineGlowMaterialProperty({
            //     color: Cesium.Color.fromRandom()
            // })
            material: Cesium.Color.fromRandom({ alpha: 0.8 }),
          },
        });
        console.log(movingEntity.orientation);
        // movingEntity.orientation.heading = Cesium.Math.toRadians(90)
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
    // 实例cesium
    const getCesiumDem = () => {
      let self = this;
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZWFlYjAyYS0xN2JlLTQ0OTItOGNkOC05YWJlNGY0MjI2NmQiLCJpZCI6NDkyMjYsImlhdCI6MTYxNzM0NjA3N30.crkTg0Logk_JUA7BROy0r9RqTJWCi8NZpTyu4qI11Fo";
      viewer = new Cesium.Viewer("cesiumContainer", {
        animation: true, // 是否显示动画控件
        baseLayerPicker: false, // 是否显示图层选择控件
        geocoder: false, // 是否显示地名查找控件
        timeline: true, // 是否显示时间线控件
        shouldAnimate: true,
        sceneModePicker: false, // 是否显示投影方式控件
        navigationHelpButton: false, // 是否显示帮助信息控件
        infoBox: false, // 是否显示点击要素之后显示的信息
        fullscreenButton: false, // 是否显示全屏按钮
        selectionIndicator: false, // 是否显示选中指示框
        scene3DOnly: true,
        homeButton: false,
        terrainProvider: new Cesium.EllipsoidTerrainProvider({}),
      });
      // 显示帧率
      viewer.scene.debugShowFramesPerSecond = true;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      window.viewer = viewer;
    };
    const handleClear = () => {
        viewer.destroy();
    };
    onMounted(() => {
      getCesiumDem();
    });
    return {
      handleClear,
      addRoutesPlay,
      getCesiumDem,
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
    
<!--
 * @Descripttion: 道路穿梭线
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-10-18 14:57:36
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <!-- <div id="cesiumContainer"></div> -->
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <button id="reloadFunc" @click="reloadFunc()">切换第三人称</button>
        <button id="reloadFunc2" @click="reloadFunc2()">切换自由模式</button>
      </li>
    </ul>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import { defineComponent, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import { getGeojson } from "@/api/api.js";
import waternormolsIMG from './waterNormals.jpg'

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let viewer;
    let tileset;
    let clippingPlanes;
    let planeEntities = [];
    let targetY = 0;
    // 定义变量，模型和视角跟随事件
    let entityB2;
    let onTickEvent;
    // 添加道路穿梭线
    const clipModel = async () => {
      const { viewer } = store.state;
      viewer.scene.debugShowFramesPerSecond = true;
      viewer.clock.shouldAnimate = true;
      // 通过 czml 方式加载，定义数据
      const czml_team = [
        {
          id: "document",
          name: "flying_follow_team",
          version: "1.0",
          clock: {
            interval: "2023-03-08T10:00:00Z/2023-03-08T15:00:00Z",
            currentTime: "2023-03-08T10:00:00Z",
            multiplier: 10,
          },
        },
        {
          id: "flying_follow_team",
          name: "path with GPS flight data",
          description: "测试第一人称视角。",
          availability: "2023-03-08T10:00:00Z/2023-03-08T15:00:00Z",
          path: {
            // material: {
            //   polylineGlow: {
            //     color: {
            //       rgba: [0, 0, 255, 200],
            //     },
            //     glowPower: 0.1,
            //     taperPower: 0.1,
            //   },
            // },
            material: {
              solidColor: {
                color: {
                  rgba: [0, 55, 120, 200],
                },
                },
            },
            width: 20,
            leadTime: 0,
            trailTime: 1000,
            resolution: 0.5,
            show: true,
            // clampToGround: true,
          },
          model: {
            // 模型参数
            gltf: "http://openlayers.vip/cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
            minimumPixelSize: 1000,
            maximumScale: 20,
          },
          orientation: {
            // 自动计算方向
            velocityReference: "#position",
          },
          position: {
            // 插值算法
            interpolationAlgorithm: "LAGRANGE",
            interpolationDegree: 5,
            epoch: "2023-03-08T10:00:00Z",
            // 坐标组 cartographicDegrees，每四个表示一个时刻的位置和高度，这四个分别为时间(秒)、经度、纬度、高度
            cartographicDegrees: [
              0, 118.93830177292894, 25.488280583435404, 0, 
              300,119.14034602637892, 25.32388938213355, 2000, 
              800,119.43064375816327, 25.230148210056235, 5000,
              1500,120.93105921868252, 24.769194048014963, 12000,
              2500,121.5592902752412, 24.658964292017885, 12000,
              3500,121.56445881860067, 25.16649023047563, 5000,
              4500,119.94263373897657, 25.49632056739945, 12000,
              5500,119.30910179629008, 25.559938450361965, 5000,
              6500,118.96295053426707, 25.571485127594467, 0,
            ],
          },
          polygon: {
            positions: {
              // 坐标组
              cartographicDegrees: [
                118.93830177292894, 25.488280583435404, 300,
                119.14034602637892, 25.32388938213355, 800,
                119.43064375816327, 25.230148210056235, 1500,
                120.93105921868252, 24.769194048014963, 2500,
                121.5592902752412, 24.658964292017885, 3500,
                121.56445881860067, 25.16649023047563, 4500,
                119.94263373897657, 25.49632056739945, 5500,
                119.30910179629008, 25.559938450361965, 6500,
                118.96295053426707, 25.571485127594467, 0,
              ],
            },
            material: {
              solidColor: {
                color: {
                  rgba: [255, 0, 0, 128],
                },
              },
            },
            outline: true,
            clampToGround: true,
            outlineColor: {
              rgba: [0, 0, 0, 255],
            },
          },
        },
      ];

      viewer.scene.globe.depthTestAgainstTerrain = true;
      Cesium.CzmlDataSource.load(czml_team).then(function(dataSource) {
    viewer.dataSources.add(dataSource);
    viewer.zoomTo(dataSource);
        // 获取模型对象
          entityB2 = dataSource.entities.getById("flying_follow_team");
          console.log(entityB2);
          // entityB2.show = false;
          viewer.trackedEntity = entityB2;
              // 获取当前模型方向和位置
          const orientation = entityB2.orientation;
          const position = entityB2.position;

          // 实时调整位置
          function adjust() {
            if (viewer.clock.shouldAnimate === true) {
              let ori = orientation.getValue(viewer.clock.currentTime); // 获取偏向角
              let center = position.getValue(viewer.clock.currentTime); // 获取位置

              // 1、由四元数计算三维旋转矩阵
              var mtx3 = Cesium.Matrix3.fromQuaternion(ori);

              // 2、计算四维转换矩阵：
              var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, center);

              // 3、计算角度：
              var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4);

              // 获取角度（弧度）
              const headingTemp = hpr.heading;
              const pitchTemp = hpr.pitch;

              // 调整角度为第一人称
              const heading = Cesium.Math.toRadians(
                Cesium.Math.toDegrees(headingTemp) + 90
              );
              const pitch = Cesium.Math.toRadians(
                Cesium.Math.toDegrees(pitchTemp) - 12
              );
              // 视角高度，根据模型大小调整
              const range = 140.0;

              // 动态改变模型视角
              viewer.camera.lookAt(
                center,
                new Cesium.HeadingPitchRange(heading, pitch, range)
              );
            }
          }

          onTickEvent = viewer.clock.onTick.addEventListener(adjust);
});
      // 加载数据
      // viewer.dataSources
      //   .add(Cesium.CzmlDataSource.load(czml_team))
      //   .then(function (ds) {
      //     // 获取模型对象
      //     entityB2 = ds.entities.getById("flying_follow_team");
      //     console.log(entityB2);
      //     // entityB2.show = false;
      //     viewer.trackedEntity = entityB2;

      //     // 获取当前模型方向和位置
      //     const orientation = entityB2.orientation;
      //     const position = entityB2.position;

      //     // 实时调整位置
      //     function adjust() {
      //       if (viewer.clock.shouldAnimate === true) {
      //         let ori = orientation.getValue(viewer.clock.currentTime); // 获取偏向角
      //         let center = position.getValue(viewer.clock.currentTime); // 获取位置

      //         // 1、由四元数计算三维旋转矩阵
      //         var mtx3 = Cesium.Matrix3.fromQuaternion(ori);

      //         // 2、计算四维转换矩阵：
      //         var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, center);

      //         // 3、计算角度：
      //         var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4);

      //         // 获取角度（弧度）
      //         const headingTemp = hpr.heading;
      //         const pitchTemp = hpr.pitch;

      //         // 调整角度为第一人称
      //         const heading = Cesium.Math.toRadians(
      //           Cesium.Math.toDegrees(headingTemp) + 90
      //         );
      //         const pitch = Cesium.Math.toRadians(
      //           Cesium.Math.toDegrees(pitchTemp) - 12
      //         );
      //         // 视角高度，根据模型大小调整
      //         const range = 140.0;

      //         // 动态改变模型视角
      //         viewer.camera.lookAt(
      //           center,
      //           new Cesium.HeadingPitchRange(heading, pitch, range)
      //         );
      //       }
      //     }

      //     onTickEvent = viewer.clock.onTick.addEventListener(adjust);
      //   });
    };
    const reloadFunc = () => {
      const { viewer } = store.state;
      alert("您现在可以拖动改变角度！");
      // 关闭视角跟随
      onTickEvent && onTickEvent();
      viewer.trackedEntity = entityB2;
    };

    const reloadFunc2 = () => {
      const { viewer } = store.state;
      alert("您现在需要自己跟随飞机！");
      // 关闭视角跟随
      onTickEvent && onTickEvent();
      viewer.trackedEntity = undefined;
    };
    const init = () => {
      // 这个 tk 只能在本域名下使用
      var token = "2b7cbf61123cbe4e9ec6267a87e7442f";
      // 服务域名
      var tdtUrl = "https://t{s}.tianditu.gov.cn/";
      // 服务负载子域
      var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
      viewer = new Cesium.Viewer("cesiumContainer", {
        shouldAnimate: true,
        selectionIndicator: true,
        animation: false, //动画
        homeButton: false, //home键
        geocoder: false, //地址编码
        baseLayerPicker: false, //图层选择控件
        timeline: false, //时间轴
        fullscreenButton: false, //全屏显示
        infoBox: false, //点击要素之后浮窗
        sceneModePicker: false, //投影方式  三维/二维
        navigationInstructionsInitiallyVisible: false, //导航指令
        navigationHelpButton: false, //帮助信息
        selectionIndicator: false, // 选择
        imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
          //影像底图
          url:
            "http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
            token,
          subdomains: subdomains,
          layer: "tdtImgLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible", //使用谷歌的瓦片切片方式
          show: true,
        }),
      });

      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          //影像注记
          url:
            "http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
            token,
          subdomains: subdomains,
          layer: "tdtCiaLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible",
          show: true,
        })
      );

      // // 叠加国界服务
      var iboMap = new Cesium.UrlTemplateImageryProvider({
        url: tdtUrl + "DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=" + token,
        subdomains: subdomains,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 10,
      });

      viewer.imageryLayers.addImageryProvider(iboMap);

      //   return viewer;
    };

    /**
     * @description: 飞行定位到一个矩形
     * @return {*}
     */
    const flyToRectangle = (RectangleCD) => {
      // 添加定位信息
      RectangleCD = RectangleCD || [
        Cesium.Cartesian3.fromDegrees(67.83746196341815, 17.00352500800621, 0),
        Cesium.Cartesian3.fromDegrees(137.2400439980721, 53.97424956088774, 0),
      ];

      var rec = Cesium.Rectangle.fromCartesianArray(RectangleCD);
      var boundingSphere = Cesium.BoundingSphere.fromRectangle3D(rec);
      viewer.camera.flyToBoundingSphere(boundingSphere, {
        duration: 3,
        complete: function () {
          alert(
            "依次单击两次，然后拖动画矩形和修改矩形，右击结束并保存 BBOX 范围！"
          );
        },
        offset: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90),
          range: 0.0,
        },
      });
    };
    const loadTileset = (url) => {
      const { viewer } = store.state;
      clippingPlanes = new Cesium.ClippingPlaneCollection({
        planes: [
          new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0),
        ],
        // edgeWidth : viewModel.edgeStylingEnabled ? 1.0 : 0.0
        edgeWidth: 0.0,
      });

      tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: url,
          clippingPlanes: clippingPlanes,
        })
      );

      tileset.debugShowBoundingVolume = true;
      return tileset.readyPromise
        .then(function () {
          var boundingSphere = tileset.boundingSphere;
          var radius = boundingSphere.radius;

          viewer.zoomTo(
            tileset,
            new Cesium.HeadingPitchRange(0.5, -0.2, radius * 4.0)
          );

          for (var i = 0; i < clippingPlanes.length; ++i) {
            var plane = clippingPlanes.get(i);
            var planeEntity = viewer.entities.add({
              position: boundingSphere.center,
              plane: {
                dimensions: new Cesium.Cartesian2(radius * 1.0, radius * 1.0),
                material: Cesium.Color.RED.withAlpha(0.1),
                plane: new Cesium.CallbackProperty(
                  createPlaneUpdateFunction(plane),
                  false
                ),
                outline: true,
                outlineColor: Cesium.Color.WHITE.withAlpha(1.0),
              },
            });

            planeEntities.push(planeEntity);
          }
          return tileset;
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    const createPlaneUpdateFunction = (plane) => {
      return function () {
        plane.distance = targetY + 10;
        return plane;
      };
    };
    const handleClear = () => {
      const { viewer } = store.state;
      //   viewer.scene.primitives.removeAll();
    };
    onMounted(() => {
      // init();
      clipModel();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      loadTileset,
      reloadFunc,
      reloadFunc2,
      flyToRectangle,
      createPlaneUpdateFunction,
      init,
      clipModel,
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
  top: 100px;
  right: 100px;
  z-index: 200;
  width: 200px;
  height: 80px;
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

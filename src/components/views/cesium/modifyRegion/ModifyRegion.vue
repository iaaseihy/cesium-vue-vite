<!--
 * @Descripttion: 道路穿梭线
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-28 15:49:12
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
  import * as Cesium from "../../../../../public/static/SuperMapCesium/Cesium.js";
  import { defineComponent, onMounted, onUnmounted } from "vue";
  import { useStore } from "vuex";
  import CesiumContainer from "@/views/CesiumContainer.vue";
  import { getGeojson } from "@/api/api.js";
  
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
      const reloadFunc = () => {
        const { viewer } = store.state;
        //绘制多边形
        var handlerPolygon = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Polygon, 0);
        handlerPolygon.activeEvt.addEventListener(function (isActive) {
        });
        handlerPolygon.movingEvt.addEventListener(function (windowPosition) {
        });
        handlerPolygon.drawEvt.addEventListener(function (result) {
            handlerPolygon.polygon.show = false;
            handlerPolygon.polyline.show = false;
            var array = [].concat(result.object.positions);
            var positions = [];
            for (var i = 0, len = array.length; i < len; i++) {
                var cartographic = Cesium.Cartographic.fromCartesian(array[i]);
                var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                var h = cartographic.height;
                if (positions.indexOf(longitude) == -1 && positions.indexOf(latitude) == -1) {
                    positions.push(longitude);
                    positions.push(latitude);
                    positions.push(h);
                }
            }
            // viewer.scene.globe.removeAllModifyRegion();
            viewer.scene.globe.addModifyRegion({
                name: 'ggg' + Math.random(),
                position: positions
            });
            handlerPolygon.deactivate();
            handlerPolygon.activate();
        });
        handlerPolygon.activate();
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
  
      
      const handleClear = () => {
        const { viewer } = store.state;
        //   viewer.scene.primitives.removeAll();
      };
      onMounted(() => {
          // init();
        // clipModel();
      });
      onUnmounted(() => {
        handleClear();
      });
      return {
        handleClear,
        reloadFunc,
        reloadFunc2,
        init,
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
      
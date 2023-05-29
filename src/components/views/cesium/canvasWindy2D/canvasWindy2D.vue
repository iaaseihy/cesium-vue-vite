<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-25 16:23:50
-->
<template>
  <div id="body_div" class="body_div">
    <div id="cesiumContainer"></div>
    <div class="panel_view">
      <ul class="volume-main">
        <li class="volume-clear">
          <span @click="addWindy()">添加二维风场</span>
          <span @click="handleClear()">清空二维风场</span>
        </li>
      </ul>
    </div>
    <div class="windycanvas_list">
      <span>粒子个数：{{ viewModel.particlesNumber }}</span>
      <el-slider
        :id="sliderId1"
        v-model="viewModel.particlesNumber"
        @change="setMapPercentage"
        :max="100000.0"
        :min="0.0"
      />
      <span>线宽度：{{ viewModel.lineWidth }}</span>
      <el-slider
        :id="sliderId2"
        v-model="viewModel.lineWidth"
        @change="setLineWidth"
        :max="10.0"
        :min="0.1"
      />
      <span>移动速率：{{ viewModel.windSpeed }}</span>
      <el-slider
        :id="sliderId3"
        v-model="viewModel.windSpeed"
        @change="setWindSpeed"
        :max="100.0"
        :min="1"
      />
      <span>存活时间：{{ viewModel.windyAge }}</span>
      <el-slider
        :id="sliderId4"
        v-model="viewModel.windyAge"
        @change="setWindAge"
        :max="500.0"
        :min="10.0"
      />
      <el-form-item label="风场颜色" prop="areaColor">
        <el-color-picker
          v-model="viewModel.windColor"
          color-format="rgb"
          @change="setWindColor"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script>
import * as Cesium from "cesium";
// import windy2D from "./windy2D.js";
import { CanvasWindy } from "./canvasWindy2D.js";
import windyData from "./2017121300.json";

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

var viewer, scene, windy, windycanvas;
export default {
  name: "canvasWindy2D",
  components: {},
  data() {
    return {
      subdomains: 1,
      coordiatesArr: [],
      cesiumViewer: null,
      Earth: null,
      modelUrl: "@/static/gltf/Cesium_Man.glb",
      testArr: [1, 2, 3],
      winData: {},
      options: {
        age: 120, // 粒子最大生存周期
        particlesNumber: 2000, // 初始粒子总数
        frameRate: 1, //刷新速度
        speedRate: 3000, //粒子前行速度，决定粒子一步走多远
      },
      grid: [],
      windycanvas: null,
      windData: windyData,
      viewModel: {
        particlesNumber: 2000,
        lineWidth: 1.0,
        windSpeed: 50.0,
        windyAge: 120.0,
        windColor: "rgb(186, 213, 7)",
      },
      canrefresh: -1,
      canrefresh2: -1,
    };
  },
  mounted() {
    this.initViewer();
  },
  methods: {
    initViewer() {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMmEyNjk5Ni02YjM4LTQ1NWUtOTk3Ny1mMzg5ZDFkZGEwYjYiLCJpZCI6MjYzODMsImlhdCI6MTY2NTczNDAwNX0.E8DSOKZagTy0leqyheZVzpjwrh3AactCSgQF3v22T2Q";
      // 天地图影像
      var imageryProvider1 = new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=你的token",
        layer: "tdtBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
      });
      // 注记
      var imageryProvider2 = new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=你的token",
        layer: "tdtAnnoLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
      });
      // 本地影像
      var imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: LOCAL_IMG_URL,
        //   url: GAODE_IMG_URL,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        fileExtension: "png",
        minimumLevel: 0,
        maximumLevel: 19,
      });
      var terrainProvider = new Cesium.CesiumTerrainProvider({
        url: LOCAL_TERRAIN_URL,
        requestWaterMask: true, // 请求水波纹效果
      });
      var terrainProviderMars = new Cesium.CesiumTerrainProvider({
        url: "http://data.marsgis.cn/terrain",
        requestWaterMask: true, // 请求水波纹效果
        requestVertexNormals: true,
      });
      var terrainProviderGoogle = Cesium.createWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: false,
      });
      // 百度
      var baiduImageryProvider = new BaiduImageryProvider({
        url: "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
        layer: "tdtAnnoLayer",
        style: "default",
        format: "image/jpeg",
        maximumLevel: 18,
        subdomains: this.subdomains,
        tileMatrixSetID: "GoogleMapsCompatible",
        crs: "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
        tilingScheme: null,
      });
      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainExaggeration: 0.95,
        imageryProvider: imageryProvider,
        // imageryProvider: baiduImageryProvider,
        // terrainProvider: terrainProvider,
        // terrainProvider: terrainProviderMars,
        terrainProvider: terrainProviderGoogle,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        timeline: false,
        animation: false,
        selectionIndicator: false,
        infoBox: false,
      });
      // 通过imageryLayers获取图层列表集合
      var layers = viewer.scene.imageryLayers;
      // 图层列表集合的addImageryProvider方法:
      // 两个参数，第一参数是一个ImageryProvider函数，这个函数的作用是新建一个图层;第二个参数是index，Number类型，作用是指定新插入图层在图层列表集合中的索引(位置)，若不指定，默认新图层添加在最上层
      // 返回值是新添加到图层列表集合中的图层
      var baiduImageryLayer = layers.addImageryProvider(
        new BaiduImageryProvider({
          url: "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
          layer: "tdtAnnoLayer",
          style: "dark",
          format: "image/jpeg",
          maximumLevel: 18,
          subdomains: this.subdomains,
          tileMatrixSetID: "GoogleMapsCompatible",
          crs: "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
          tilingScheme: null,
        })
      );
      // get或set图层透明度，范围是0-1
      baiduImageryLayer.alpha = 0.6;

      // get或set图层亮度，小于1图层更暗，大于1更亮
      baiduImageryLayer.brightness = 1.0;
      // 添加高德地图并使用插件纠偏
      var gaodeImageryLayer = layers.addImageryProvider(
        new AmapImageryProvider({
          url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
          layer: "tdtAnnoLayer",
          style: "default",
          format: "image/jpeg",
          maximumLevel: 18,
          subdomains: this.subdomains,
          tileMatrixSetID: "GoogleMapsCompatible",
          crs: "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
          tilingScheme: null,
        })
      );
      // get或set图层透明度，范围是0-1
      gaodeImageryLayer.alpha = 1.0;

      // get或set图层亮度，小于1图层更暗，大于1更亮
      gaodeImageryLayer.brightness = 1.0;
      // 修改影像图层颜色，变为暗色
      console.log(
        layers,
        "terrainLayers: ",
        viewer.scene.terrainProvider._layers
      );

      // 用于渲染星空的SkyBox对象
      viewer.scene.skyBox = new Cesium.SkyBox({
        sources: {
          positiveX: positiveX,
          negativeX: negativeX,
          positiveY: positiveY,
          negativeY: negativeY,
          positiveZ: positiveZ,
          negativeZ: negativeZ,
        },
      });
      viewer._cesiumWidget._creditContainer.style.display = "none";

      var ArcGisMap = new Cesium.UrlTemplateImageryProvider({
        // 调用深蓝夜色影像服务
        url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
      });

      viewer.scene.globe.showGroundAtmosphere = false;
      // viewer.scene.globe.baseColor = Color.BLACK
      // viewer.scene.globe.baseColor = new Cesium.Color(1, 1, 1, 0) // 修改地球颜色
      // viewer.scene.primitives.add(createOsmBuildings())
      // viewer.scene.camera.flyTo({
      //   destination: Cartesian3.fromDegrees(-74.019, 40.6912, 750)
      // })
      // 调整场景光照
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(
          0.35492591601301104,
          -0.8909182691839401,
          -0.2833588392420772
        ),
      });

      // 显示帧率
      viewer.scene.debugShowFramesPerSecond = true;
      viewer.scene.globe.depthTestAgainstTerrain = false;

      // 添加3d tiles调试面板
      viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
      var inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;
      console.log("inspectorViewModel: ", inspectorViewModel);

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      this.$store.state.cesiumDrawHandler = handler;
      window.cesiumViewer = viewer;
      this.cesiumViewer = viewer;
      scene = viewer.scene;

      //   viewer.camera.setView({
      //     // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
      //     // fromDegrees()方法，将经纬度和高程转换为世界坐标
      //     destination: Cesium.Cartesian3.fromDegrees(99, 36.4, 18000008),
      //     orientation: {
      //       // 指向
      //       // heading:Cesium.Math.toRadians(90,0),
      //       // 视角
      //       // pitch:Cesium.Math.toRadians(-90),
      //       // roll:0.0
      //     },
      //   });
      viewer.scene.camera.setView({
        destination: new Cesium.Cartesian3.fromDegrees(
          107.515637,
          31.105743,
          22844209
        ),
      });

      /**
       *如果处于全球状态就设置为[]（只要有一个角获取不到坐标就表示全球状态，实时计算）
       **/
      var globalExtent = [];
      var showWindy = function () {
        // $('#windycanvas').show();
        document.getElementById("windycanvas").style.display = "block";
      };
      var hideWindy = function () {
        // $('#windycanvas').hide();
        document.getElementById("windycanvas").style.display = "none";
      };
      //获取当前三维窗口左上、右上、左下、右下坐标
      var getCesiumExtent = function () {
        var canvaswidth = window.innerWidth,
          canvasheight = window.innerHeight - 50;

        var left_top_pt = new Cesium.Cartesian2(0, 0);
        var left_bottom_pt = new Cesium.Cartesian2(0, canvasheight);
        var right_top_pt = new Cesium.Cartesian2(canvaswidth, 0);
        var right_bottom_pt = new Cesium.Cartesian2(canvaswidth, canvasheight);

        var pick1 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(left_top_pt),
          viewer.scene
        );
        var pick2 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(left_bottom_pt),
          viewer.scene
        );
        var pick3 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(right_top_pt),
          viewer.scene
        );
        var pick4 = viewer.scene.globe.pick(
          viewer.camera.getPickRay(right_bottom_pt),
          viewer.scene
        );
        if (pick1 && pick2 && pick3 && pick4) {
          //将三维坐标转成地理坐标---只需计算左下右上的坐标即可
          var geoPt1 =
            viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);
          var geoPt2 =
            viewer.scene.globe.ellipsoid.cartesianToCartographic(pick3);
          //地理坐标转换为经纬度坐标
          var point1 = [
            (geoPt1.longitude / Math.PI) * 180,
            (geoPt1.latitude / Math.PI) * 180,
          ];
          var point2 = [
            (geoPt2.longitude / Math.PI) * 180,
            (geoPt2.latitude / Math.PI) * 180,
          ];
          // console.log(point1,point2);
          //此时说明extent需要分为东西半球
          if (point1[0] > point2[0]) {
            globalExtent = [
              point1[0],
              180,
              point1[1],
              point2[1],
              -180,
              point2[0],
              point1[1],
              point2[1],
            ];
          } else {
            globalExtent = [point1[0], point2[0], point1[1], point2[1]];
          }
        } else {
          globalExtent = [];
        }
      };
      // 开启监听器--无论对当前地球做的任何操作都会监听到
      let postRender = viewer.scene.postRender.addEventListener(() => {
        getCesiumExtent();
      });
      var refreshTimer = -1;
      var mouse_down = false;
      var mouse_move = false;
      // var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      //鼠标滚动、旋转后是否需要重新生成风场---如果需要，打开以下注释--旋转或者移动到北半球的时候计算会有问题
      handler.setInputAction(function (e) {
        clearTimeout(refreshTimer);
        hideWindy();
        setTimeout(function () {
          windy.extent = globalExtent;
          windy.redraw();
          showWindy();
        }, 200);
      }, Cesium.ScreenSpaceEventType.WHEEL);
      //鼠标左键、右键按下
      handler.setInputAction(function (e) {
        mouse_down = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(function (e) {
        mouse_down = true;
      }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
      //鼠标移动
      handler.setInputAction(function (e) {
        if (mouse_down) {
          hideWindy();
          mouse_move = true;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //鼠标左键、右键抬起
      handler.setInputAction(function (e) {
        if (mouse_down && mouse_move) {
          windy.extent = globalExtent;
          windy.redraw();
        }
        showWindy();
        mouse_down = false;
        mouse_move = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(function (e) {
        if (mouse_down && mouse_move) {
          windy.extent = globalExtent;
          windy.redraw();
        }
        showWindy();
        mouse_down = false;
        mouse_move = false;
      }, Cesium.ScreenSpaceEventType.RIGHT_UP);
      // 风场结束

      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false; //相机与地形的碰撞检测
      viewer.scene.globe.translucency.frontFaceAlphaByDistance =
        new Cesium.NearFarScalar(1.5e2, 0.5, 8.0e6, 1.0);
      // viewer.scene.globe.transluce
      viewer.camera.moveEnd.addEventListener(this.getCurrentExtent);
    },
    // 添加二维风场
    addWindy() {
      //初始化canvas的长宽
      windycanvas = document.createElement("canvas");
      windycanvas.setAttribute("id", "windycanvas");
      windycanvas.style.position = "fixed";
      windycanvas.style["pointer-events"] = "none";
      windycanvas.style["z-index"] = 10;
      windycanvas.style["top"] = 0;
      document.getElementById("body_div").appendChild(windycanvas);
      this.resizeCanvas();
      window.onresize = this.resizeCanvas();
      //风场的参数配置，除了canvas是必传项，其他可以不传，参数含义见windy.js，以下配置了所有参数
      var params = {
        // extent:[73.6666,135.0416,3.86666,53.55],//中国范围
        viewer: viewer,
        canvas: windycanvas,
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight,
        speedRate: 5000,
        particlesNumber: 10000,
        maxAge: 120,
        frameRate: 10,
        color: "#e0761a",
        lineWidth: 2,
      };
      windy = new CanvasWindy(this.windData, params);
    },
    resizeCanvas() {
      windycanvas.width = window.innerWidth;
      windycanvas.height = window.innerHeight;
      if (windy) {
        windy._resize(windycanvas.width, windycanvas.height);
      }
    },
    // 获取当前相机视角内的图幅范围
    getCurrentExtent() {
      // 范围对象
      var extent = {};

      // 得到当前三维场景
      var scene = viewer.scene;

      // 得到当前三维场景的椭球体
      var ellipsoid = scene.globe.ellipsoid;
      var canvas = scene.canvas;

      // canvas左上角
      var car3_lt = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(0, 0),
        ellipsoid
      );

      // canvas右下角
      var car3_rb = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(canvas.width, canvas.height),
        ellipsoid
      );

      // 当canvas左上角和右下角全部在椭球体上
      if (car3_lt && car3_rb) {
        var carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
        var carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
        extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
        extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
        extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
        extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
      }

      // 当canvas左上角不在但右下角在椭球体上
      else if (!car3_lt && car3_rb) {
        var car3_lt2 = null;
        var yIndex = 0;
        do {
          // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
          yIndex <= canvas.height ? (yIndex += 10) : canvas.height;
          car3_lt2 = viewer.camera.pickEllipsoid(
            new Cesium.Cartesian2(0, yIndex),
            ellipsoid
          );
        } while (!car3_lt2);
        var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt2);
        var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb);
        extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
        extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
        extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
        extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
      }

      // 获取高度
      extent.height = Math.ceil(viewer.camera.positionCartographic.height);
      // 获取当前缩放的地图层级
      let level = 0;
      if (viewer.scene.globe._surface._tilesToRender.length) {
        level = viewer.scene.globe._surface._tilesToRender[0].level;
        console.log("当前地图层级=======", level);
      }
      console.log(
        "地图变化监听事件",
        extent,
        (extent.xmin + extent.xmax) / 2,
        (extent.ymax + extent.ymin) / 2
      );
    },
    // 鼠标拖拽松开时
    setMapPercentage(val) {
      console.log(val);
      console.log(this.viewModel.particlesNumber);
      windy.particlesNumber = this.viewModel.particlesNumber;
      this.canrefresh = setTimeout(function () {
        windy.redraw();
      }, 500);
    },
    setLineWidth(val) {
      if (windy) {
        windy.lineWidth = this.viewModel.lineWidth;
      }
    },
    setWindSpeed(val) {
      if (windy) {
        windy.speedRate =
          (100 -
            (this.viewModel.windSpeed > 99 ? 99 : this.viewModel.windSpeed)) *
          100;
        windy._calcStep();
      }
    },
    setWindAge(val) {
      if (windy) {
        clearTimeout(this.canrefresh2);
        windy.maxAge = this.viewModel.windyAge;
        this.canrefresh2 = setTimeout(function () {
          windy.redraw();
        }, 500);
      }
    },
    setWindColor(val) {
      if (windy) {
        windy.color = this.viewModel.windColor;
      }
    },
    handleClear() {
      if (windy) {
        windy.removeLines();
      }
    },
  },
};
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

.body_div {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
}

.el-slider {
  width: 30%;
  margin-left: 20%;
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
  width: 250px;
  height: 100px;
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

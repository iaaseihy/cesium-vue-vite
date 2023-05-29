<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-26 11:38:07
-->
<template>
  <div id="cesiumContainer" class="fullSize">
    <div class="panel_view">
      <ul class="volume-main">
        <li class="volume-clear">
          <span @click="addHeatmap2d()">添加</span>
          <span @click="handleClear()">清空</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import * as h337 from "heatmap.js";
import Heatmap from "./heatmap2D.js";

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
// import { updateMaterial } from "./ContourLine.js";
import positiveX from "@img/SkyBox/00h+00.jpg";
import negativeX from "@img/SkyBox/12h+00.jpg";
import positiveY from "@img/SkyBox/06h+00.jpg";
import negativeY from "@img/SkyBox/18h+00.jpg";
import positiveZ from "@img/SkyBox/06h+90.jpg";
import negativeZ from "@img/SkyBox/06h-90.jpg";
// import MeasureTool from "../../components/measureTool/MeasureTool.js";
import ContourLine from "@/components/views/ContourLine.vue";
// import WallDiffuseMaterialProperty from "../commonJS/WallDiffuseMaterialProperty";
// import WallLinkCustomMaterialProperty from "../commonJS/WallLinkCustomMaterialProperty";
// import Visibility from '../commonJS/viewShedTwoPoints'
// import { CV } from '../commonJS/CV.js'
// import "../../constants/data/config";
// import gltfModel from '../../../public/static/gltf/Cesium_Man.glb'
// import ViewAnalysis from "../views/spatialAnalysis/viewShed/viewAnalysis.js";
var viewer,
  viewerEye,
  scene,
  tileset1,
  tilesetBaimo,
  viewAnalysisCls,
  viewShedOpts,
  heatmap2d;
export default {
  name: "CesiumContainer",
  components: { ContourLine },
  data() {
    return {
      subdomains: 1,
      coordiatesArr: [],
      cesiumViewer: null,
      Earth: null,
      modelUrl: "@/static/gltf/Cesium_Man.glb",
      testArr: [1, 2, 3],
      wallPosition1: Cesium.Cartesian3.fromDegreesArrayHeights([
        104.07263175401185, 30.647622150198725, 1500.0, 104.06369117158526,
        30.648834374000277, 1500.0, 104.06437182811021, 30.62274533905387,
        1500.0, 104.07463538167119, 30.62285687644371, 1500.0,
        104.07263175401185, 30.647622150198725, 1500.0,
      ]),
      wallPosition2: Cesium.Cartesian3.fromDegreesArrayHeights([
        104.09816110606057, 30.659821965447698, 200.0, 104.1120972824757,
        30.65330300319938, 200.0, 104.10758419863926, 30.64592470850288, 200.0,
        104.09351691196979, 30.652434826507452, 200.0, 104.09816110606057,
        30.659821965447698, 200.0,
      ]),
    };
  },
  mounted() {
    // this.initDefaultView()
    this.initViewer();
    // this.initEarthViewer()
    // new Cesium.Viewer('cesiumContainer')
    // 测量距离
    // MeasureTool.measureLineSpace(viewer, null)
    // // 测量面积
    // MeasureTool.measureAreaSpace(viewer, null)
  },
  methods: {
    initDefaultView() {
      // 本地影像
      var imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: LOCAL_IMG_URL,
        //   url: GAODE_IMG_URL,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        fileExtension: "png",
        minimumLevel: 0,
        maximumLevel: 19,
      });
      var terrainProviderGoogle = Cesium.createWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: false,
      });
      new Cesium.Viewer("cesiumContainer", {
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
    },
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

      viewer.camera.setView({
        // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
        // fromDegrees()方法，将经纬度和高程转换为世界坐标
        destination: Cesium.Cartesian3.fromDegrees(99, 36.4, 18000008),
        orientation: {
          // 指向
          // heading:Cesium.Math.toRadians(90,0),
          // 视角
          // pitch:Cesium.Math.toRadians(-90),
          // roll:0.0
        },
      });

      // viewAnalysisCls = new ViewAnalysis(viewer);
      // // 加载100000个模型
      // this.addGlbCollection()
      // 加载大雁塔倾斜摄影
      // this.set3Dtitle3();
      // 添加白膜
      // this.BAIMOEdit()
      // 添加等高线
      // this.setContourRef()
      // this.setContour()

      // 立体墙
      // this.wllUp();
      // this.wallCustom()

      // 开启两点间可视域分析
      // this.visibilityTwoPoints(viewer)
      // viewer.flyTo(tilesetBaimo)
      // viewer.flyTo(tileset1)
      // this.limitCameraToGround(true);
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false; //相机与地形的碰撞检测
      viewer.scene.globe.translucency.frontFaceAlphaByDistance =
        new Cesium.NearFarScalar(1.5e2, 0.5, 8.0e6, 1.0);
      // viewer.scene.globe.transluce
      viewer.camera.moveEnd.addEventListener(this.getCurrentExtent);
    },
    // 添加热力图
    addHeatmap2d() {
      // 热力图
      // let list = [];
      // for (let i = 0; i < 100; i++) {
      //   list.push({
      //     lnglat: [
      //       117.28 + Math.random() * (Math.random() > 0.5 ? 1 : -1),
      //       31.923 + Math.random() * (Math.random() > 0.5 ? 1 : -1),
      //     ],
      //     value: 100 * Math.random(),
      //   });
      // }
      // heatmap2d = new Heatmap(viewer, {
      //   list: list,
      // });
      // if (heatmap2d == null) {
      //       heatmap2d = new CesiumHeatmap(viewer, './busstop2016.geojson')
      //   }

      let bounds = {
        west: 120.65290308330879,
        south: 31.273633917763892,
        east: 120.79146729222676,
        north: 31.410010681404547,
      };

      // init heatmap
      let heatMap = CesiumHeatmap.create(
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
    },
    // 设置相机是否进入地下
    limitCameraToGround(isOpen) {
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
    handleClear() {
      if (heatmap2d) {
        heatmap2d.destory();
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

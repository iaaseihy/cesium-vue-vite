<!--
 * @Descripttion: 点聚合 适合entity类型的少量点的数据
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-29 13:55:30
-->
<template>
  <div id="cesiumContainer" class="fullSize">
    <div class="panel_view">
      <ul class="volume-main">
        <li class="volume-clear">
          <span @click="addPointCluster()">添加</span>
          <span @click="handleClear()">清空</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as Cesium from "cesium";

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
// import ContourLine from "@/components/views/ContourLine.vue";
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
  name: "PointCluster",
  components: {},
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
    // 点聚合
    addPointCluster() {
      this.initCluster(viewer);
      // viewer.camera.flyTo({
      //   destination: Cesium.Cartesian3.fromDegrees(
      //     87.50052452087402,
      //     29.808103677175467,
      //     20000
      //   ),
      //   orientation: {
      //     heading: Cesium.Math.toRadians(0.0),
      //     pitch: Cesium.Math.toRadians(-90.0),
      //     roll: 0.0,
      //   },
      // });
    },
    /**
     * @description: 点聚合功能效果
     * @param {*} viewer
     * @return {*}
     */
    initCluster(viewer) {
      let self = this;
      viewer.dataSources.add(
        new Cesium.GeoJsonDataSource()
          .load("static/geojson/chuzhong.geojson")
          .then((dataSource) => {
            // 设置聚合参数
            dataSource.clustering.enabled = true;
            dataSource.clustering.pixelRange = 60;
            dataSource.clustering.minimumClusterSize = 2;

            // foreach用于调用数组的每个元素，并将元素传递给回调函数。
            dataSource.entities.values.forEach((entity) => {
              // 将点拉伸一定高度，防止被地形压盖
              entity.position._value.z += 50.0;
              // 使用大小为64*64的icon，缩小展示poi
              entity.billboard = {
                //   image: "./icons/poi.png",
                image: "static/geojson/mark-icon.png",
                width: 32,
                height: 32,
              };
              entity.label = {
                text: "POI",
                font: "bold 15px Microsoft YaHei",
                // 竖直对齐方式
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                // 水平对齐方式
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                // 偏移量
                pixelOffset: new Cesium.Cartesian2(15, 0),
              };
            });

            // 添加监听函数
            dataSource.clustering.clusterEvent.addEventListener(function (
              clusteredEntities,
              cluster
            ) {
              // 关闭自带的显示聚合数量的标签
              cluster.label.show = false;
              cluster.billboard.show = true;
              cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

              // 根据聚合数量的多少设置不同层级的图片以及大小
              // if (clusteredEntities.length >= 20) {
              //   cluster.billboard.image = self.combineIconAndLabel(
              //     // "./icons/cluster_4.png",
              //     "static/geojson/school-icon.png",
              //     clusteredEntities.length,
              //     64
              //   );
              //   cluster.billboard.width = 72;
              //   cluster.billboard.height = 72;
              // } else
              if (clusteredEntities.length >= 12) {
                cluster.billboard.image = self.combineIconAndLabel(
                  // "./icons/cluster_3.png",
                  "static/geojson/school-icon.png",
                  clusteredEntities.length,
                  64
                );
                cluster.billboard.width = 56;
                cluster.billboard.height = 56;
              } else if (clusteredEntities.length >= 8) {
                cluster.billboard.image = self.combineIconAndLabel(
                  // "./icons/cluster_2.png",
                  "static/geojson/school-icon.png",
                  clusteredEntities.length,
                  64
                );
                cluster.billboard.width = 48;
                cluster.billboard.height = 48;
              } else {
                cluster.billboard.image = self.combineIconAndLabel(
                  // "./icons/cluster_1.png",
                  "static/geojson/school-icon.png",
                  clusteredEntities.length,
                  64
                );
                cluster.billboard.width = 40;
                cluster.billboard.height = 40;
              }
            });
            return dataSource;
          })
      );
    },

    /**
     * @description: 将图片和文字合成新图标使用（参考Cesium源码）
     * @param {*} url：图片地址
     * @param {*} label：文字
     * @param {*} size：画布大小
     * @return {*} 返回canvas
     */
    combineIconAndLabel(url, label, size) {
      // 创建画布对象
      let canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      let ctx = canvas.getContext("2d");

      let promise = new Cesium.Resource.fetchImage(url).then((image) => {
        // 异常判断
        try {
          ctx.drawImage(image, 0, 0);
        } catch (e) {
          console.log(e);
        }

        // 渲染字体
        // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
        ctx.fillStyle = Cesium.Color.BLACK.toCssColorString();
        ctx.font = "bold 20px Microsoft YaHei";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, size / 2, size / 2);

        return canvas;
      });
      return promise;
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

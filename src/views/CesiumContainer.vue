<!--
 * @version: 1.0.0
 * @Author: liubofang<421419567@qq.com>
 * @Date: 2021-06-15 15:08:22
 * @LastEditTime: 2023-08-02 17:47:53
-->
<template>
  <div id="cesiumContainer"></div>
</template>

<script>
// import 'cesium/Build/Cesium/Widgets/widgets.css'
import * as Cesium from "cesium";
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { Viewer } from "cesium";
import {
  LOCAL_IMG_URL,
  LOCAL_TERRAIN_URL,
  DAYANTA3DTILES,
  BAIMO3DTILES,
  GAODE_IMG_URL,
} from "@/components/commonJS/config";
import {
  BaiduImageryProvider,
  AmapImageryProvider,
} from "@/components/commonJS/BaiduImageryProvider";
import positiveX from "@img/SkyBox/00h+00.jpg";
import negativeX from "@img/SkyBox/12h+00.jpg";
import positiveY from "@img/SkyBox/06h+00.jpg";
import negativeY from "@img/SkyBox/18h+00.jpg";
import positiveZ from "@img/SkyBox/06h+90.jpg";
import negativeZ from "@img/SkyBox/06h-90.jpg";
export default {
  name: "CesiumContainer",
  setup() {
    // let viewer = ref<Viewer>(null);
    const subdomains = ref(1);
    const store = useStore();
    let viewer = computed < Viewer > null;
    let imageryProvider = computed < Cesium.UrlTemplateImageryProvider > null;
    let scene = ref();
    const initViewer = () => {
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
      imageryProvider = new Cesium.UrlTemplateImageryProvider({
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
        subdomains: subdomains,
        tileMatrixSetID: "GoogleMapsCompatible",
        crs: "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
        tilingScheme: null,
      });
      viewer = new Cesium.Viewer("cesiumContainer", {
        // // 指定上下文
        // contextOptions: {
        //   requestWebgl1: true,
        // },
        terrainExaggeration: 0.95,
        imageryProvider: imageryProvider,
        // imageryProvider: baiduImageryProvider,
        // terrainProvider: terrainProvider,
        // terrainProvider: terrainProviderMars,
        terrainProvider: terrainProviderGoogle,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: true,
        navigationHelpButton: false,
        sceneModePicker: false,
        timeline: false,
        animation: false,
        selectionIndicator: false,
        infoBox: false,
      });
      store.state.imageryProvider = imageryProvider;
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
          subdomains: subdomains,
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
          subdomains: subdomains,
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
      store.state.cesiumDrawHandler = handler;
      window.cesiumViewer = viewer;
      scene = viewer.scene;

      store.commit("initViewer", viewer);

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

      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false; //相机与地形的碰撞检测
      viewer.scene.globe.translucency.frontFaceAlphaByDistance =
        new Cesium.NearFarScalar(1.5e2, 0.5, 8.0e6, 1.0);
      // viewer.scene.globe.transluce
      viewer.camera.moveEnd.addEventListener(getCurrentExtent);
    };
    // 获取当前相机视角内的图幅范围
    const getCurrentExtent = () => {
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
    };
    onMounted(() => {
      // 初始化1
      initViewer();
      // 初始化2
      // viewer = new Viewer('cesiumContainer')
      // store.commit("initViewer", viewer);
    });
    return {
      // return中的数据会被父组件拿到
      viewer,
      scene,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumContainer {
  /* width: 100%;
  height: 100%; */
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>

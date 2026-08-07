<!--
 * @version: 1.0.0
 * @Author: liubofang<421419567@qq.com>
 * @Date: 2021-06-15 15:08:22
 * @LastEditTime: 2024-08-19 14:44:19
-->
<template>
  <div id="cesiumContainer">
    <div id="latlng_show" style="position:absolute;">
  <div style="float:left;">
       <font size="1" color="white">经度：<span id="longitude_show"></span>  </font>
  </div>
  <br>
  <div style="float:left;">
       <font size="1" color="white">纬度：<span id="latitude_show"></span>  </font>
  </div>
    <br>
  <div style="float:left;">
       <font size="1" color="white">视角高：<span id="altitude_show"></span>km  </font>
  </div>
   <br>
  <div style="float:left;">
       <font size="1" color="white">海拔高：<span id="elevation_show"></span>m</font>
  </div>
 
</div>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { Viewer } from "cesium";
import { createViewer, destroyViewer } from "@/components/commonJS/createViewer.js";
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
export default {
  name: "CesiumContainer",
  setup() {
    const subdomains = ref(1);
    const store = useStore();
    let viewer = computed < Viewer > null;
    let scene = ref();
    let moveEndListener = null;
    const initViewer = () => {
      // 使用工厂函数创建 Viewer（默认包含本地影像、Google地形、星空盒、隐藏credit、经纬度HUD）
      viewer = createViewer("cesiumContainer", {
        showSkyBox: true,
        showFps: true,
        showLatLng: true,
        viewerOptions: {
          homeButton: true,       // 原代码启用了 homeButton
          shouldAnimate: true,
        },
      });

      // 保存 imageryProvider 到 store（原代码逻辑）
      store.state.imageryProvider = viewer.imageryLayers.get(0).imageryProvider;

      // 添加百度地图图层（页面特定逻辑）
      var layers = viewer.scene.imageryLayers;
      var baiduImageryLayer = layers.addImageryProvider(
        new BaiduImageryProvider({
          url: "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
          layer: "tdtAnnoLayer",
          style: "dark",
          format: "image/jpeg",
          maximumLevel: 18,
          subdomains: subdomains,
          tileMatrixSetID: "GoogleMapsCompatible",
          crs: "WGS84",
          tilingScheme: null,
        })
      );
      baiduImageryLayer.alpha = 0.6;
      baiduImageryLayer.brightness = 1.0;

      // 添加高德地图图层（页面特定逻辑）
      var gaodeImageryLayer = layers.addImageryProvider(
        new AmapImageryProvider({
          url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
          layer: "tdtAnnoLayer",
          style: "default",
          format: "image/jpeg",
          maximumLevel: 18,
          subdomains: subdomains,
          tileMatrixSetID: "GoogleMapsCompatible",
          crs: "WGS84",
          tilingScheme: null,
        })
      );
      gaodeImageryLayer.alpha = 1.0;
      gaodeImageryLayer.brightness = 1.0;

      viewer.scene.globe.showGroundAtmosphere = false;
      // 调整场景光照
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(
          0.35492591601301104,
          -0.8909182691839401,
          -0.2833588392420772
        ),
      });
      viewer.scene.globe.depthTestAgainstTerrain = false;

      // 复用工厂函数创建的经纬度 handler（存入 store 供其他页面使用）
      store.state.cesiumDrawHandler = viewer._latLngHandler;
      window.cesiumViewer = viewer;
      scene = viewer.scene;

      store.commit("initViewer", viewer);

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(99, 36.4, 18000008),
        orientation: {},
      });

      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
      viewer.scene.globe.translucency.frontFaceAlphaByDistance =
        new Cesium.NearFarScalar(1.5e2, 0.5, 8.0e6, 1.0);
      moveEndListener = getCurrentExtent;
      viewer.camera.moveEnd.addEventListener(moveEndListener);
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
      initViewer();
    });
    onUnmounted(() => {
      // 移除 moveEnd 监听
      if (viewer && moveEndListener) {
        try {
          viewer.camera.moveEnd.removeEventListener(moveEndListener);
        } catch (e) {
          // ignore
        }
      }
      // 销毁 handler
      if (store.state.cesiumDrawHandler) {
        try {
          store.state.cesiumDrawHandler.destroy();
        } catch (e) {
          // ignore
        }
        store.state.cesiumDrawHandler = null;
      }
      // 销毁 viewer
      if (viewer && !viewer.isDestroyed()) {
        destroyViewer(viewer);
        viewer = null;
        window.cesiumViewer = undefined;
      }
    });
    return {
      viewer,
      scene,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumContainer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
#latlng_show {
  position: absolute;
    display: block;
    bottom: 40px;
    right: 0%;
    width: 340px;
    height: 30px;
    z-index: 100;
    font-size:1px;
}
</style>

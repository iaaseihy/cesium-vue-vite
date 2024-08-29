<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2024-08-29 10:02:37
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
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="modifyMap()">添加暗色电子地图1</el-button>
    <el-button @click="addDarkMap()">添加暗色电子地图滤镜(效果最好)</el-button>
    <el-button @click="addDarkMapByCanvas()">添加canvas暗色电子地图</el-button>
    <el-button @click="addDarkMapByRTT()">添加RTT暗色电子地图</el-button>
    <el-button @click="setViewerTheme()"
      >添加mars3d蓝色风暗色电子地图滤镜(效果最好)</el-button
    >
  </div>
</template>

<script>
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  reactive,
  initCustomFormatter,
} from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import ImageryTheme from "./imageryTheme.js";
import ImageryThemeGL from "./imageryThemeGL.js";
import modifyMapToDark from "./filterColor";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let entities;
    let entityDrag;
    let tilesetBaimo = ref < Cesium.Cesium3DTileset > null;
    let viewer;
    let layer;
    let imageryProvider;
    const state = reactive({
      dragtool: null,
    });
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
        baseLayer: false,
        // imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
        //   //影像底图
        //   url:
        //     "http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
        //     token,
        //   subdomains: subdomains,
        //   layer: "tdtImgLayer",
        //   style: "default",
        //   format: "image/jpeg",
        //   tileMatrixSetID: "GoogleMapsCompatible", //使用谷歌的瓦片切片方式
        //   show: true,
        // }),
      });
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8&x={x}&y={y}&z={z}",

          maximumLevel: 18,
        })
      );
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      // g跟随鼠标获取经纬度和海拔
      let longitude_show = document.getElementById('longitude_show');
      let latitude_show = document.getElementById('latitude_show');
      let altitude_show = document.getElementById('altitude_show');
      let elevation_show = document.getElementById('elevation_show');
      let ellipsoid = viewer.scene.globe.ellipsoid;
      handler.setInputAction(function(movement){
            //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
             var cartesian=viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
              if(cartesian){
                   //将笛卡尔三维坐标转为地图坐标（弧度）
                   var cartographic=viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                   //将地图坐标（弧度）转为十进制的度数
                    var lat_String=Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
                    var log_String=Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
                    var alti_String=(viewer.camera.positionCartographic.height/1000).toFixed(5);
                    let elec_String;
                    if (viewer.scene.globe.getHeight(cartographic)) {
                      elec_String =viewer.scene.globe.getHeight(cartographic).toFixed(7);
                    }
                    longitude_show.innerHTML=log_String;
                    latitude_show.innerHTML=lat_String;
                    altitude_show.innerHTML=alti_String;//视角高度 km
                    elevation_show.innerHTML=elec_String;//海拔
               }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //   return viewer;
    };
    // 图层里添加天地图电子地图
    const addTiandituMap = () => {
      const { viewer } = store.state;
      imageryProvider = createTdtImageryProvider({
        layer: "vec",
        // appKey: "你的天地图AppKey",
        appKey: "edd63cb6efda66a59e9d4d6f30b0a92c",
      });
      //接下来我们就要对这个图层进行处理
      layer = viewer.imageryLayers.addImageryProvider(imageryProvider);
      //调用影响中文注记服务
      //标注
      let TDT_CIA_C =
        "http://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
        "&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
        "&style=default&format=tiles&tk=edd63cb6efda66a59e9d4d6f30b0a92c";
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: TDT_CIA_C,
          layer: "tdtImg_c",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "c",
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
          tilingScheme: new Cesium.GeographicTilingScheme(),
          tileMatrixLabels: [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
          ],
          maximumLevel: 50,
          show: false,
        })
      );
    };
    // 加载天地图
    const createTdtImageryProvider = (params) => {
      var tileMatrixSet = "w";
      var host = params.host || "http://t{s}.tianditu.com/";
      var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];

      if (host[host.length - 1] == "/") {
        host = host.substr(0, host.length - 1);
      }
      var url =
        host +
        "/" +
        params.layer +
        "_" +
        tileMatrixSet +
        "/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=" +
        params.layer +
        "&tileMatrixSet=" +
        tileMatrixSet +
        "&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles";
      url += "&tk=" + params.appKey;

      let provider = new Cesium.WebMapTileServiceImageryProvider({
        url: url,
        layer: params.layer,
        style: "default",
        subdomains: subdomains,
        tileMatrixSetID: tileMatrixSet,
        maximumLevel: params.maximumLevel || 18,
        minimumLevel: params.minimumLevel,
      });

      return provider;
    };
    const addDarkMapByCanvas = () => {
      // const { viewer } = store.state;
      //创建主题，设置相关参数
      const theme = new ImageryTheme({
        bgColor: "black",
        alpha: 0.5,
        invert: true,
      });
      //重写 imageryProvider.requestImage 方法
      const requestImage = layer.imageryProvider.requestImage;
      imageryProvider.requestImage = function (x, y, level, request) {
        var promise = requestImage.bind(imageryProvider)(x, y, level, request);
        if (promise) {
          promise = promise.then((image) => {
            var imageProcessed = theme.processImage(image, layer);
            return imageProcessed || image;
          });
        }
        return promise;
      };
    };
    const addDarkMapByRTT = () => {
      // const { viewer } = store.state;
      //创建主题，设置相关参数
      const theme = new ImageryThemeGL({
        bgColor: Cesium.Color.BLACK,
        alpha: 0.5,
        invert: true,
        preMultiplyAlpha: true,
      });
      //重写 layer._createTextureWebGL 方法
      var _createTextureWebGL = layer._createTextureWebGL;
      layer._createTextureWebGL = function (context, imagery) {
        var texture = _createTextureWebGL.bind(this)(context, imagery);
        var textureProcessed = theme.processTexture(context, texture);
        return textureProcessed || texture;
      };
    };
    const addDarkMap = () => {
      // const { viewer } = store.state;
      let options = {
        //反色?
        invertColor: true,
        //滤镜值
        filterRGB: [60, 145, 172],
      };
      DarkMap(viewer, options);
    };
    const DarkMap = (viewer, options) => {
      const baseLayer = viewer.imageryLayers.get(0);
      //以下几个参数根据实际情况修改,目前我是参照火星科技的参数,个人感觉效果还不错
      baseLayer.brightness = options.brightness || 0.6;
      baseLayer.contrast = options.contrast || 1.8;
      baseLayer.gamma = options.gamma || 0.3;
      baseLayer.hue = options.hue || 1;
      baseLayer.saturation = options.saturation || 0;
      const baseFragShader =
        viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;
      for (let i = 0; i < baseFragShader.length; i++) {
        const strS =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";
        let strT =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";
        if (options.invertColor) {
          strT += `
      color.r = 1.0 - color.r;
      color.g = 1.0 - color.g;
      color.b = 1.0 - color.b;
      `;
        }
        if (options.filterRGB.length > 0) {
          strT += `
      color.r = color.r * ${options.filterRGB[0]}.0/255.0;
      color.g = color.g * ${options.filterRGB[1]}.0/255.0;
      color.b = color.b * ${options.filterRGB[2]}.0/255.0;
      `;
        }
        baseFragShader[i] = baseFragShader[i].replace(strS, strT);
      }
    };
    /* Cesium修改地图颜色代码(暗色电子地图) */
    const modifyMap1 = () => {
      const { viewer } = store.state;
      // 获取地图影像图层
      const baseLayer = viewer.imageryLayers.get(0);
      // 设置两个变量，用来判断是否进行颜色的翻转和过滤
      const options = {
        invertColor: true,
        filterRGB: [0, 50, 100],
      };
      // 更改地图着色器代码
      const baseFragShader =
        viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;
      for (let i = 0; i < baseFragShader.length; i++) {
        // console.log(baseFragShader[i])
        // console.log('------')

        const strS =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";
        let strT =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";
        if (options.invertColor) {
          strT += `
        color.r = 1.0 - color.r;
        color.g = 1.0 - color.g;
        color.b = 1.0 - color.b;
        `;
        }
        if (options.filterRGB.length > 0) {
          strT += `
        color.r = color.r * ${options.filterRGB[0]}.0/255.0;
        color.g = color.g * ${options.filterRGB[1]}.0/255.0;
        color.b = color.b * ${options.filterRGB[2]}.0/255.0;
        `;
        }
        baseFragShader[i] = baseFragShader[i].replace(strS, strT);
      }
    };
    const modifyMap = () => {
      // const { viewer } = store.state;
      //   let options = {
      //       //反色?
      //       invertColor: true,
      //       brightness: 0.5,
      //       // invertColor: true,
      //       //滤镜值
      //       // filterRGB: [136,162,172],
      //       filterRGB: [90,122,172],
      //       hue:0.5,
      //       gamma:0.3,
      //       contrast:1.5,
      //       saturation:0,
      //       color:'rgb(72,101,172)',
      //       //filterRGB: [60, 145, 172]rgb(22 39 73)
      //     };
      //   // 获取地图影像图层
      // const baseLayer = viewer.imageryLayers.get(0)
      // //以下几个参数根据实际情况修改,目前我是参照火星科技的参数,个人感觉效果还不错
      // baseLayer.brightness = options.brightness || 0.6
      // baseLayer.contrast = options.contrast || 1.8
      // baseLayer.gamma = options.gamma || 0.3
      // baseLayer.hue = options.hue || 1
      // baseLayer.saturation = options.saturation || 0
      // const baseFragShader = (viewer.scene.globe)._surfaceShaderSet
      //     .baseFragmentShaderSource.sources
      // for (let i = 0; i < baseFragShader.length; i++) {
      //   const strS = 'color = czm_saturation(color, textureSaturation);\n#endif\n'
      //   let strT = 'color = czm_saturation(color, textureSaturation);\n#endif\n'
      //   if (options.invertColor) {
      //     strT += `
      //   color.r = 1.0 - color.r;
      //   color.g = 1.0 - color.g;
      //   color.b = 1.0 - color.b;
      //   `
      //   }
      //   if (options.filterRGB.length > 0) {
      //     strT += `
      //   color.r = color.r * ${options.filterRGB[0]}.0/255.0;
      //   color.g = color.g * ${options.filterRGB[1]}.0/255.0;
      //   color.b = color.b * ${options.filterRGB[2]}.0/255.0;
      //   `
      //   }
      //   baseFragShader[i] = baseFragShader[i].replace(strS, strT)
      // }
      modifyMapToDark(viewer, {
        //反色?
        invertColor: true,
        //滤色值
        filterRGB: [60, 145, 172],
      });
    };
    const setViewerTheme = (options = {}) => {
      // const { viewer } = store.state;
      const baseLayer = viewer.imageryLayers.get(0);

      if (!baseLayer) return;

      baseLayer.brightness = options.brightness ?? 0.6;

      baseLayer.contrast = options.contrast ?? 1.8;

      baseLayer.gamma = options.gamma ?? 0.3;

      baseLayer.hue = options.hue ?? 1;

      baseLayer.saturation = options.saturation || 0;

      const baseFragShader =
        viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;

      for (let i = 0; i < baseFragShader.length; i++) {
        const strS =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";

        let strT =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";

        if (!options.invertColor) {
          strT += `
            color.r = 1.0 - color.r;
            color.g = 1.0 - color.g;
            color.b = 1.0 - color.b;
        `;
        }

        strT += `
        color.r = color.r * ${options.filterRGB_R ?? 100}.0/255.0;
        color.g = color.g * ${options.filterRGB_G ?? 138}.0/255.0;
        color.b = color.b * ${options.filterRGB_B ?? 230}.0/255.0;
    `;

        baseFragShader[i] = baseFragShader[i].replace(strS, strT);
      }

      viewer.scene.requestRender();
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      // addTiandituMap();
      init();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      modifyMap,
      addDarkMap,
      addDarkMapByCanvas,
      addDarkMapByRTT,
      setViewerTheme,
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

<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-14 16:22:35
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="modifyMap()">添加暗色电子地图1</el-button>
    <el-button @click="addDarkMap()">添加暗色电子地图滤镜(效果最好)</el-button>
    <el-button @click="addDarkMapByCanvas()">添加canvas暗色电子地图</el-button>
    <el-button @click="addDarkMapByRTT()">添加RTT暗色电子地图</el-button>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import { defineComponent, onMounted, onUnmounted, ref, reactive } from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import ImageryTheme from "./imageryTheme.js";
import ImageryThemeGL from "./imageryThemeGL.js";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let entities;
    let entityDrag;
    let tilesetBaimo = ref < Cesium.Cesium3DTileset > null;
    let layer;
    let imageryProvider;
    const state = reactive({
      dragtool: null,
    });
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
      const { viewer } = store.state;
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
      const { viewer } = store.state;
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
      const { viewer } = store.state;
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
    const modifyMap = () => {
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
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      addTiandituMap();
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

<template>
  <div id="cesiumContainer">
    <el-button @click="initModel">添加经纬度网格</el-button>
    <el-button @click="addGrid">添加网格</el-button>
    <el-button @click="removeGrid">移除加网格</el-button>
  </div>
  <div id="creditContainer" style="display: none"></div>
</template>
<script type="module">
// import * as Cesium from "../../../../../public/static/Cesium/Cesium.js";
import * as Cesium from "cesium";
import { Graticules } from "./grid.js";
import CustomImageryProvider from "./reWrite.js";
// import TileLonlatsImageryProvider from "./tilelonlatsimageryprovider1.js";
// // TileLonlatsImageryProvider
// console.log(TileLonlatsImageryProvider);
let viewer = undefined;
let imageryLayers;
let viewModel;
let newMap;
export default {
  mounted() {
    //   let key =
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDhhOThhNy0zMzUzLTRiZDktYWM3Ni00NGI5MGY2N2UwZDUiLCJpZCI6MjQzMjYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODUwMzUwNDh9.DYuDF_RPKe5_8w849_y-sutM68LM51O9o3bTt_3rF1w";
    //   Cesium.Ion.defaultAccessToken = key;
    // var mtdt = new Cesium.WebMapTileServiceImageryProvider({
    //   url: "http://{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=837264f46e683ec982d452e78d71052e",
    //   layer: "tdtBasicLayer",
    //   style: "default",
    //   maximumLevel: 18,
    //   format: "image/jpeg",
    //   tileMatrixSetID: "GoogleMapsCompatible",
    //   show: true,
    //   subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
    // });

    // var terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: "./sampledata/terrain/ctb-merger/",
    // });

    window.viewer = viewer = new Cesium.Viewer("cesiumContainer", {
      imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      }),
      // terrainProvider: Cesium.createWorldTerrain(),
      // geocoder: true,
      // homeButton: true,
      // sceneModePicker: true,
      // baseLayerPicker: true,
      // navigationHelpButton: true,
      // animation: true,
      // timeline: true,
      // fullscreenButton: true,
      // vrButton: true,
      // //关闭点选出现的提示框
      // selectionIndicator: false,
      // infoBox: false,
      skyBox: false,
      skyAtmosphere: false,
      //   imageryProvider: mtdt,
      contextOptions: {
        webgl: {
          alpha: true,
        },
      },
      creditContainer: "creditContainer",
      selectionIndicator: false,
      animation: false, //是否显示动画控件
      baseLayerPicker: false, //是否显示图层选择控件
      geocoder: false, //是否显示地名查找控件
      timeline: false, //是否显示时间线控件
      sceneModePicker: true, //是否显示投影方式控件
      navigationHelpButton: false, //是否显示帮助信息控件
      infoBox: false, //是否显示点击要素之后显示的信息
      fullscreenButton: true,
    });
    viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权
    // viewer.terrainProvider = terrainProvider;
    var lat = 42.006;
    var lon = 128.055;
    //取消双击事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    //设置homebutton的位置
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
      lon - 1,
      lat - 1,
      lon + 1,
      lat + 1
    ); //Rectangle(west, south, east, north)
    //设置初始位置
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 300000),
    });
    // var imageryLayers = viewer.imageryLayers;
    imageryLayers = viewer.imageryLayers;
    viewModel = {
      layers: [],
      baseLayers: [],
      upLayer: null,
      downLayer: null,
      selectedLayer: null,
      isSelectableLayer: function (layer) {
        return this.baseLayers.indexOf(layer) >= 0;
      },
      raise: function (layer, index) {
        imageryLayers.raise(layer);
        viewModel.upLayer = layer;
        viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
        updateLayerList();
        window.setTimeout(function () {
          viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
      },
      lower: function (layer, index) {
        imageryLayers.lower(layer);
        viewModel.upLayer =
          viewModel.layers[Math.min(viewModel.layers.length - 1, index + 1)];
        viewModel.downLayer = layer;
        updateLayerList();
        window.setTimeout(function () {
          viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
      },
      canRaise: function (layerIndex) {
        return layerIndex > 0;
      },
      canLower: function (layerIndex) {
        return layerIndex >= 0 && layerIndex < imageryLayers.length - 1;
      },
    };
    const baseLayers = viewModel.baseLayers;

    Cesium.knockout.track(viewModel);
    // var mapLonlat = new TileLonlatsImageryProvider({});
    //   console.log(mapLonlat)

    //   var mapLonlatLayer = imageryLayers.addImageryProvider(mapLonlat); //添加注记图层
    //   imageryLayers.raiseToTop(mapLonlatLayer); //将注记图层置顶

    // let script = document.createElement("script");
    // script.setAttribute(
    //   "src",
    //   "src/components/views/cesium/markGrid/TileLonlatsImageryProvider1.js"
    // );
    // script.setAttribute("type", "text/javascript");
    // script.setAttribute("id", "myScript");
    // // script.type = "text/javascript";
    // // script.src = "src/components/views/cesium/markGrid/TileLonlatsImageryProvider1.js";

    // script.onload = () => {
    //   // js加载成功
    //   console.log(script);
    //   var mapLonlat = new TileLonlatsImageryProvider({});
    //   Cesium.TileCoordinatesImageryProvider();
    //   console.log(mapLonlat);

    //   var mapLonlatLayer = imageryLayers.addImageryProvider(mapLonlat); //添加注记图层
    //   imageryLayers.raiseToTop(mapLonlatLayer); //将注记图层置顶
    // };
    // script.onerror = () => {
    //   // js加载失败
    // };
    // document.head.appendChild(script);
  },
  data() {
    return {
      classifyStatus: false,
      tip_0:
        "加载已经提前生成好的data路径下的default_single.json文件，即动态单体化文件",
      tip_1:
        "绘制楼层区域，左键绘制，右键结束，数据在下表展示。完成后需“顶点采集”",
      tip_2: "左键绘制顶点，右键结束",
      tip_3: "将已经绘制好单体化要素提交到存储中，以备导出",
      tip_4: "将所有已经“确认”提交的数据导出为动态单体化图层，格式为JSON格式",
      tableData: [
        // {
        //   lon: "112.32332",
        //   lat: "34.33232",
        //   height: "20",
        // },
      ],
      results: [],
      vertexHeights: [],
    };
  },
  watch: {},
  methods: {
    initModel() {
      this.addAdditionalLayerOption(
        "Tile Coordinates",
        new Cesium.TileCoordinatesImageryProvider(),
        1.0,
        true
      );

      // var mapLonlat = new TileLonlatsImageryProvider({});
      // var imageryLayers = viewer.imageryLayers;
      // var mapLonlatLayer = imageryLayers.addImageryProvider(mapLonlat); //添加注记图层
      // imageryLayers.raiseToTop(mapLonlatLayer); //将注记图层置顶

      // var mapLonlat = new CustomImageryProvider({});
      // var imageryLayers = viewer.imageryLayers;
      // var mapLonlatLayer = imageryLayers.addImageryProvider(mapLonlat); //添加注记图层
      // imageryLayers.raiseToTop(mapLonlatLayer); //将注记图层置顶

      //   var grid_lay = new Cesium.TileCoordinatesImageryProvider({
      //     tilingScheme: new Cesium.GeographicTilingScheme(),
      //   });
      //   // grid_lay.proxy = undefined;
      //   // grid_lay._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
      //   // grid_lay._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
      //   // grid_lay.maximumLevel = undefined;
      //   // grid_lay.minimumLevel = undefined;
      //   // grid_lay.tileDiscardPolicy = undefined;
      //   // grid_lay._errorEvent = new Cesium.Event();
      //   // grid_lay.ready = true;
      //   // grid_lay._readyPromise = Promise.resolve(true);
      //   // grid_lay.credit = undefined;
      //   // grid_lay.hasAlphaChannel = true;
      //   grid_lay.requestImage = function (x, y, level) {
      //     var canvas = document.createElement("canvas");
      //     canvas.width = 256;
      //     canvas.height = 256;
      //     var context = canvas.getContext("2d");
      //     this._color = 'yellow';
      //     // var cssColor = this._color.toCssColorString();
      //     var cssColor = this._color;
      //     context.strokeStyle = "rgba(192,192,192,0.7)";
      //     context.lineWidth = 1;
      //     context.strokeRect(0, 0, 256, 256);

      //     /*
      // 可以使用GeographicTilingScheme的tileXYToNativeRectangle接口获取对应关系，不需要自己算！
      // */
      //     var interval = 180.0 / Math.pow(2, level);
      //     var lon = (x + 0.5) * interval - 180;
      //     var lat = 90 - (y + 0.5) * interval;
      //     //var label = 'L-' + level + 'X-' + x + 'Y-' + y;
      //     var labelLevel = "";
      //     var labelLon = "";
      //     var labelLat = "";
      //     if (lon > 0) {
      //       if (lat > 0) {
      //         //label = 'L' + level + 'E' + lon + 'N' + lat;
      //         labelLevel = "L" + level;
      //         labelLon = "E" + lon;
      //         labelLat = "N" + lat;
      //       } else {
      //         //label = 'L' + level + 'E' + lon + 'S' + (-lat);
      //         labelLevel = "L" + level;
      //         labelLon = "E" + lon;
      //         labelLat = "S" + -lat;
      //       }
      //     } else {
      //       if (lat > 0) {
      //         //label = 'L' + level + 'W' + (-lon) + 'N' + lat;
      //         labelLevel = "L" + level;
      //         labelLon = "W" + -lon;
      //         labelLat = "N" + lat;
      //       } else {
      //         //label = 'L' + level + 'W' + (-lon) + 'S' + (-lat);
      //         labelLevel = "L" + level;
      //         labelLon = "W" + -lon;
      //         labelLat = "S" + -lat;
      //       }
      //     }
      //     context.textAlign = "center";
      //     context.fillStyle = cssColor;
      //     if (level > 10) {
      //       context.font = "bold 16px Arial";
      //       context.fillText(labelLevel, 124, 100);
      //       context.fillText(labelLon, 124, 124);
      //       context.fillText(labelLat, 124, 148);
      //     } else {
      //       context.font = "bold 25px Arial";
      //       context.fillText(labelLevel, 124, 94);
      //       context.fillText(labelLon, 124, 124);
      //       context.fillText(labelLat, 124, 154);
      //     }
      //     return canvas;

      //     // var label = zxy2TileKey(level, x, y); //label里面放需要显示的文字
      //     // context.font = "bold 6px Arial";
      //     // context.fillStyle = "rgba(255, 255, 255, 0.6)";
      //     // context.textAlign = "center";
      //     // context.fillText(label, 124, 124);
      //     // return canvas;
      //   };
      //   viewer.imageryLayers.addImageryProvider(grid_lay);
      //   var imageryLayers = viewer.imageryLayers;
      //   imageryLayers.raiseToTop(grid_lay); //将注记图层置顶
    },
    async addAdditionalLayerOption(name, imageryProviderPromise, alpha, show) {
      try {
        const imageryProvider = await Promise.resolve(imageryProviderPromise);
        const layer = new Cesium.ImageryLayer(imageryProvider);
        layer.alpha = Cesium.defaultValue(alpha, 0.5);
        layer.show = Cesium.defaultValue(show, true);
        // layer.show = true;
        layer.name = name;
        imageryLayers.add(layer);
        Cesium.knockout.track(layer, ["alpha", "show", "name"]);
        this.updateLayerList();
      } catch (error) {
        console.error(`There was an error while creating ${name}. ${error}`);
      }
    },
    updateLayerList() {
      const numLayers = imageryLayers.length;
      viewModel.layers.splice(0, viewModel.layers.length);
      for (let i = numLayers - 1; i >= 0; --i) {
        viewModel.layers.push(imageryLayers.get(i));
      }
    },
    addGrid() {
      newMap = new Graticules(window.viewer);
      newMap.render();
    },
    removeGrid() {
      if (newMap) {
        newMap.clear();
        // newMap.destroy();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

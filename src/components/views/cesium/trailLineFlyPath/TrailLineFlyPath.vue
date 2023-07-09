<!--
 * @Descripttion: 道路穿梭线
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-30 16:35:08
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <!-- <div id="cesiumContainer"></div> -->
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <button id="reloadFunc" @click="addTrailLine()">切换第三人称</button>
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
import PolylineTrailLinkMaterialProperty from "./trailLine.js";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let viewer;
    let isAdd = false;
    let material = null;
    let center = { lon: 114.302312702, lat: 30.598026044 };
    let cities = [
      { lon: 115.028495718, lat: 30.200814617 },
      { lon: 110.795000473, lat: 32.638540762 },
      { lon: 111.267729446, lat: 30.698151246 },
      { lon: 112.126643144, lat: 32.058588576 },
      { lon: 114.885884938, lat: 30.395401912 },
      { lon: 112.190419415, lat: 31.043949588 },
      { lon: 113.903569642, lat: 30.93205405 },
      { lon: 112.226648859, lat: 30.367904255 },
      { lon: 114.86171677, lat: 30.468634833 },
      { lon: 114.317846048, lat: 29.848946148 },
      { lon: 113.371985426, lat: 31.70498833 },
      { lon: 109.468884533, lat: 30.289012191 },
      { lon: 113.414585069, lat: 30.368350431 },
      { lon: 112.892742589, lat: 30.409306203 },
      { lon: 113.16085371, lat: 30.667483468 },
      { lon: 110.670643354, lat: 31.74854078 },
    ];
    let tileset;
    let clippingPlanes;
    let planeEntities = [];
    let targetY = 0;
    // 定义变量，模型和视角跟随事件
    let entityB2;
    let onTickEvent;
    const parabolaEquation = (options, resultOut) => {
            //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
            var h = options.height && options.height > 5000 ? options.height : 5000;
            var L = Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat) ? Math.abs(options.pt1.lon - options.pt2.lon) : Math.abs(options.pt1.lat - options.pt2.lat);
            var num = options.num && options.num > 50 ? options.num : 50;
            var result = [];
            var dlt = L / num;
            if (Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat)) {//以lon为基准
                var delLat = (options.pt2.lat - options.pt1.lat) / num;
                if (options.pt1.lon - options.pt2.lon > 0) {
                    dlt = -dlt;
                }
                for (var i = 0; i < num; i++) {
                    var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
                    var lon = options.pt1.lon + dlt * i;
                    var lat = options.pt1.lat + delLat * i;
                    result.push([lon, lat, tempH]);
                }
            } else {//以lat为基准
                var delLon = (options.pt2.lon - options.pt1.lon) / num;
                if (options.pt1.lat - options.pt2.lat > 0) {
                    dlt = -dlt;
                }
                for (var i = 0; i < num; i++) {
                    var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
                    var lon = options.pt1.lon + delLon * i;
                    var lat = options.pt1.lat + dlt * i;
                    result.push([lon, lat, tempH]);
                }
            }
            if (resultOut != undefined) {
                resultOut = result;
            }
            return result;
        };
    const addTrailLine = () => {
      const { viewer } = store.state;
      if (!isAdd) {
        if (material != null) {
        } else {
          material = new PolylineTrailLinkMaterialProperty(
            Cesium.Color.ORANGE,
            3000
          );
        }
        for (var j = 0; j < cities.length; j++) {
          var points = parabolaEquation({
            pt1: center,
            pt2: cities[j],
            height: 50000,
            num: 100,
          });
          var pointArr = [];
          for (var i = 0; i < points.length; i++) {
            pointArr.push(points[i][0], points[i][1], points[i][2]);
          }
          viewer.entities.add({
            name: "PolylineTrailLink" + j,
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(pointArr),
              width: 2,
              material: material,
            },
          });
        }

        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 1),
          point: {
            pixelSize: 6,
            color: Cesium.Color.BLUE,
          },
        });
        for (var i = 0; i < cities.length; i++) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              cities[i].lon,
              cities[i].lat,
              1
            ),
            point: {
              pixelSize: 6,
              color: Cesium.Color.RED,
            },
          });
        }

        isAdd = true;
      }
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
      addTrailLine,
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

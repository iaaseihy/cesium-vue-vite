<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-11 13:44:56
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="addParabolaFlowInit()">添加抛物飞线</span>
        <span @click="trackMatte()">添加罩子</span>
        <span @click="addGeojsonArea()">只展示geojson地图</span>
        <span @click="geojsonHighlight()">json高亮</span>
        <span @click="addMask()">添加反选遮罩</span>
        <span @click="addDynamicLine()">添加动态水流线</span>
        <span @click="handleClear()">清空</span>
      </li>
    </ul>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import TrackMatte from "./trackMatte.js";
import json from "../../../../../public/static/geojson/jiangsu.json";
import { parabolaFlowInit } from "./parabolaFlowInit.js";
import PolylineTrailLinkMaterialProperty from "./dynamicLine.js";
import PolylineTrailMaterialProperty from "./lineFlowMaterialProperty.js";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let trackMatteEntity = ref < TrackMatte > null;
    let entities;
    let jsonPrimitive;
    let temp = new Array();
    const trackMatte = () => {
      const { viewer } = store.state;
      console.log(viewer.scene.frameState.creditDisplay.container);
      viewer.scene.debugCommandFilter = (command) => {
        return !(command instanceof Cesium.DebugModelMatrixPrimitive);
      };
      trackMatteEntity = new TrackMatte({
        viewer: viewer,
        id: 1,
        shortwaveRange: 100000.0,
        position: [119.486506, 32.983991],
      });
      //   viewer.camera.flyTo({
      //     destination: Cesium.Cartesian3.fromDegrees(
      //       119.486506,
      //       32.983991,
      //       360000
      //     ),
      //     orientation: {
      //       heading: Cesium.Math.toRadians(0),
      //       pitch: Cesium.Math.toRadians(-90),
      //       roll: 0,
      //     },
      //   });
    };
    const addParabolaFlowInit = () => {
      const { viewer } = store.state;
      // 抛物飞线效果
      parabolaFlowInit(viewer, 2, 3);
      
    };
    const geojsonHighlight = () => {
      const { viewer } = store.state;
      Cesium.GeoJsonDataSource.load("static/geojson/qingdaoRoad.geojson").then(
        function (dataSource) {
          viewer.dataSources.add(dataSource);
          entities = dataSource.entities.values;
          console.log(entities);
          var colorHash = {};
          for (var o = 0; o < entities.length; o++) {
            var r = entities[o];
            r.nameID = o; //给每条线添加一个编号，方便之后对线修改样式
            r.polyline.width = 10; //添加默认样式
            (r.polyline.material = new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.1, //一个数字属性，指定发光强度，占总线宽的百分比。
              //   color: Cesium.Color.ORANGERED.withAlpha(0.9),
              color: Cesium.Color.fromCssColorString("#7ffeff"),
            })),
              10;
          }
          viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
            movement
          ) {
            var pickedFeature = viewer.scene.pick(movement.position);
            if (typeof pickedFeature != "undefined") {
              //鼠标是否点到线上
              var name_id = pickedFeature.id.nameID; //获取每条线的nameID
              Hightlightline(name_id);
            }
          },
          Cesium.ScreenSpaceEventType.LEFT_CLICK);
          // 聚焦
          // viewer.zoomTo(entities);

          
        }
      );
    };
    const Highlight = (nameid, width1, width2, color) => {
      for (var o = 0; o < entities.length; o++) {
        var m = entities[o];
        if (nameid == o) {
          m.polyline.width = width1;
          (m.polyline.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1, //一个数字属性，指定发光强度，占总线宽的百分比。
            // color: Cesium.Color.ORANGERED.withAlpha(0.9),
            color: color,
          })),
            width2;
        }
      }
    };
    const Hightlightline = (nameid) => {
      var exists = temp.indexOf(nameid);
      if (temp && temp.length > 0) {
        temp.forEach((t) => {
          Highlight(t, 10, 10, Cesium.Color.fromCssColorString("#7ffeff"));
          // 清空存放已点击线ID的数组
          temp.splice(0, temp.length);
        });
      }
      if (exists <= -1) {
        Highlight(nameid, 50, 50, Cesium.Color.ORANGERED.withAlpha(0.9));
        temp.push(nameid); // 添加线nameID到数组，
      } //已经是高亮状态了 再次点击修改为原始状态
      else {
        Highlight(nameid, 10, 10, Cesium.Color.fromCssColorString("#7ffeff"));
        temp.splice(exists, 1); //删除对应的nameID
      }
    };
    const addMask = () => {
      const { viewer } = store.state;
      // 反选遮罩
      let positionArray = [];
          const data = json.features;
          for (let i = 0; i < data.length; i++) {
            let entity = data[i];
            if (entity.geometry.type === "MultiPolygon") {
              // 获取区域的经纬度坐标
              for (
                let i = 0;
                i < entity.geometry.coordinates[0][0].length;
                i++
              ) {
                let coor = entity.geometry.coordinates[0][0][i];
                positionArray.push(coor[0]);
                positionArray.push(coor[1]);
              }
            }
            // entity.polyline.width = 1.7;
            // entity.polyline.material = material;
          }
          console.log(positionArray);

          // 遮罩
          let polygonEntity = new Cesium.Entity({
            polygon: {
              hierarchy: {
                // // 添加外部区域为1/4半圆，设置为180会报错
                positions: Cesium.Cartesian3.fromDegreesArray([
                  0, 0, 0, 90, 179, 90, 179, 0,
                ]),
                // 绘制的区域太大容易卡顿
                // positions: Cesium.Cartesian3.fromDegreesArray([
                //   // 100, 0, 100, 89, 150, 89, 150, 0,
                //   115.37890625, 30.50972584293751, 122.28906250000001,
                //   30.50972584293751, 122.28906250000001, 36.35854391749705,
                //   115.37890625, 36.35854391749705, 115.37890625,
                //   30.50972584293751,
                // ]),
                // 中心挖空的“洞”
                holes: [
                  {
                    positions:
                      Cesium.Cartesian3.fromDegreesArray(positionArray),
                  },
                ],
              },
              material: new Cesium.Color(
                15 / 255.0,
                38 / 255.0,
                84 / 255.0,
                0.7
              ),
            },
          });

          // 边界线
          let lineEntity = new Cesium.Entity({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(positionArray),
              width: 5,
              material: new Cesium.Color(
                2 / 255.0,
                197 / 255.0,
                249 / 255.0,
                1
              ),
            },
          });

          // 动态立体墙
          const entity3 = new Cesium.Entity({
            name: "动态立体墙",
            wall: {
              positions: Cesium.Cartesian3.fromDegreesArray(positionArray),
              maximumHeights: Cesium.Cartesian3.fromDegreesArray(
                positionArray
              ).map((res) => {
                return 600;
              }),
              minimumHeights: Cesium.Cartesian3.fromDegreesArray(
                positionArray
              ).map((res) => {
                return -600;
              }),
              material: Cesium.Color.fromCssColorString("#6dcdeb"),
            },
          });
          viewer.entities.add(polygonEntity);
          viewer.entities.add(lineEntity);
          viewer.entities.add(entity3);
          viewer.flyTo(lineEntity);
    };
    const addGeojsonArea = () => {
      let positionArray = [];
      const data = json.features;
      for (let i = 0; i < data.length; i++) {
        let entity = data[i];
        if (entity.geometry.type === "MultiPolygon") {
          // 获取区域的经纬度坐标
          for (let i = 0; i < entity.geometry.coordinates[0][0].length; i++) {
            let coor = entity.geometry.coordinates[0][0][i];
            positionArray.push(coor[0]);
            positionArray.push(coor[1]);
          }
        }
      }
      c_add_geojson_area(positionArray);
    };
    // 只展示geojson地图
    const c_add_geojson_area = (arr) => {
      const { viewer } = store.state;
      //   console.log(geojson.features[0].geometry.coordinates[0]);
      //   let arr = []
      //   geojson.features[0].geometry.coordinates[0][0].forEach(item => {
      //     arr.push(item[0])
      //     arr.push(item[1])
      //   });
      //   console.log(arr);
      var polygonWithHole = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray([
            73.0, 53.0, 73.0, 0.0, 135.0, 0.0, 135.0, 53.0,
          ]),
          [new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(arr))]
        ),
      });
      var geometry = Cesium.PolygonGeometry.createGeometry(polygonWithHole);
      let instances = [];
      instances.push(
        new Cesium.GeometryInstance({
          geometry: geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromCssColorString("#081122")
            ),
          },
        })
      );
      function addRect(instances, left, down, right, up) {
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: Cesium.Rectangle.fromDegrees(left, down, right, up),
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString("#081122")
              ),
            },
          })
        );
      }
      addRect(instances, -180.0, -90.0, 73.0, 90.0);
      addRect(instances, 135.0, -90.0, 180.0, 90.0);
      addRect(instances, 73.0, 53.0, 135.0, 90.0);
      addRect(instances, 73.0, -90.0, 135.0, 0.0);
      jsonPrimitive = new Cesium.Primitive({
          geometryInstances: instances,
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
          }),
          asynchronous: false,
        })
      viewer.scene.primitives.add(
        jsonPrimitive
      );
    };
    const addDynamicLine = () => {
      const { viewer } = store.state;
      let positions = [119.408205, 34.435512, 118.40495, 33.42774];
      let lineEntity = new Cesium.Entity({
        name: "PolylineTrail",
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(positions),
          width: 5,
          material: new PolylineTrailLinkMaterialProperty(
            Cesium.Color.fromCssColorString("#0BFF0D"),
            "../../../../../public/static/texture/color3.png",
            3000
          ),
        },
      });
      viewer.entities.add(lineEntity);
    };
    const handleClear = () => {
      const { viewer } = store.state;
      if (trackMatteEntity) {
        trackMatteEntity.clearEntities();
      }
      //移除json数据
      console.log(viewer.dataSources.length);
      if (viewer.dataSources.length && viewer.dataSources.length > 0) {
        viewer.dataSources._dataSources.forEach((dataSource) => {
          viewer.dataSources.remove(dataSource);
        })
      };
      // viewer.dataSources.removeAll();
      viewer.entities.removeAll();
      viewer.scene.primitives.remove(jsonPrimitive);
      jsonPrimitive = null; //需要手动设置变量 jsonPrimitive 为 null，以避免内存泄漏
    };
    onMounted(() => {
      addParabolaFlowInit();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      trackMatte,
      addGeojsonArea,
      addDynamicLine,
      addMask,
      geojsonHighlight,
      addParabolaFlowInit,
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

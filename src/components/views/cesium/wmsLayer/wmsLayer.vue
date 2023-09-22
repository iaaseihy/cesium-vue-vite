<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-09-08 16:08:10
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="addWMSLayer()">添加wms图层</el-button>
    <el-button @click="handleClear()">清空</el-button>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import { defineComponent, onMounted, onUnmounted, createApp } from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import { getGeojson } from "@/api/api.js";
import Bubble from "./bubble.js";
import DragEntity from "./dragentity.js";
import { CesiumPopup } from "cesium-popup-es6";
import Label from "./index.vue";
import DivLabel from "./divLabel.js";
import InfoTool from "../../../commonJS/InfoTool.js";
const WindowVm = defineComponent(Label);
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let tileset;
    let clippingPlanes;
    let planeEntities = [];
    let targetY = 0;
    let handler;
    let myImageryProvider;
    let movementPos;
    let bubbles;
    let poinEntity = {};
    let poin = [
      {
        id: "12321321",
        name: "北京西路测试点",
        type: "固定枪机",
        state: "在线",
        position: { x: 116.4568, y: 39.8926 },
        text: "X",
      },
      {
        id: "43244324",
        name: "阿乐修理厂门口",
        type: "固定枪机",
        state: "在线",
        position: { x: 116.4568, y: 39.8944 },
        text: "+",
      },
      {
        id: "43764324",
        name: "裕华路加油站",
        type: "固定枪机",
        state: "在线",
        position: { x: 116.4566, y: 39.8923 },
        text: "?",
      },
      {
        id: "437543345",
        name: "康佳大药房",
        type: "固定枪机",
        state: "在线",
        position: { x: 116.4513, y: 39.8923 },
        text: "!",
      },
    ];
    let vmInstance;
    let pickEntity;
    let state;
    let divLabel;
    const onMove = (_state) => {
      state = _state;
    };
    const action = {
      remove: (popup) => {
        console.log(popup, "被移除了");
      },
      onChange: (popup) => {
        console.log(popup, "移动完成");
      },
      editAttr: (popup) => {
        console.log(popup, "需要编辑属性！");
        popup.setContent("我的内容被改变了！");
      },
    };
    let fullSizenum = "fullSize";
    // 鼠标点击WMS地图服务的要素时的回调函数
    let cb = function (result) {
      const { viewer } = store.state;
      // 获取要素信息
      console.log(result);
      // layerInfo = result.features;
      // if (result.features && result.features.length > 0) {
      //   //这里就得到了查询结果
      //   renderPopup(result.features, movementPos);
      // }
      let drag = new DragEntity({
        viewer: viewer,
      });
      // this.poin = [{id:234,position:[122.8,39.9],text:"L"},{id:432,position:[122,39],text:"C"}]
      result.features.forEach((item) => {
        let entity = drag.addEntity(item);
        poinEntity[item.id] = entity;
        entity.show = false;
        bubble(item.id);
      });
      // bubble("dayanta.1")

      // // 获取div:nth-child(3)元素  关闭方法四生成的弹窗
      // let divElement = document.getElementsByClassName(
      //   "helsing-three-plugins-infotool"
      // );
      // if (divElement && divElement.length > 0) {
      //   let div3 = divElement[0].children[2];
      //   if (div3) {
      //     div3.onclick = function () {
      //       console.log("鼠标点击了div:nth-child(3)");
      //       if (pickEntity) {
      //         pickEntity.remove();
      //       }
      //       // handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      //     };
      //   }
      // }
    };
    const bubble = (id) => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测
      if (bubbles) {
        bubbles.windowClose();
      }
      console.log(poinEntity[id]);

      // 方法一
      bubbles = new Bubble(
        Object.assign(poinEntity[id], {
          viewer: viewer,
        })
      );

      // 方法二
      let val = Object.assign(poinEntity[id], {
        viewer: viewer,
      });
      console.log(val);
      let title = val.monitoItems.data.geometry_name;
      let state = val.monitoItems.data.properties.miaoshu;
      let valId = val.id;
      const app = createApp(WindowVm, {
        title,
        state,
        valId,
      });
      vmInstance = app.mount(document.createElement("div"));
      vmInstance.closeEvent = (e) => {
        windowClose();
        // if (this.createEntity) {
        //   this.viewer.entities.remove(this.createEntity)
        // }
      };
      // const html3 = vmInstance.$el;
      let pos = poinEntity[id].position._value;
      console.log(pos);
      const cartesian33 = Cesium.Cartesian3.fromDegrees(
        108.95908736,
        34.22015112,
        15.8186244347767
      );
      // const cartesian33 = pos;
      const html3 = `<div class="title">飞机模型</div>
       <div class="content">我在飞机模型上</div>`;
      //  bubbles = new CesiumPopup(viewer, {
      //      position: cartesian33, html: html3, className: "earth-popup-imgbg-blue", popPosition: "leftbottom"
      //  }, onMove)

      // 方法三
      addDivLabel(val, title, state, valId);

      // 方法四
      pickEntity = new InfoTool(viewer);
      let pickPos = poinEntity[id].position._value;
      let options = {
        pickPos,
        title,
      };
      pickEntity.add(pickPos);
    };
    const leftDownAction = () => {
      const { viewer } = store.state;
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      let id;
      handler.setInputAction(function (movement) {
        let pick = viewer.scene.pick(movement.position);
        if (Cesium.defined(pick) && pick.id.id) {
          // _this.leftDownFlag = true;
          id = pick.id.id;
          bubble(id);
        } else {
          // console.log(_this.bubbles)
          if (bubbles) {
            bubbles.windowClose();
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    const addDivLabel = (valAll, title, state, valId) => {
      const { viewer } = store.state;
      let val = {
        viewer: viewer,
        position: [108.95908736, 34.22015112],
        height: 15,
        valAll: valAll,
        title: title,
        state: state,
        id: valId,
      };
      divLabel = new DivLabel(val);
    };
    //关闭
    const windowClose = () => {
      const { viewer } = store.state;
      //  viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
      //  this.viewer.scene.postRender.removeEventListener(this.updateRender, this); //移除事件监听
      if (vmInstance) {
        vmInstance.$el.remove();
        vmInstance = null;
      }
      if (pickEntity) {
        pickEntity.remove();
      }
    };
    //加载点
    const dragEntity = () => {
      const { viewer } = store.state;
      let drag = new DragEntity({
        viewer: viewer,
      });
      // this.poin = [{id:234,position:[122.8,39.9],text:"L"},{id:432,position:[122,39],text:"C"}]
      poin.forEach((item) => {
        let entity = drag.addEntity(item);
        poinEntity[item.id] = entity;
      });
    };
    // 添加wms图层
    const addWMSLayer = () => {
      console.log(store);
      const { viewer, imageryProvider } = store.state;
      // viewer.scene.globe.depthTestAgainstTerrain = true; //默认为false
      viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({}); // 移除地形
      let gfif = new Cesium.GetFeatureInfoFormat(
        "json",
        "application/json",
        cb
      );
      let provider = new Cesium.WebMapServiceImageryProvider({
        // url : 'http://localhost:8085/geoserver/test/wms',
        url: "http://localhost:8070/geoserver/test/wms",
        layers: "test:dayanta",
        parameters: {
          transparent: true,
          format: "image/png",
        },
        getFeatureInfoFormats: [gfif],
      });
      viewer.imageryLayers.addImageryProvider(provider);
      console.log("imageryProvider: ", imageryProvider);
      myImageryProvider = imageryProvider;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          108.9597405,
          34.21955326,
          1800
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });
      // search();
      // leftDownAction();
    };
    const search = () => {
      const { viewer } = store.state;
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (movement) {
        // const ray = viewer.camera.getPickRay(movement.position);
        // const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        // if (cartesian) {
        //   var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        //   if (cartographic) {
        //     var xy = new Cesium.Cartesian2();
        //     var alti = viewer.camera.positionCartographic.height;
        //     var level = getLevel(alti);
        //     if (myImageryProvider.ready) {
        //       xy = myImageryProvider.tilingScheme.positionToTileXY(
        //         cartographic,
        //         level,
        //         xy
        //       );
        //       var promise = myImageryProvider.pickFeatures(
        //         xy.x,
        //         xy.y,
        //         level,
        //         cartographic.longitude,
        //         cartographic.latitude
        //       );
        //       movementPos = movement.position;
        //       console.log(movementPos);
        //       // Promise.resolve(promise).then(function (data) {
        //       //   console.log(data);
        //       //   if (layerInfo && layerInfo.length > 0) {
        //       //     //这里就得到了查询结果
        //       //     renderPopup(layerInfo, movement.position);
        //       //   }
        //       // });
        //     }
        //   }
        // }

        const pickRay = viewer.camera.getPickRay(movement.position);
        const featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(
          pickRay,
          viewer.scene
        );
        if (!Cesium.defined(featuresPromise)) {
          console.log("No features picked.");
        } else {
          Promise.resolve(featuresPromise).then(function (features) {
            // This function is called asynchronously when the list if picked features is available.
            console.log("Number of features: " + features.length);
            if (features.length > 0) {
              console.log("First feature name: " + features[0].name);
            }
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    const loadTileset = (url) => {
      const { viewer } = store.state;
      clippingPlanes = new Cesium.ClippingPlaneCollection({
        planes: [
          new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0),
        ],
        // edgeWidth : viewModel.edgeStylingEnabled ? 1.0 : 0.0
        edgeWidth: 0.0,
      });

      tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: url,
          clippingPlanes: clippingPlanes,
        })
      );

      tileset.debugShowBoundingVolume = true;
      return tileset.readyPromise
        .then(function () {
          var boundingSphere = tileset.boundingSphere;
          var radius = boundingSphere.radius;

          viewer.zoomTo(
            tileset,
            new Cesium.HeadingPitchRange(0.5, -0.2, radius * 4.0)
          );

          for (var i = 0; i < clippingPlanes.length; ++i) {
            var plane = clippingPlanes.get(i);
            var planeEntity = viewer.entities.add({
              position: boundingSphere.center,
              plane: {
                dimensions: new Cesium.Cartesian2(radius * 1.0, radius * 1.0),
                material: Cesium.Color.RED.withAlpha(0.1),
                plane: new Cesium.CallbackProperty(
                  createPlaneUpdateFunction(plane),
                  false
                ),
                outline: true,
                outlineColor: Cesium.Color.WHITE.withAlpha(1.0),
              },
            });

            planeEntities.push(planeEntity);
          }
          return tileset;
        })
        .catch(function (error) {
          console.log(error);
        });
    };

    const handleClear = () => {
      const { viewer } = store.state;
      if (bubbles) {
        bubbles.windowClose();
      }
      windowClose();
      // if (divLabel) {
      //   divLabel.windowClose();
      // }
    };
    onMounted(() => {
      // loadTileset(
      //   "http://localhost:6060/Data/Source/3DTiles/208204GB02181/ST/0001/tileset.json"
      // );
      // dragEntity();
      // leftDownAction();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      loadTileset,
      addWMSLayer,
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

/*--------------------------气泡弹窗Start---------------------------*/

.trackPopUp {
  display: block;
  color: rgb(255, 255, 255);
}

.leaflet-popup {
  position: absolute;
  z-index: 100;
}

.leaflet-popup-close-button {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 4px 0 0;
  text-align: center;
  font: 25px/25px Tahoma, Verdana, sans-serif;
  color: rgb(255, 255, 255);
  text-decoration: none;
  font-weight: bold;
  background: transparent;
}

.leaflet-popup-content-wrapper {
  max-height: 500px;
  overflow-y: auto;
  min-height: 180px;
  width: 300px;
  padding: 1px;
  text-align: left;
  border-radius: 5px;
  background-color: #002445;
}

.leaflet-popup-content {
  margin: 5px 20px;
  line-height: 1.4;
}

.leaf-popup-page {
  position: absolute;
  right: 0;
  bottom: 0;
}

.leaf-popup-page ul li {
  margin: 3px;
  width: 20px;
  height: 20px;
  text-align: center;
  border: 1px solid #fff;
  text-decoration: none;
  list-style: none;
  /* float: left;![在这里插入图片描述](https://img-blog.csdnimg.cn/20200111162952596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2hyeTEyNDM5MTY4NDQ=,size_16,color_FFFFFF,t_70) */
}

.leaf-popup-page ul li:hover {
  color: #fff000;
  border: 1px solid #fff000;
  cursor: pointer;
}

.leaflet-popup-content div {
  text-align: center;
  font-size: 18px;
}

.leaflet-popup-content table {
  margin-top: 15px;
}

.leaflet-popup-content table tr {
  height: 25px;
}

/*--------------------------气泡弹窗END---------------------------*/
</style>

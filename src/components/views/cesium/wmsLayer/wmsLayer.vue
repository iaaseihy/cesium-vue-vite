<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-14 16:59:51
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="addWMSLayer()">添加wms图层</span>
        <span @click="handleClear()">清空</span>
      </li>
    </ul>
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
    };
    const bubble = (id) => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测
      if (bubbles) {
        bubbles.windowClose();
      }
      console.log(poinEntity[id]);
      viewer.scene.globe.depthTestAgainstTerrain = true; //（开启）

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
              valId
            });
            vmInstance = app.mount(document.createElement('div'));
            vmInstance.closeEvent = (e) => {
              windowClose();
              // if (this.createEntity) {
              //   this.viewer.entities.remove(this.createEntity)
              // }
            };
            // const html3 = vmInstance.$el;
            let pos = poinEntity[id].position._value;
            console.log(pos);
            const cartesian33 = Cesium.Cartesian3.fromDegrees(108.95908736, 34.22015112, 15.8186244347767)
            // const cartesian33 = pos;
      const html3 = `<div class="title">飞机模型</div>
       <div class="content">我在飞机模型上</div>`
      //  bubbles = new CesiumPopup(viewer, {
      //      position: cartesian33, html: html3, className: "earth-popup-imgbg-blue", popPosition: "leftbottom"
      //  }, onMove)

      // 方法三
      addDivLabel(val, title, state, valId);
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
    const getLevel = (height) => {
      if (height > 48000000) {
        return 0;
      } else if (height > 24000000) {
        return 1;
      } else if (height > 12000000) {
        return 2;
      } else if (height > 6000000) {
        return 3;
      } else if (height > 3000000) {
        return 4;
      } else if (height > 1500000) {
        return 5;
      } else if (height > 750000) {
        return 6;
      } else if (height > 375000) {
        return 7;
      } else if (height > 187500) {
        return 8;
      } else if (height > 93750) {
        return 9;
      } else if (height > 46875) {
        return 10;
      } else if (height > 23437.5) {
        return 11;
      } else if (height > 11718.75) {
        return 12;
      } else if (height > 5859.38) {
        return 13;
      } else if (height > 2929.69) {
        return 14;
      } else if (height > 1464.84) {
        return 15;
      } else if (height > 732.42) {
        return 16;
      } else if (height > 366.21) {
        return 17;
      } else {
        return 18;
      }
    };
    const renderPopup = (layerInfo, position) => {
      const { viewer } = store.state;
      let contentArr = [];
      let page = "";
      for (let i = 0; i < layerInfo.length; i++) {
        // 处理查询到的结果
        const data = layerInfo[i].properties;
        const content = `<div>${data.Id}</div><table><tbody>
          <tr><td>FID:</th><td>${data.maxheight}</td></tr>
          <tr><td>名称:</th><td>${data.miaoshu}</td></tr>
          <tr><td>状态:</th><td>${data.minheight}</td></tr>
          <tr><td>地址:</th><td>${data.name}</td></tr>
          </tbody></table>`;
        contentArr.push(content);
        // 生成页码
        if (i == 0) {
          page =
            page +
            `<li style="color: #fff000; border: 1px solid #fff000;" id=${i}>${
              i + 1
            }</li>`;
        } else {
          page = page + `<li id=${i}>${i + 1}</li>`;
        }
      }
      let pageContent = `<ul id="page">${page}</ul>`;
      infoPopuEvent(handler, position, contentArr, pageContent);
    };
    const infoPopuEvent = (handler, position, contentArr, pageContent) => {
      const infoDiv = `<div id="trackPopUp" class="trackPopUp">
                      <div id="trackPopUpContent" class="leaflet-popup" style="top:5px;left:0;">
                        <a class="leaflet-popup-close-button" href="#">×</a>
                        <div class="leaflet-popup-content-wrapper">
                          <div id="trackPopUpLink" class="leaflet-popup-content">                        
                          </div>
                          <div class="leaf-popup-page">${pageContent}</div>
                        </div>
                      </div>
                  </div>`;
      // if ($("#trackPopUp").length > 0) {
      //   $("#trackPopUp").remove();
      // }
      const trackPopUp = document.getElementById("trackPopUp");
      if (trackPopUp && trackPopUp.length > 0) {
        trackPopUp.remove();
      }
      this.$refs.cesiumContainer.innerHTML = infoDiv;
      // $("#cesiumContainer").append(infoDiv);
      // $("#trackPopUp").show();
      trackPopUp.show();
      //页码点击事件
      $("#page li").click((e) => {
        const index = parseInt(e.currentTarget.id);
        const liChild = $("#page").children();
        $(liChild[index]).css({
          color: "#fff000",
          border: "1px solid #fff000",
        });
        $(liChild[index])
          .siblings()
          .css({ color: "#fff", border: "1px solid #fff" });
        $("#trackPopUpLink").empty();
        $("#trackPopUpLink").append(contentArr[index]);
      });
      var obj = { position: position, content: contentArr[0] };
      infoWindow(obj);
      function infoWindow(obj) {
        $(".cesium-selection-wrapper").show();
        $("#trackPopUpLink").empty();
        $("#trackPopUpLink").append(obj.content);
        function positionPopUp(c) {
          var x = c.x - $("#trackPopUpContent").width() / 2;
          var y = c.y - $("#trackPopUpContent").height();
          $("#trackPopUpContent").css(
            "transform",
            "translate3d(" + x + "px, " + y + "px, 0)"
          );
        }
        var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
        $("#trackPopUp").show();
        positionPopUp(c);
        $(".leaflet-popup-close-button").click(function () {
          $("#trackPopUp").hide();
          $("#trackPopUpLink").empty();
          $(".cesium-selection-wrapper").hide();
          return false;
        });
        //绑定地图移动
        handler.setInputAction(function (movement) {
          $("#trackPopUp").hide();
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        //绑定地图缩放
        handler.setInputAction(function (movement) {
          $("#trackPopUp").hide();
        }, Cesium.ScreenSpaceEventType.WHEEL);
        //绑定滚轮点击事件
        handler.setInputAction(function (movement) {
          $("#trackPopUp").hide();
        }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
      }
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

<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-19 16:38:08
-->
<template>
  <!-- <cesium-container ref="cesiumContainer"> </cesium-container> -->
  <div id="cesiumContainer" class="fullSize"></div>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <div>
          <div class="model-Split">
            <div class="modelfile-th">
              <!--<i class="i"></i>-->
              <span class="tsls">房屋拆解</span>
              <span class="xx">
                <i class="layui-icon">&#x1006;</i>
              </span>
            </div>
            <div class="modelfile-td">
              <div class="infoview">
                <div class="floorWhole">
                  整体控制：
                  <button class="btn btn-primary" @click="opeAll(4, 3000, 100)">
                    展开
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="unionAll(4, 3000, 100)"
                  >
                    合并
                  </button>
                  <button class="btn btn-primary" @click="resetAll">
                    还原
                  </button>
                </div>
                <div class="floorSingle">
                  显示指定：
                  <button
                    class="btn btn-primary"
                    @click="openFloorModel(120, 1, 1000, 100)"
                  >
                    一楼
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="openFloorModel(120, 2, 1000, 100)"
                  >
                    二楼
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="openFloorModel(120, 3, 1000, 100)"
                  >
                    三楼
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="openFloorModel(120, 4, 1000, 100)"
                  >
                    四楼
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="openFloorModel(120, 5, 1000, 100)"
                  >
                    五楼
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="openFloorModel(120, 6, 1000, 100)"
                  >
                    六楼
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="openFloorModel(120, 7, 1000, 100)"
                  >
                    顶楼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
      
      <script>
import * as Cesium from "cesium";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let dynamicCircle = ref();
    let circleDiffusion = ref();
    const floorCount = 6;
    let models = [];
    let viewer;
    let model = null;
    let timers = [];
    const floorScale = 1;
    const floorHeight = 3;
    const point = {
      lng: 115.91455928461914,
      lat: 28.665192693562243,
      height: 0,
    };
    //   let models = ref();
    //   let model = ref();
    //   let timers = ref<Array>([]);
    //   const floorScale = ref(1);
    //   const floorHeight = ref(3);
    //   const point = ref({
    //         lng: 115.91455928461914,
    //         lat: 28.665192693562243,
    //         height: 0
    //     });
    // const { viewer } = store.state;

    const initModel = () => {
      // let model = null;
      //     let floorCount = floorCount; // 房屋总楼层数，不含楼顶
      //     let floorScale = floorScale; // 房屋缩放比例，默认一般1
      //     let floorHeight = floorHeight; // 每层的高度
      //     let point = point;
      // const { viewer } = store.state;
      for (let i = 0; i <= floorCount; i++) {
        if (i < floorCount) {
          // 底楼
          let height = point.height + i * floorHeight * floorScale;
          model = addModePrimitive({
            position: [point.lng, point.lat, height],
            url: 'floor.glb',
            // url: '@public/static/glb/floor.glb',
            // url: "http://data.mars3d.cn/gltf/mars/floor/floor.glb",
            // url: 'http://localhost:6060/Data/glb/floor.glb',
            // url: 'http://localhost:6060/Data/Source/3DTiles/gotham-apartment-building-1/source/Building.glb',
            // url: "//data.mars3d.cn/3dtiles/bim-daxue/tileset.json",
            name: "fw",
            scale: floorScale,
          });
          model.option = {
            oriHeight: height,
            scale: floorScale,
            currentHeight: height,
          };
          models.push(model);
          // viewer.zoomTo(model);
        } else {
          // 顶楼
          let height = point.height + i * floorHeight * floorScale;
          model = addModePrimitive({
            position: [point.lng, point.lat, height],
            url: 'top.glb',
            // url: '@public/static/glb/top.glb',
            // url: "http://data.mars3d.cn/gltf/mars/floor/top.glb",
            // url: 'http://localhost:6060/Data/glb/top.glb',
            // url: './widgets/ModelSplit/data/top.glb',
            // url: 'http://localhost:6060/Data/Source/3DTiles/gotham-apartment-building-1/source/Building.glb',
            // url: "//data.mars3d.cn/3dtiles/bim-daxue/tileset.json",
            name: "fw",
            scale: floorScale,
          });
          model.option = {
            oriHeight: height,
            scale: floorScale,
            currentHeight: height,
          };
          models.push(model);
          // viewer.zoomTo(model);
        }
      }
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          115.91326536913103,
          28.66495725572756,
          55.24826616710503
        ),
        orientation: {
          heading: Cesium.Math.toRadians(78.06653423571397),
          pitch: Cesium.Math.toRadians(-15.156766587402164),
          roll: 0,
        },
      });
    };
    const clearAll = () => {
      const { viewer } = store.state;
      if (models.length > 0) {
        models.forEach((m) => {
          viewer.scene.primitives.remove(m);
        });
      }
      document.getElementById("jimu-widget-ModelSplit").hide();
      // $('.jimu-widget-ModelSplit').hide()
    };
    // 3d模型
    const addModePrimitive = (option) => {
      // 模型的位置
      const position = Cesium.Cartesian3.fromDegrees(
        option.position[0],
        option.position[1],
        option.position[2]
      );

      // 创建模型矩阵
      const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);

      // 加载模型
      const model = Cesium.Model.fromGltf({
        url: option.url,
        modelMatrix: modelMatrix,
        scale: 1.0,
        allowPicking: true,
      });

      // 将模型添加到场景中
      viewer.scene.primitives.add(model);
      return model;
    };
    const addModePrimitive1 = (option) => {
      // const { viewer } = store.state;
      var origin = Cesium.Cartesian3.fromDegrees(
        option.position[0],
        option.position[1],
        option.position[2]
      );
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      var modelPrimitive = null;
      modelPrimitive = viewer.scene.primitives.add(
        Cesium.Model.fromGltf({
          url: option.url,
          modelMatrix: modelMatrix,
          show: true, // default
          scale: option.scale || 1, // double size
          // minimumPixelSize : 128,          // never smaller than 128 pixels
          maximumScale: 20000, // never larger than 20000 * model size (overrides minimumPixelSize)
          allowPicking: true,
          // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          scene: viewer.scene,
        })
      );
      modelPrimitive.name = option.name;
      modelPrimitive.type = "model";
      if (option.rotationz) {
        var mz = Cesium.Matrix3.fromRotationZ(
          Cesium.Math.toRadians(option.rotationz)
        );
        var rotationz = Cesium.Matrix4.fromRotationTranslation(mz);
        //旋转、平移矩阵相乘
        Cesium.Matrix4.multiply(modelMatrix, rotationz, modelMatrix);
        modelPrimitive.modelMatrix = modelMatrix;
      }

      modelPrimitive.readyPromise.then(function (model) {
        // Play all animations when the model is ready to render
        model.activeAnimations.addAll({
          speedup: 0.5,
          loop: Cesium.ModelAnimationLoop.REPEAT,
        });
      });
      return modelPrimitive;
    };
    const opeAll = (height, time = 4000, interval = 100) => {
      resetAll();
      // let point = point; //楼栋位置
      clearFloorTimers();
      for (let i = 0; i < models.length; i++) {
        let model = models[i];
        let changeRate =
          Number(i * height * model.option.scale) * (interval / time);
        // let alt = i * height * model.option.scale + model.option.oriHeight;
        if (i != 0) {
          // model.position = new Cesium.CallbackProperty(function () {
          //     let height = model.option.oriHeight + (i * height * model.option.scale) / time
          //     if (height < alt) {
          //         return Cesium.Cartesian3(model.position[0], model.position[1], height)
          //     } else {
          //         return Cesium.Cartesian3(model.position[0], model.position[1], alt)
          //     }
          // }, false)
          let count = 1;
          let timer = setInterval(function () {
            let add = model.option.oriHeight + changeRate * count++;
            var origin = Cesium.Cartesian3.fromDegrees(
              point.lng,
              point.lat,
              add
            );
            var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
            model.modelMatrix = modelMatrix;
            if (count >= time / interval) {
              model.option.currentHeight = add;
              clearInterval(timer);
              timer = null;
            }
            // console.log(count)
          }, interval);
          timers.push(timer);
        }
      }
    };
    const unionAll = (height, time = 4000, interval = 100) => {
      // let point = point; //楼栋位置
      clearFloorTimers();
      for (let i = 0; i < models.length; i++) {
        let model = models[i];
        // 如果是初始位置，代表已经为合并状态。
        if (model.option.currentHeight == model.option.oriHeight) {
          continue;
        }
        let currentHeight =
          model.option.oriHeight + i * height * model.option.scale;
        let changeRate =
          Number(i * height * model.option.scale) * (interval / time);
        model.show = true;
        let count = 1;
        let timer = setInterval(function () {
          let add = currentHeight - changeRate * count++;
          var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
          var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
          model.modelMatrix = modelMatrix;
          if (count >= time / interval) {
            var origin = Cesium.Cartesian3.fromDegrees(
              point.lng,
              point.lat,
              model.option.oriHeight
            );
            var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
            model.modelMatrix = modelMatrix;
            model.option.currentHeight = model.option.oriHeight;
            clearInterval(timer);
          }
        }, interval);
        timers.push(timer);
      }
    };
    const resetAll = () => {
      clearFloorTimers();
      // let point = point; //楼栋位置
      for (let i = 0; i < models.length; i++) {
        let model = models[i];
        var origin = Cesium.Cartesian3.fromDegrees(
          point.lng,
          point.lat,
          model.option.oriHeight
        );
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        model.option.currentHeight = model.option.oriHeight;
        model.modelMatrix = modelMatrix;
        model.show = true;
      }
    };
    /**
     * 显示指定楼层
     *
     * @param {Number} maxHeight 指定从顶部落下的高度
     * @param {Number} floorNum 指定显示的楼层，第1层开始
     * @param {Number} [time=1000] 楼层下落需要时间,单位:毫秒
     * @param {Number} [interval=100] 楼层下落触发间隔时间,单位:毫秒
     * @return {void}  无
     */
    const openFloorModel = (
      maxHeight = 120,
      floorNum,
      time = 1000,
      interval = 100
    ) => {
      clearFloorTimers();
      floorNum--;
      // let point = point; //楼栋位置
      for (let i = floorNum; i < models.length; i++) {
        let model = models[i];
        var origin = Cesium.Cartesian3.fromDegrees(
          point.lng,
          point.lat,
          model.option.oriHeight + maxHeight
        );
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
        model.modelMatrix = modelMatrix;
        model.show = false;
        model.option.currentHeight = model.option.oriHeight + maxHeight;
      }
      for (let j = 0; j <= floorNum; j++) {
        let model = models[j];
        // 如果是初始位置，代表已经为合并状态。
        model.show = true;
        if (
          model.option.currentHeight == model.option.oriHeight &&
          j != floorNum
        ) {
          continue;
        }

        let currentHeight = model.option.oriHeight + maxHeight;
        let changeRate = maxHeight * (interval / time);
        let count = 1;
        let timer = setInterval(function () {
          let add = currentHeight - changeRate * count++;
          var origin = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, add);
          var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
          model.modelMatrix = modelMatrix;
          if (count >= time / interval) {
            var origin = Cesium.Cartesian3.fromDegrees(
              point.lng,
              point.lat,
              model.option.oriHeight
            );
            var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
            model.modelMatrix = modelMatrix;
            model.option.currentHeight = model.option.oriHeight;
            clearInterval(timer);
          }
        }, interval);
        timers.push(timer);
      }
    };
    const clearFloorTimers = () => {
      if (timers.length > 0) {
        timers.forEach((t) => {
          if (t) {
            clearInterval(t);
          }
        });
      }
      timers = [];
    };
    // 添加红色圆形扩散(视角变化的时候圆形扩散有位置跟着移动的问题)
    const primitveClassification = () => {
      // 先添加primitve模型
      const { viewer } = store.state;
      let scene = viewer.scene;

      let tileset = new Cesium.Cesium3DTileset({
        url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
        name: "建筑物",
        maximumScreenSpaceError: 1,
      });
      tileset.readyPromise
        .then(function (tileset) {
          var cartographic = Cesium.Cartographic.fromCartesian(
            tileset.boundingSphere.center
          );
          var surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            cartographic.height
          );
          var offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            options.offset.z
          );
          var translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3()
          );
          tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        })
        .otherwise(function (e) {
          throw e;
        });
      viewer.scene.primitives.add(tileset);
      viewer.zoomTo(tileset);
      var longitude = 108.959511;
      var latitude = 34.219658;
      var height = 61.95;

      var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

      var heading = Math.random();
      var pitch = Math.random();
      var roll = Math.random();
      var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        position,
        new Cesium.HeadingPitchRoll(heading, pitch, roll)
      );

      var treeHighlight3 = scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.EllipsoidGeometry({
              radii: new Cesium.Cartesian3(2.45, 2.45, 3.0),
            }),
            modelMatrix: modelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString("#004FFF").withAlpha(0.5)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
            id: "volume 3",
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
      );
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          117.90365282568267,
          40.16773126252592,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
      // 加入鼠标移入事件设定样式
      var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      handler.setInputAction(function (movement) {
        var pickedObject = scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          if (pickedObject.id === currentObjectId) {
            return;
          }

          if (Cesium.defined(currentObjectId)) {
            attributes =
              currentPrimitive.getGeometryInstanceAttributes(currentObjectId);
            attributes.color = currentColor;
            attributes.show = currentShow;
            currentObjectId = undefined;
            currentPrimitive = undefined;
            currentColor = undefined;
            currentShow = undefined;
          }
        }

        if (
          Cesium.defined(pickedObject) &&
          Cesium.defined(pickedObject.primitive) &&
          Cesium.defined(pickedObject.id) &&
          Cesium.defined(pickedObject.primitive.getGeometryInstanceAttributes)
        ) {
          currentObjectId = pickedObject.id;
          currentPrimitive = pickedObject.primitive;
          attributes =
            currentPrimitive.getGeometryInstanceAttributes(currentObjectId);
          currentColor = attributes.color;
          currentShow = attributes.show;
          if (!scene.invertClassification) {
            attributes.color = [255, 0, 255, 128];
          }
          attributes.show = [1];
        } else if (Cesium.defined(currentObjectId)) {
          attributes =
            currentPrimitive.getGeometryInstanceAttributes(currentObjectId);
          attributes.color = currentColor;
          attributes.show = currentShow;
          currentObjectId = undefined;
          currentPrimitive = undefined;
          currentColor = undefined;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    // 加载楼层Primitive
    const addLcPrimitive = (center, dimensions, name) => {
      var position = new Cesium.Cartesian3.fromDegrees(
        center[0],
        center[1],
        center[2]
      );
      (s = Cesium.Transforms.eastNorthUpToFixedFrame(position)),
        (rotation = Cesium.Matrix3.fromHeadingPitchRoll(
          new Cesium.HeadingPitchRoll(0, 0, 0)
        )),
        (u = Cesium.Matrix4.fromRotationTranslation(
          rotation,
          new Cesium.Cartesian3(0, 0, 0)
        ));
      Cesium.Matrix4.multiply(s, u, s);
      lcCollection.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: Cesium.BoxGeometry.fromDimensions({
              vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
              dimensions: new Cesium.Cartesian3(
                dimensions[0],
                dimensions[1],
                dimensions[2]
              ),
            }),
            modelMatrix: s,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                new Cesium.Color(1, 1, 1, 1e-4)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
            id: name,
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        })
      );
    };
    // 设置相机是否进入地下
    const limitCameraToGround = (isOpen) => {
      //  if (limitCameraHandler) {
      //             limitCameraHandler();
      //             limitCameraHandler = null;
      //         }
      let limitCameraHandler = viewer.camera.changed.addEventListener(
        function () {
          if (
            viewer.camera._suspendTerrainAdjustment &&
            viewer.scene.mode === Cesium.SceneMode.SCENE3D
          ) {
            viewer.camera._suspendTerrainAdjustment = !isOpen;
            viewer.camera._adjustHeightForTerrain();
          }
        }
      );
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      let key =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDhhOThhNy0zMzUzLTRiZDktYWM3Ni00NGI5MGY2N2UwZDUiLCJpZCI6MjQzMjYsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODUwMzUwNDh9.DYuDF_RPKe5_8w849_y-sutM68LM51O9o3bTt_3rF1w";
      Cesium.Ion.defaultAccessToken = key;
      window.viewer = viewer = new Cesium.Viewer("cesiumContainer", {
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
        }),
        terrainProvider: Cesium.createWorldTerrain(),
        geocoder: true,
        homeButton: true,
        sceneModePicker: true,
        baseLayerPicker: true,
        navigationHelpButton: true,
        animation: true,
        timeline: true,
        fullscreenButton: true,
        vrButton: true,
        //关闭点选出现的提示框
        selectionIndicator: false,
        infoBox: false,
      });
      viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权
      initModel();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      primitveClassification,
      addLcPrimitive,
      limitCameraToGround,
      initModel,
      clearAll,
      addModePrimitive,
      opeAll,
      openFloorModel,
      unionAll,
      resetAll,
      clearFloorTimers,
      floorCount,
      floorScale,
      models,
      timers,
      floorHeight,
      point,
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
      
<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-19 18:08:16
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="primitveClassification()">单体化</span>
        <span @click="handleClear()">清空</span>
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
    // const { viewer } = store.state;
    let currentObjectId;
let currentPrimitive;
let currentColor;
let currentShow;
let attributes;
    // 添加红色圆形扩散(视角变化的时候圆形扩散有位置跟着移动的问题)
    const primitveClassification = () => {
      // 先添加primitve模型
      const { viewer } = store.state;
      let scene = viewer.scene;
      
      let options = {
        offset: {
                    z: 60.0
                },
      }
      let tileset = new Cesium.Cesium3DTileset({
        // url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
        url: 'http://localhost:6060/Data/Source/3DTiles/208204GB02181/CQ/0001/tileset.json',
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
        .catch(function (e) {
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
    //   viewer.camera.flyTo({
    //     destination: Cesium.Cartesian3.fromDegrees(
    //       117.90365282568267,
    //       40.16773126252592,
    //       20000
    //     ),
    //     orientation: {
    //       heading: Cesium.Math.toRadians(0.0),
    //       pitch: Cesium.Math.toRadians(-90.0),
    //       roll: 0.0,
    //     },
    //   });
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
            attributes.color = [255, 0, 0, 255];
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
      // initViewer();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      primitveClassification,
      addLcPrimitive,
      limitCameraToGround,
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
    
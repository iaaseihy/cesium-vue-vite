<!--
 * @Descripttion: 道路穿梭线
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-26 17:09:05
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="clipModel()">模型裁剪</span>
        <span @click="handleClear()">清空</span>
      </li>
    </ul>
  </div>
</template>
  
  <script>
import * as Cesium from "cesium";
import { defineComponent, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import { getGeojson } from "@/api/api.js";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let tileset;
    let clippingPlanes;
    let planeEntities = [];
    let targetY = 0;
    // 添加道路穿梭线
    const clipModel = async () => {
      const { viewer } = store.state;
      var scene = viewer.scene;

      viewer.scene.globe.depthTestAgainstTerrain = true;

      var selectedPlane;

      var downHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      downHandler.setInputAction(function (movement) {
        var pickedObject = scene.pick(movement.position);
        if (
          Cesium.defined(pickedObject) &&
          Cesium.defined(pickedObject.id) &&
          Cesium.defined(pickedObject.id.plane)
        ) {
          selectedPlane = pickedObject.id.plane;
          // selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.05);
          // selectedPlane.outlineColor = Cesium.Color.WHITE;
          scene.screenSpaceCameraController.enableInputs = false;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

      // Release plane on mouse up
      var upHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      upHandler.setInputAction(function () {
        if (Cesium.defined(selectedPlane)) {
          // selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.1);
          // selectedPlane.outlineColor = Cesium.Color.WHITE;
          selectedPlane = undefined;
        }

        scene.screenSpaceCameraController.enableInputs = true;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);

      // Update plane on mouse move
      var moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      moveHandler.setInputAction(function (movement) {
        if (Cesium.defined(selectedPlane)) {
          var deltaY = movement.startPosition.y - movement.endPosition.y;
          targetY += deltaY;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
    const createPlaneUpdateFunction = (plane) => {
      return function () {
        plane.distance = targetY + 10;
        return plane;
      };
    };
    const handleClear = () => {
      const { viewer } = store.state;
    //   viewer.scene.primitives.removeAll();
    };
    onMounted(() => {
      loadTileset(
        "http://localhost:6060/Data/Source/3DTiles/208204GB02181/ST/0001/tileset.json"
      );
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      loadTileset,
      createPlaneUpdateFunction,
      clipModel,
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
  
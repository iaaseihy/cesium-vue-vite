<!--
 * @Descripttion: 道路穿梭线
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-30 14:19:13
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="addThroughRoadEntity()">添加(entity渲染)</span>
        <span @click="addThroughRoadPrimitive()">添加(primitive渲染)</span>
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
import RoadThroughLine from "@/components/views/cesium/road/roadThrough.js";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    // const { viewer } = store.state;

    // 添加道路穿梭线
    const addThroughRoadPrimitive = async () => {
      const { viewer } = store.state;
      let bounds = {
        west: 120.033647509724801,
        south: 36.058301209733077,
        east: 120.79146729222676,
        north: 36.537732309398598,
      };
      const { res } = await getGeojson("static/geojson/qingdaoRoad.geojson");
      const { features } = res;
      const instance = [];
      if (features?.length) {
        features.forEach((item) => {
          const arr = item.geometry.coordinates;
          arr.forEach((el) => {
            let arr1 = [];

            el.forEach((_el) => {
              arr1 = arr1.concat(_el);
            });
            const polyline = new Cesium.PolylineGeometry({
              positions: Cesium.Cartesian3.fromDegreesArray(arr1),
              width: 1.7,
              vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
            });
            const geometry = Cesium.PolylineGeometry.createGeometry(polyline);
            instance.push(
              new Cesium.GeometryInstance({
                geometry,
                // attributes: {
                //   color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED),
                // },
              })
            );
          });
        });
        console.log("-----instance-----", Cesium.Material.Spriteline1Source);
        let source = `czm_material czm_getMaterial(czm_materialInput materialInput)
                          {
                             czm_material material = czm_getDefaultMaterial(materialInput);
                             vec2 st = materialInput.st;
                             vec4 colorImage = texture(image, vec2(fract((st.s - speed * czm_frameNumber * 0.001)), st.t));
                             material.alpha = colorImage.a * color.a;
                             material.diffuse = colorImage.rgb * 1.5 ;
                             return material;
                          }`;

        const material = new Cesium.Material({
          fabric: {
            uniforms: {
              color: Cesium.Color.fromCssColorString("#7ffeff"),
              image: "static/texture/spriteline.png",
              speed: 10,
            },
            source,
          },
          translucent: function () {
            return true;
          },
        });
        const appearance = new Cesium.PolylineMaterialAppearance();
        appearance.material = material;
        const primitive = new Cesium.Primitive({
          geometryInstances: instance,
          appearance,
          asynchronous: false,
        });

        viewer.scene.primitives.add(primitive);
      }

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          (bounds.west + bounds.east) / 2,
          (bounds.south + bounds.north) / 2,
          70000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    };
    const addThroughRoadEntity = () => {
      const { viewer } = store.state;
      const material = new RoadThroughLine(
        1000,
        "static/texture/spriteline.png"
      );
      // 道路闪烁线
      Cesium.GeoJsonDataSource.load("static/geojson/qingdaoRoad.geojson").then(
        function (dataSource) {
          viewer.dataSources.add(dataSource);
          const entities = dataSource.entities.values;
          // 聚焦
          // viewer.zoomTo(entities);
          for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            entity.polyline.width = 1.7;
            entity.polyline.material = material;
          }
        }
      );
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(120.36, 36.09, 70000),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    };
    const handleClear = () => {
      const { viewer } = store.state;
      viewer.dataSources.removeAll();
      viewer.scene.primitives.removeAll();
    };
    onMounted(() => {});
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      addThroughRoadEntity,
      addThroughRoadPrimitive,
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

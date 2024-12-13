<template>
    <div id="splitScreenContainer">
      <div
        v-for="(instance, index) in numDivisions"
        :key="index"
        class="cesium-container"
        ref="cesiumContainerRefs"
      ></div>
      <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
        <el-button @click="increaseDivisions">分屏切换</el-button>
      </div>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, reactive, onMounted, onUnmounted } from "vue";
  import * as Cesium from "cesium";
  
  export default defineComponent({
    setup() {
      const numDivisions = ref(1); // Start with one division
      const cesiumContainerRefs = ref([]);
      const viewerInstances = [];
  
      const increaseDivisions = () => {
        numDivisions.value = numDivisions.value === 4 ? 1 : numDivisions.value * 2;
        initializeViewers();
      };
  
      const initializeViewers = () => {
        // Destroy existing viewers if any
        viewerInstances.forEach((viewer) => viewer && viewer.destroy());
        viewerInstances.length = 0;
  
        cesiumContainerRefs.value.forEach((container, index) => {
          if (container) {
            const viewer = new Cesium.Viewer(container, {
              animation: false,
              timeline: false,
              baseLayerPicker: false,
              homeButton: false,
              sceneModePicker: false,
              navigationHelpButton: false,
              fullscreenButton: false,
            });
  
            // Adjust the camera position for each viewer
            viewer.scene.camera.setView({
              destination: Cesium.Cartesian3.fromDegrees(
                109.08 + (index % 2) * 0.1,
                30.94 + Math.floor(index / 2) * 0.1,
                3000
              ),
            });
  
            viewerInstances.push(viewer);
          }
        });
      };
  
      onMounted(() => {
        initializeViewers();
      });
  
      onUnmounted(() => {
        // Clean up viewers on unmount
        viewerInstances.forEach((viewer) => viewer && viewer.destroy());
      });
  
      return {
        numDivisions,
        cesiumContainerRefs,
        increaseDivisions,
      };
    },
  });
  </script>
  
  <style scoped>
  #splitScreenContainer {
    display: flex;
    flex-wrap: wrap;
    width: 100vw;
    height: 100vh;
  }
  
  .cesium-container {
    flex: 1;
    min-width: 50%;
    min-height: 50%;
    background-color: #000;
    position: relative;
  }
  </style>
  
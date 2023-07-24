<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-05-22 15:42:25
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-07-24 14:24:02
-->
<template>
  <div className="ring_page" id="container"></div>
</template>

<script lang="ts">
// import * as Three from "../../../threeJS/three.module.js";
import * as Three from "three";
import { defineComponent, ref, onMounted } from "vue";
import metal from "@img/timeTunnel/metal.png";
import storm from "@img/timeTunnel/storm.jpg";

export default defineComponent({
  name: "timeTunnel",
  components: {},
  setup() {
    let renderer = ref<any>(null);
    let scene = ref<any>(null);
    let camera = ref<any>(null);
    let tunnel = ref<any>(null);
    let stormTexture = ref<any>(null);
    let H = ref<any>(0);
    let width = ref<any>(null);
    let height = ref<any>(null);
    let container = ref<any>(null);
    const initThree = () => {
      container = document.getElementById("container");
      width = window.innerWidth;
      height = window.innerHeight;
      camera = new Three.PerspectiveCamera(45, width / height, 0.1, 1000);

      scene = new Three.Scene();

      const canvas = document.createElement("canvas");
      const context: any = canvas.getContext("webgl2", {
        antialias: true,
        alpha: true,
        logarithmicDepthBuffer: true,
      });
      renderer = new Three.WebGLRenderer({
        canvas,
        context,
      });

      // renderer = new Three.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      camera.position.set(0, 0, 500);
      camera.lookAt(scene.position);

      const pointLight: Three.PointLight = new Three.PointLight(0xffffff);
      pointLight.position.set(0, 0, 500);
      scene.add(pointLight);

      (container as HTMLElement).appendChild(renderer.domElement);
      //   document.body.appendChild(renderer.domElement);

      window.addEventListener("resize", onWindowResize, false);
    };
    const onWindowResize = () => {
      if (container) {
        width = container.clientWidth;
        height = container.clientHeight;
      }

      renderer.domElement.width = width;
      renderer.domElement.height = height;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const create = () => {
      const textureLoader = new Three.TextureLoader();
      textureLoader.load(storm, function (texture) {
        stormTexture = texture;

        texture.wrapS = texture.wrapT = Three.RepeatWrapping;
        texture.repeat.set(1, 2);

        const geometry = new Three.CylinderGeometry(30, 50, 1000, 32, 32, true);
        const material = new Three.MeshPhongMaterial({
          transparent: true,
          alphaMap: texture,
          side: Three.BackSide,
        });
        tunnel = new Three.Mesh(geometry, material);

        tunnel.rotation.x = -Math.PI / 2;

        scene.add(tunnel);
      });

      textureLoader.load(metal, function (texture) {
        texture.wrapS = texture.wrapT = Three.RepeatWrapping;
        texture.repeat.set(10, 10);

        const geometry = new Three.BoxGeometry(30, 2, 30);

        const material = new Three.MeshPhongMaterial({
          map: texture,
        });

        const cube = new Three.Mesh(geometry, material);
        cube.position.z = 460;
        cube.position.y = -20;
        scene.add(cube);
      });
    };
    const render = () => {
      renderer.render(scene, camera);

      H += 0.002;
      if (H > 1) {
        H = 0;
      }

      if (tunnel.material && tunnel.rotation) {
        tunnel.material.color.setHSL(H, 0.5, 0.5);

        tunnel.rotation.y += 0.01;
        stormTexture.offset.y += 0.01;
      }
      requestAnimationFrame(render);
    };
    /** * @description:初始化  */
    onMounted(() => {
      initThree();
      create();
      render();
    });
    return {
      initThree
    };
  },
});
</script>

<style lang="scss" scoped>
.ring_page {
  width: 100%;
  height: 100%;
}
</style>

<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-05-22 15:42:25
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-23 11:28:01
-->
<template>
  <div className="ring_page" id="container"></div>
</template>

<script lang="ts">
import * as Three from "../../../threeJS/three.module.js";
import { Fire } from "../../../threeJS/Fire.js";
import "./index.styl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  getCurrentInstance,
  defineComponent,
  ref,
  onMounted,
  reactive,
  nextTick,
} from "vue";
// import ringTexture from '../../../../assets/img/eldenRing/ring.png';
import ringTexture from '@img/eldenRing/ring.png';
// 补间动画，主要用来做平滑移动、或改变
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import Animations from "./animations";
import Stats from '../../../threeJS/stats.module'

export default defineComponent({
  name: "eldenRing",
  components: {},
  setup() {
    let renderer = ref<any>(null);
    let scene = ref<any>(null);
    let camera = ref<any>(null);
    const initThree = () => {
      const container = document.getElementById("container");
      renderer = new Three.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      (container as HTMLElement).appendChild(renderer.domElement);
      renderer.setClearAlpha(0);

      scene = new Three.Scene();
      camera = new Three.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 100);
      camera.lookAt(new Three.Vector3(0, 0, 0));

      const stats = new Stats();
      // document.documentElement.appendChild(stats.dom);
      window.addEventListener(
        "resize",
        () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        },
        false
      );

      const ambientLight = new Three.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      const ring = new Fire(new Three.PlaneBufferGeometry(20, 25), {
        textureWidth: 800,
        textureHeight: 1000,
        debug: false,
      });
      ring.setSourceMap(new Three.TextureLoader().load(ringTexture));
      ring.color1 = new Three.Color(0xffffff);
      ring.color2 = new Three.Color(0xf59e00);
      ring.color3 = new Three.Color(0x08120a);
      ring.colorBias = 0.6;
      // 燃烧效果
      ring.burnRate = 10;
      // 模糊效果ring
      ring.diffuse = 1;
      ring.viscosity = 0.5;
      ring.expansion = -1.6;
      ring.swirl = 10;
      ring.drag = 0.4;
      ring.airSpeed = 18;
      ring.windX = 0.1;
      ring.windY = 0.2;
      ring.speed = 100;
      ring.massConservation = false;
      ring.position.y = 4;
      ring.position.z = -6;
      scene.add(ring);

      const controls = new OrbitControls(camera, renderer.domElement);
      Animations.animateCamera(
        camera,
        controls,
        { x: 0, y: 0, z: 22 },
        { x: 0, y: 0, z: 0 },
        2400,
        () => {
          controls.enabled = false;
        }
      );

      let step = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        stats && stats.update();
        TWEEN && TWEEN.update();
        step += 0.03;
        ring && (ring.position.y = Math.abs(2.2 + Math.sin(step)));
      };
      animate();
    };
    /** * @description:初始化  */
    onMounted(() => {
      initThree();
    });
    return {
      initThree,
      // ringTexture
    };
  },
});
</script>

<style lang="scss" scoped>
.canvas-box {
  width: 100%;
  height: 100%;
}
// .ring_page {
//   width: 100vw;
//   height: 100vh;
//   overflow: hidden;
//   background url('./images/bg.webp') no-repeat center;
//   background-size: cover;
//   cursor: default
//   &::after
//     display inline-block
//     content ''
//     width 60%
//     height 0
//     padding-top 16.23%
//     background url('./images/logo.png') no-repeat center
//     background-size 100% auto
//     position fixed
//     bottom 1%
//     left 50%
//     margin-left -30%
//     filter drop-shadow(0px 1px 8px rgba(0, 0, 0, .2))
// }
</style>
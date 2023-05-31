<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-05-22 15:42:25
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-31 16:23:10
-->
<template>
  <div className="ring_page" id="container" style="width:800px; height: 800px;">
   
  </div>
  <div id="greymap" style="width: 800px; height: 800px;"></div>
 
</template>

<script lang="ts">
// import * as Three from "../../../threeJS/three.module.js";
import * as Three from "three";
// import * as h337 from 'heatmap.js'
// import Heatmap from 'heatmap.js'
// import '@/components/views/three/heatmap3D/heatmap.min.js'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  getCurrentInstance,
  defineComponent,
  ref,
  onMounted,
  reactive,
  nextTick,
} from "vue";
import Stats from "../../../threeJS/stats.module";

export default defineComponent({
  name: "eldenRing",
  components: {},
  setup() {
    let renderer = ref<any>(null);
    let scene = ref<any>(null);
    let camera = ref<any>(null);
    let heatmap = ref(null);
    let greymap = ref(null);
    let texture = ref<Three.Texture>();
    let texture2 = ref<Three.Texture>();

    const initThree = () => {
        // 添加高度热力图
        heatmap = h337.create({
          container: document.getElementById("container"),
        });
        // 构建一些随机数据点,网页切图价格这里替换成你的业务数据
        var points = [];
        var max = 0;
        var width = 600;
        var height = 400;
        var len = 50;
        while (len--) {
          var val = Math.floor(Math.random() * 100);
          max = Math.max(max, val);
          var point = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            value: val,
          };
          points.push(point);
        }
        console.log(points);
        var dataHeat = {
          max: max,
          data: points,
        };
        heatmap.setData(dataHeat);
        // 灰度图
        greymap = h337.create({
          container: document.getElementById("greymap"),
          gradient: {
            "0": "black",
            "1.0": "white",
          },
        });

        greymap.setData({
          max: max,
          data: points,
        });

      renderer = new Three.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      scene = new Three.Scene();

      camera = new Three.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.set(0, 0, 3000);

      scene.add(new Three.AmbientLight(0xeef0ff));

      let heatMapGeo = new Three.PlaneGeometry(800, 800, 300, 300);

      let heatMapMaterial = new Three.ShaderMaterial({
        transparent: true,
        vertexShader: `
    varying vec2 vUv;
    uniform float Zscale;
    uniform sampler2D greyMap;
    void main() {
     vUv = uv;
    vec4 frgColor = texture2D(greyMap, uv);//获取灰度图点位信息
    float height = Zscale * frgColor.a;//通过灰度图的rgb*需要设置的高度计算出热力图每个点位最终在z轴高度
    vec3 transformed = vec3( position.x, position.y, height);//重新组装点坐标
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);//渲染点位
    }`,
        fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D heatMap;//热力图
    uniform vec3 u_color;//基础颜色
    uniform float u_opacity; // 透明度
    void main() {
      //vec4 alphaColor = texture2D(heatMap, vUv);
      // gl_FragColor = alphaColor;
       gl_FragColor = vec4(u_color, u_opacity) * texture2D(heatMap, vUv);//把热力图颜色和透明度进行渲染
    }`,
        uniforms: {
          heatMap: {
            value: { value: undefined },
          },
          greyMap: {
            value: { value: undefined },
          },
          Zscale: { value: 100.0 },
          u_color: { value: new Three.Color("rgb(255, 255, 255)") },
          u_opacity: {
            value: 1.0,
          },
        },
      });

      console.log(
        "heatmap._config.container.children[0]",
        heatmap._config.container.children[0]
      );
      console.log(
        "greymap._config.container.children[0]",
        greymap._config.container.children[0]
      );

      texture = new Three.Texture(heatmap._config.container.children[0]);
      texture.needsUpdate = true;
      texture2 = new Three.Texture(greymap._config.container.children[0]);
      texture2.needsUpdate = true;
      heatMapMaterial.uniforms.heatMap.value = texture;
      heatMapMaterial.side = Three.DoubleSide; // 双面渲染
      heatMapMaterial.uniforms.greyMap.value = texture2;
      // heatMapGeo.geometry.verticesNeedUpdate = true
      // let position = heatMapGeo.attributes.position;
      // position.dynamic = true;//设置planeGeometry为动态的，这样才允许改变其中的顶点
      // position.needsUpdate = true;//更新位置
      let heatMapPlane = new Three.Mesh(heatMapGeo, heatMapMaterial);
      scene.add(heatMapPlane);

      let contorl = new OrbitControls(camera, renderer.domElement);

      window.addEventListener("resize", onWindowResize, false);
    };
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    /** * @description:初始化  */
    onMounted(() => {
      initThree();
      animate();
    });
    return {
      initThree,
      animate,
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
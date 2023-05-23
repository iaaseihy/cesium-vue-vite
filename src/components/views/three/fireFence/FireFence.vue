<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-05-18 14:02:03
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-22 11:31:06
-->
<template>
  <div id="canvas-box" class="canvas-box"></div>
</template>

<script lang="ts">
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  getCurrentInstance,
  defineComponent,
  ref,
  onMounted,
  reactive,
  nextTick,
} from "vue";
// 补间动画，主要用来做平滑移动、或改变
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

export default defineComponent({
  name: "fireFence",
  components: {},
  setup() {
    let renderer = ref<any>(null);
    let scene = ref<any>(null);
    let camera = ref<any>(null);
    let orbitControls = ref<any>(null);
    const clock = new Three.Clock(); // 计时工具
    let _uniforms = ref<any>(null);
    const init = (): void => {
      const parent = document.querySelector("#canvas-box");
      //   this.parent = document.querySelector('#canvas-box');
      const maxWith = (parent as Element).clientWidth - 31;
      const maxHeight = (parent as Element).clientHeight - 63;
      scene = new Three.Scene();

      // 创建半球形光
      const hemiLight = new Three.HemisphereLight(0xffffff, 0x444444);
      hemiLight.position.set(0, 10, 0);
      scene.add(hemiLight);

      // 创建网格辅助器
        const grid = new Three.GridHelper(2000, 50, 0xffffff, 0xffffff);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);

      const m = _getMaterial();
      const m0 = new Three.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const geom = new Three.BoxGeometry(100, 100, 10);
      const instance = new Three.Mesh(geom, [m, m, m, m, m0, m0]);
    //   const instance = new Three.Mesh(geom, m);
      scene.add(instance);
      
      // 创建相机
      camera = new Three.PerspectiveCamera(45, maxWith / maxHeight, 1, 2000);
      camera.position.set(0, 20, -300);

      // 创建渲染器
      renderer = new Three.WebGLRenderer({
        antialias: true, // 消除锯齿
        logarithmicDepthBuffer: true, // 对数深度缓冲区
      });
      renderer.setSize(maxWith, maxHeight);
      renderer.shadowMap.enabled = true;
      renderer.setClearColor(0x000000);
      (parent as Element).appendChild(renderer.domElement);

      // 创建控制器
      orbitControls = new OrbitControls(camera, renderer.domElement);

      // 改变窗口大小，更新相机画面大小和渲染器大小
      window.addEventListener("resize", () => {
        camera.aspect =
          ((parent as Element).clientWidth - 31) /
          ((parent as Element).clientHeight - 63);
        camera.updateProjectionMatrix();
        renderer.setSize(
          (parent as Element).clientWidth - 31,
          (parent as Element).clientHeight - 63
        );
      });

      // 创建完毕，开始执行每帧渲染
      render();
    };
    /**
     * 开始渲染
     */
    const render = (): void => {
      const _this = this;

      // 动画循环渲染
      function animate() {
        // 预约下一帧的渲染动作
          requestAnimationFrame(animate);

          // 让渲染器渲染一帧相机捕捉到的场景
          renderer.render(scene, camera);

          // 更新控制器
          orbitControls.update();
        // try {
        //   // 预约下一帧的渲染动作
        //   requestAnimationFrame(animate);

        //   // 让渲染器渲染一帧相机捕捉到的场景
        //   renderer.render(scene, camera);

        //   // 更新控制器
        //   orbitControls.update();

        //   // 更新补间动画
        //   //   if (TWEEN && cameraTween) TWEEN.update();

        //   // 获取时间差
        //   const delta = clock.getDelta();

        //   // 执行registerRenderFunc方式注册进来的渲染操作
        //   //   const funcNames = Object.keys(_this.renderFunc);
        //   //   if (funcNames && funcNames.length > 0) {
        //   //     funcNames.forEach((funcName) => {
        //   //       try {

        //   //         // 不太放心，try-catch一下，保证出现意外也能继续执行后面的内容
        //   //         _this.renderFunc[funcName](delta);
        //   //       } catch (e) {
        //   //         console.error(
        //   //           'render func error, func name: ',
        //   //           funcName,
        //   //           ', error message:',
        //   //           e.message,
        //   //         );
        //   //       }
        //   //     });
        //   //   }
        // } catch (e) {
        //   console.error("render animate error,  error message: ", e.message);
        // }
      }

      animate();
    };
    const _getMaterial = () => {
      let shader = getShaderStr();
      _uniforms = {
        targetColor: { value: "#6cd" },
        height: { value: 2 },
        time: { value: 0 },
      };
      let material = new Three.ShaderMaterial({
        // uniforms: this._uniforms,
        uniforms: _uniforms,
        vertexShader: shader.vs,
        fragmentShader: shader.fs,
        side: Three.DoubleSide,
        transparent: true,
        depthWrite: false,
      });
      return material;
    };
    const getShaderStr = (vs?, fs?) => {
      let shader = { vs: "", fs: "" };

      shader.vs = `
      varying vec3 modelPos;
        void main() {
          modelPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `;

      shader.fs = `
        uniform vec3 targetColor;
        uniform float height;
        uniform float time;
        varying vec3 modelPos;
        float noise(vec3 p) //Thx to Las^Mercury
        {
            vec3 i = floor(p);
            vec4 a = dot(i, vec3(1., 57., 21.)) + vec4(0., 57., 21., 78.);
            vec3 f = cos((p-i)*acos(-1.))*(-.5)+.5;
            return mix(a.x, a.y, f.z);
        }
        void main() {
            vec3 n=vec3(noise(modelPos+time));
           vec3 c=mix(targetColor,n,0.7);
           gl_FragColor = vec4(c,(1.0 - modelPos.z/height)*(1.0 - modelPos.z/height)*(1.0 - modelPos.z/height));
        }
      `;
      return shader;
    };
    /** * @description:区域划分  */
    onMounted(() => {
      init();
    });
    return {
        init,
        render,
        _getMaterial,
        getShaderStr
    };
  },
});
</script>

<style lang="scss" scoped>
.canvas-box {
  width: 100%;
  height: 100%;
}
</style>
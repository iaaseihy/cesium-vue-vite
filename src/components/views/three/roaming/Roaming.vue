<template>
  <div id="canvas-box" class="canvas-box">
    <h6>2.11 指定路线漫游（一）</h6>
    <el-row style="margin-bottom: 15px">

      <!--      正在进行路线展示，或正在漫游时，不允许点击“开始”-->
      <el-button type="success" :disabled="isShowingWalkingPath || isWalking" @click="startWalking">开始</el-button>

      <!--      正在展示路线、暂停、没有开始漫游时，不允许点击“暂停”-->
      <el-button type="info" :disabled="isShowingWalkingPath || isWalkingPaused || !isWalking" @click="pauseWalking">
        暂停
      </el-button>

      <!--      正在展示路线、未暂停时，不允许点击“继续”-->
      <el-button type="warning" :disabled="isShowingWalkingPath || !isWalkingPaused" @click="continueWalking">继续
      </el-button>

      <!--      正在展示路线、未开始漫游时，不允许点击“退出”-->
      <el-button type="danger" :disabled="isShowingWalkingPath || !isWalking" @click="exitWalking">退出</el-button>
    </el-row>
  </div>
</template>

<script>
import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import goldenArrowPath from'@img/roaming/golden-arrow.jpg';
import ringTexImg from '@img/roaming/blueRing.png'
// 补间动画，主要用来做平滑移动、或改变
import {TWEEN} from 'three/examples/jsm/libs/tween.module.min';

// 绘制路径，相较于tubeGeometry，贴图的效果展现得更好
import {PathGeometry, PathPointList} from 'three.path';

let scene;  // 场景
let renderer; // 渲染器
let camera; // 相机
let orbitControls;  // 相机控制器
let npcMixer;  // npc 动作混合器
const clock = new Three.Clock();  // 计时工具
let npc; // npc
let pathCurve; // 路径曲线
let pathToShow; // 渲染出来的路径
let cameraTween;  // 相机的补间动画
let walkAction; // 行走动画
let standAction;  // 站立动画

let pointArr = [];  // 点坐标
let roleRing; // 角色脚下的环
let points = [];// 根据坐标数组转为点数组
let step = 0; // NPC当前的步数索引
let pathPoints = null; // 路径上的点

export default {
  data() {
    return {
      renderFunc: {}, // 渲染过程中注册进来的方法
      isWalking: false, // 漫游开启
      isWalkingPaused: false, // 漫游被暂停
      isShowingWalkingPath: false, // 正在进行路线展示， 此时不允许操作其他按钮
    };
  },
  mounted() {
    this.$nextTick(() => {

      // vue实例挂载完成后，初始化3D场景资源
      this.init();

    });
  },
  methods: {
    /**
     * 开始漫游
     */
    startWalking() {

      // 处理一下坐标点
      this.initPathPoints();

      // 渲染路径
      this.renderPath();

      // 加载模型
      this.loadModel(() => {

        // 先隐藏NPC和角色圈，展示路径
        npc.visible = false;
        roleRing.visible = false;

        // 展示路径全貌
        this.showWalkingPath(() => {

            // 把NPC和角色圈的位置更新到路径的第一个点
            npc.position.copy(points[0]);
            roleRing.position.copy(points[0]);

            // 显示NPC和角色圈
            npc.visible = true;
            roleRing.visible = true;

            // 视角拉近后，进入漫游状态，可以缩小纹理贴图的大小，这样才不会太突兀
            pathToShow.geometry.update(pathPoints, {
              width: 0.6,
              arrow: false
            });

            // 初始视角飞入, 距离远一些，故而“平滑”飞入
            this.updateCameraBehindNPC(true, () => {

              // 淡出站立动画，淡入行走动画
              this.fadeAction(standAction, walkAction);

              // 更新标志位，开始行走，且未暂停。
              this.isWalking = true;
              this.isWalkingPaused = false;
            });
          }
        );
      });
    },

    /**
     * 展示漫游的路线整体（运镜效果）
     * @param callback
     */
    showWalkingPath(callback) {

      // 更新标志位状态
      this.isShowingWalkingPath = true;

      // 设定几个观察点
      const position1 = new Three.Vector3(-200, 50, -350);
      const position2 = new Three.Vector3(400, 50, -350);
      const position3 = new Three.Vector3(200, 50, -350);
      const position4 = new Three.Vector3(400, 50, 350);
      const position5 = new Three.Vector3(200, 1000, 350);
      const position6 = camera.position.clone();

      // 一个接着一个地飞入视角，形成“运镜”的效果
      this.flyTo(position1, 3000, () => {
        this.flyTo(position2, 3000, () => {
          this.flyTo(position3, 3000, () => {
            this.flyTo(position4, 3000, () => {
              this.flyTo(position5, 3000, () => {
                this.flyTo(position6, 3000, () => {

                  // 更新标志位状态
                  this.isShowingWalkingPath = false;

                  // 全部结束，执行回调函数
                  callback && callback();
                });
              });
            });
          });
        });
      });
    },

    /**
     * 平滑飞入
     * @param position 目标位置
     * @param duration 持续时间，默认500ms。
     * @param callback 回调函数
     * @param onUpdate 更新回调
     */
    flyTo(position, duration, callback, onUpdate) {

      // 未指定持续时间的，默认500毫秒
      if (duration === undefined || duration === null) {
        duration = 500;
      }

      // 取相机当前位置，从当前位置，平滑移动到目标位置
      const curCameraPosition = camera.position.clone();

      // 创建补间动画TWEEN对象
      cameraTween = new TWEEN.Tween(curCameraPosition).to(position, duration).easing(TWEEN.Easing.Quadratic.Out);

      // 设定更新过程中执行的动作
      cameraTween.onUpdate((obj) => {

        // 持续duration毫秒的移动过程中， obj为“此时”坐标移动到的位置，通过不断地将相机的位置设定到坐标“此时”变化到的位置，来形成一个平滑的移动效果。
        camera.position.set(obj.x, obj.y, obj.z);

        // 如果指定了onUpdate方法，再执行下指定的onUpdate
        onUpdate && onUpdate(obj);
      });

      // 设定完成后执行的动作
      cameraTween.onComplete(() => {
        callback && callback();
      });

      // 开始补间动画（注意配合每帧渲染时的TWEEN.update()更新动画）
      cameraTween.start();

    },

    /**
     * 暂停漫游
     */
    pauseWalking() {

      if (this.isWalkingPaused) return false;

      if (this.isWalking) {
        this.fadeAction(walkAction, standAction);
        this.isWalkingPaused = true;
      }

    },

    /**
     * 继续漫游
     */
    continueWalking() {

      // 如果已经暂停，直接返回
      if (!this.isWalkingPaused) return false;

      if (this.isWalking) {

        // 暂停后，用户可能已经自由移动了视角，先平滑地将视角拉回到NPC后方，再“继续”漫游
        this.updateCameraBehindNPC(true, () => {

          // 更新标志位，切换动画
          this.isWalkingPaused = false;
          this.fadeAction(standAction, walkAction);

        });
      }
    },

    /**
     * 退出漫游
     */
    exitWalking() {

      // 销毁资源、恢复标志位状态
      this.disposeWalking();
    },

    /**
     * 初始化漫游路径上的点位
     */
    initPathPoints() {

      // 设定好的坐标
      pointArr = [
        121.78093686863522, 0, -4.603376409073572,
        121.81339509799925, 0, -1.0333897782644268,
        88.18838269349277, 0, -1.0333897782644268,
        88.18838269349277, 0, 63.55900780432629,
        87.16531645200739, 0, 68.04794277498671,
        83.06620769318347, 0, 70.98695971872945,
        -1.130897005741467, 0, 70.34667258938468,
        -5.231039038271652, 0, 68.42613876317515,
        -7.758389327064392, 0, 64.62409029746112,
        -7.758389327064392, 0, 46.44123345882236,
        -114.62656106119152, 0, 46.44123345882236,
        -119.82497669490243, 0, 44.45968445743292,
        -121.94606515130032, 0, 39.4725534305143,
        -121.94606515130032, 0, -42.76532835182727,
        -120.11831411582477, 0, -48.53850237391983,
        -116.83579669695663, 0, -49.908124030849784,
        78.54313968215955, 0, -49.908124030849784,
        85.10694214192533, 0, -50.16532666595109,
        89.88557886450108, 0, -55.064547179368375,
        89.88557886450108, 0, -93.93831946321087,
        91.96632492268847, 0, -98.37744840781204,
        95.1920071430169, 0, -100.1746448114269,
        152.736779207395, 0, -100.1746448114269,
        157.30932898344975, 0, -96.64823157224308,
        160.4735065923067, 0, -99.846029526487,
        302.4743190232127, 0, -99.846029526487,
        307.28097694970387, 0, -98.29435216740127,
        309.4249527931002, 0, -93.79194193938966,
        317.1439029555364, 0, -10.678271186410282,
        322.7256435681537, 0, 64.82345541146658,
        321.948957384584, 0, 69.41475711676998,
        269.58743740380316, 0, 71.05051147709406,
        163.1264743368946, 0, 71.05051147709406,
        159.53952961773413, 0, 68.13337162416227,
        159.53952961773413, 0, -4.677615417615058,
        124.42066238999215, 0, -4.677615417615058,
      ];

      // 将数组转为坐标数组
      points = [];

      // 每3个元素组成一个坐标
      for (let i = 0; i < pointArr.length; i += 3) {

        // 将数组中的三个元素，分别作为坐标的x, y, z
        points.push(new Three.Vector3(pointArr[i], pointArr[i + 1], pointArr[i + 2]));
      }

      // 重置步数索引
      step = 0;

      // 生成一条不闭合曲线
      pathCurve = new Three.CatmullRomCurve3(points, false, 'catmullrom', 0);
    },

    /**
     * 注册渲染中执行的方法
     * @param name 设定函数名称
     * @param func 函数方法体
     */
    registerRenderFunc(name, func) {
      this.renderFunc[name] = func;
    },

    /**
     * 注销渲染中执行的方法
     * @param name 要注销的函数名称
     */
    logoutRenderFunc(name) {
      const old = this.renderFunc[name];
      if (old) {
        delete this.renderFunc[name];
      }
    },

    /**
     * 当前动画淡出，下个动画淡入
     * @param curAction 当前动画
     * @param newAction 下一个动画
     */
    fadeAction(curAction, newAction) {
      // 淡出当前动画
      curAction && curAction.fadeOut && curAction.fadeOut(0.3);

      // 重置并淡入新的动画
      newAction.reset();
      newAction.setEffectiveWeight(1);
      newAction.play();
      newAction.fadeIn(0.3);
    },

    /**
     * 初始化3d场景、渲染器、相机等部件
     */
    init() {
      const parent = document.querySelector('#canvas-box');
      this.parent = document.querySelector('#canvas-box');
      const maxWith = parent.clientWidth - 31;
      const maxHeight = parent.clientHeight - 63;
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
      parent.appendChild(renderer.domElement);

      // 创建控制器
      orbitControls = new OrbitControls(camera, renderer.domElement);

      // 改变窗口大小，更新相机画面大小和渲染器大小
      window.addEventListener('resize', () => {
        camera.aspect = (this.parent.clientWidth - 31) / (this.parent.clientHeight - 63);
        camera.updateProjectionMatrix();
        renderer.setSize(this.parent.clientWidth - 31, this.parent.clientHeight - 63);
      });

      // 创建完毕，开始执行每帧渲染
      this.render();
    },

    /**
     * 开始渲染
     */
    render() {
      const _this = this;

      // 动画循环渲染
      function animate() {
        try {
          // 预约下一帧的渲染动作
          requestAnimationFrame(animate);

          // 让渲染器渲染一帧相机捕捉到的场景
          renderer.render(scene, camera);

          // 更新控制器
          orbitControls.update();

          // 更新补间动画
          if (TWEEN && cameraTween) TWEEN.update();

          // 获取时间差
          const delta = clock.getDelta();

          // 执行registerRenderFunc方式注册进来的渲染操作
          const funcNames = Object.keys(_this.renderFunc);
          if (funcNames && funcNames.length > 0) {
            funcNames.forEach((funcName) => {
              try {

                // 不太放心，try-catch一下，保证出现意外也能继续执行后面的内容
                _this.renderFunc[funcName](delta);
              } catch (e) {
                console.error(
                  'render func error, func name: ',
                  funcName,
                  ', error message:',
                  e.message,
                );
              }
            });
          }
        } catch (e) {
          console.error('render animate error,  error message: ', e.message);
        }
      }

      animate();
    },

 /**
  * glb 模型加载
  * @param {*} url
  * @param {*} loaded
  * @param {*} error
  */
   glb(url, dracoPath, loaded, error) {
     var loader = this.glbLoader
     let dracoLoad =this.dracoLoader
     // dracoLoad.setDecoderPath('/draco/'); // 设置public下的解码路径，注意最后面的/
     dracoLoad.setDecoderPath(dracoPath); // 设置public下的解码路径，注意最后面的/
     dracoLoad.setDecoderConfig({ type: "js" }); //使用兼容性强的draco_decoder.js解码器
     dracoLoad.preload(); 
     loader.setDRACOLoader(dracoLoad);
     loader.load(url, loaded, null, error)
   },

    /**
     * 加载模型
     * @param callback 处理完成后执行的回调函数
     */
    loadModel(callback) {

      // 创建gltf加载器
      const loader = new GLTFLoader();

      // 加载NPC模型
      loader.load('static/gltf/walk/Xbot.glb', async (obj) => {
      // loader.load('static/gltf/walk/jingzhikuanggongAnimate.glb', async (obj) => {

        npc = obj.scene;
        npc.name = 'npc';

        // 创建动画混合器绑定到NPC模型
        npcMixer = new Three.AnimationMixer(npc);

        // 截取第二个动画，作为站立动画
        standAction = npcMixer.clipAction(obj.animations[1]);

        // 默认播放站立动画, 不然会展现“T-Pose”
        standAction.play();

        // 截取第三个动画，作为行走动画  //对应Xbot.glb 的animations里的walk这个动作
        walkAction = npcMixer.clipAction(obj.animations[6]);

        // 将NPC模型添加到场景
        scene.add(npc);
        // var boxImg = require('@/assets/image/water/earthspeck.jpg')
        // 添加角色的光环贴图
        // const ringTex = await new Three.TextureLoader().loadAsync(require('@/assets/textures/role-ring.png'));
        const ringTex = await new Three.TextureLoader().loadAsync(ringTexImg);
        // 创建一个2*2的平面几何体
        const plane = new Three.PlaneGeometry(2, 2);

        // 创建一个材质
        const ringMaterial = new Three.MeshPhongMaterial({
          map: ringTex,
          transparent: true,
          blending: Three.AdditiveBlending,
          depthWrite: false
        });

        // 创建光环的网格模型
        roleRing = new Three.Mesh(plane, ringMaterial);

        // 由于平面初始是垂直的, 给它翻转到与x0z的平面平行的角度
        roleRing.rotateX(-0.5 * Math.PI);

        // 把光环添加到场景
        scene.add(roleRing);

        // 每帧渲染时执行的内容
        this.registerRenderFunc('walk', (delta) => {

          // 更新动画混合器
          npcMixer.update(delta);

          // 更新角色圈的角度，实现旋转的效果
          roleRing.rotation.z += 0.01;

          if (this.isWalking && !this.isWalkingPaused) {

            // 漫游开启，且未暂停
            this.updateNPCPosition();

            // 更新相机
            this.updateCameraBehindNPC();

            // 让角色圈一直在NPC脚下
            roleRing.position.copy(npc.position);
          }

        });

        // 有回调函数就执行回调函数
        callback && callback();

      });
    },

    /**
     * 更新NPC的位置
     */
    updateNPCPosition() {
      // 分段数，数越大，前进时取的点之间的距离越小，移动速度越慢
      const segment = 30000;

      // 从路径曲线上面取点
      const stepPoints = pathCurve.getSpacedPoints(segment);

      // 每次前进一小段
      step += 1;

      // NPC下个位置的索引
      const npcIndex = step % segment;

      // NPC眼睛看向的点的索引
      const eyeIndex = (step + 50) % segment;

      // NPC下一个位置
      const npcPoint = stepPoints[npcIndex];

      // NPC眼睛看向的位置
      const eyePoint = stepPoints[eyeIndex];

      // 更新NPC模型的位置
      npc.position.copy(npcPoint);

      // 更新NPC模型看向的位置，保证模型的“朝向”
      npc.lookAt(eyePoint.x, eyePoint.y, eyePoint.z);
    },

    /**
     * 更新相机的位置等状态，让用户的视角移动到NPC身后
     * @param moveSmooth 是否平滑移动
     * @param callback 动作完成后执行的回调函数
     */
    updateCameraBehindNPC(moveSmooth, callback) {

      // 相机的相对偏移向量, y = 1.0 让相机接近平视前方的效果， z = -5, 在NPC后5距离的位置。
      const relativeCameraOffset = new Three.Vector3(0, 1.0, -5);

      // 转换为相对NPC世界矩阵的坐标
      const targetCameraPosition = relativeCameraOffset.applyMatrix4(npc.matrixWorld);

      if (moveSmooth) {

        // 平滑移动时，使用TWEEN补间动画。
        this.flyTo(targetCameraPosition, 1000, callback, () => {

          // 更新控制器的目标为NPC的位置
          const walkerPosition = npc.position.clone();
          orbitControls.target = new Three.Vector3(walkerPosition.x, 1.0, walkerPosition.z);
        });
      } else {

        // 在曲线上分段前进的过程中，每段的间距非常非常小，已经接近丝滑，此时不需要使用TWEEN了
        camera.position.set(targetCameraPosition.x, targetCameraPosition.y, targetCameraPosition.z);

        // 更新控制器的目标为NPC的位置
        const walkerPosition = npc.position.clone();
        orbitControls.target = new Three.Vector3(walkerPosition.x, 1.0, walkerPosition.z);

        // 执行回调函数
        callback && callback();
      }
    },

    /**
     * 绘制路径到场景下
     */
    async renderPath() {

      // 金色箭头的png作为材质
    //   const arrow = await new Three.TextureLoader().loadAsync(require('@/assets/textures/golden-arrow.png'));
      const arrow = await new Three.TextureLoader().loadAsync(goldenArrowPath);
      // 贴图在水平方向上允许重复
      arrow.wrapS = Three.RepeatWrapping;

      // 向异性
      arrow.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // 创建一个合适的材质
      const material = new Three.MeshPhongMaterial({
        map: arrow,
        transparent: true,
        depthWrite: false,
        blending: Three.AdditiveBlending
      });

      // 确定一个向上的向量
      const up = new Three.Vector3(0, 1, 0);

      // region 引入three.path包

      // 创建路径点的集合
      pathPoints = new PathPointList();

      // 设置集合属性
      pathPoints.set(pathCurve.getPoints(1000), 0.5, 2, up, false);

      // 创建路径几何体
      const geometry = new PathGeometry();

      // 更新几何体的属性
      geometry.update(pathPoints, {
        width: 15,
        arrow: false
      });

      // 创建路径的网格模型
      pathToShow = new Three.Mesh(geometry, material);

      // 添加到场景
      scene.add(pathToShow);

      // endregion 引入three.path包

      // 在每一帧渲染的时候，更新贴图沿x轴的偏移量，形成uv动画效果
      this.registerRenderFunc('walk-way', () => {
        arrow.offset.x -= 0.02;
      });
    },

    /**
     * 销毁漫游相关的各种资源和动画
     * （可以根据具体情况进行优化）
     */
    disposeWalking() {

      // 销毁渲染帧时的附加处理
      this.logoutRenderFunc('walk');
      this.logoutRenderFunc('walk-way');

      // 还原标志位
      this.isWalking = false;
      this.isWalkingPaused = false;
      this.isShowingWalkingPath = false;

      // 动画处理
      standAction && npcMixer && npcMixer.uncacheClip(standAction);
      standAction && npcMixer && npcMixer.uncacheAction(standAction, npc);
      walkAction && npcMixer && npcMixer.uncacheClip(walkAction);
      walkAction && npcMixer && npcMixer.uncacheAction(walkAction, npc);
      npcMixer && npcMixer.uncacheRoot(npc);

      // 从父对象中移除模型资源（可以酌情添加销毁材质、贴图的处理哦~）
      pathToShow && pathToShow.removeFromParent();
      npc && npc.removeFromParent();
      roleRing && roleRing.removeFromParent();
    }
  },
  unmounted() {
    // vue3的生命周期，使用vue2的话，可以改为destroyed
    this.disposeWalking();
  }
};
</script>

<style scoped>
.canvas-box {
  width: 100%;
  height: 100%;
}
</style>


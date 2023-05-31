<template>
  <div id="container">
    <!-- <img src="/models/yunlog.png" alt /> -->
    <button @click="dispose('robot')">模型切换</button>

    <button @click="changeModel(['Head_4'])">模型修改</button>
  </div>
</template>
<script>
import * as Three from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import WebGL from '../commonJS/WEBGL'
import { DoubleSide, GridHelper, Mesh, MeshBasicMaterial, PlaneBufferGeometry, AnimationMixer, Clock, Raycaster, Vector2 } from 'three'
import boxImg from '@img/skyboxthree/pos-x.jpg';
import right from '@img/skyboxthree/pos-x.jpg';
import left from '@img/skyboxthree/neg-x.jpg';
import top from '@img/skyboxthree/pos-y.jpg';
import bottom from '@img/skyboxthree/neg-y.jpg';
import back from '@img/skyboxthree/pos-z.jpg';
import front from '@img/skyboxthree/neg-z.jpg';

var scene , mesh // scene,mesh 两个用全局变量，不放属性里面就可以了，具体原因不知?????????
export default {
  name: 'AnimationBinding',
  data() {
    return {
      // 场景的宽高获取容器宽高
      sceneHeight: null,
      sceneWidth: null,

      // 场景， 灯光， 摄像机， 控制器， 渲染器
      // scene: '',
      light: '',
      camera: '',
      controls: '',
      renderer: '',

      // 动画
      animationMixer: null,
      clock: null,
      animationClipList: [],
      animationActionList: {},

      animationClipList2: [],

      // 点击的元素
      intersect: [],

      // 可改变的变量
      // 点击触发的动作
      clickAction: '开关柜门',
      // 能控制显示隐藏的元素
      changeModelList: ['网格001_1', '网格023', '网格001'],

      // 实验图形控制组件
      api: { state: 'Sitting' }
    }
  },

  mounted() {
    this.init()
    this.drawPlane()
    this.drawSkybox()
    this.drawLine()
    this.loadGltf()
    this.loadGltf2()

    // 监测点击事件
    this.clickRender()
  },

  methods: {
    // 初始化three.js相关内容
    init() {
      const container = document.getElementById('container')
      // console.log("三维盒子", container, container.offsetHeight, container.offsetWidth)

      // 创建场景对象
      scene = new Three.Scene()
      this.sceneHeight = container.offsetHeight
      this.sceneWidth = container.offsetWidth

      // 创建灯光
      scene.add(new Three.AmbientLight(0x999889)) // 环境光
      this.light = new Three.DirectionalLight(0xdfebff, 0.5) // 从正上方（不是位置）照射过来的平行光，0.45的强度
      this.light.position.set(1, 1, 0)
      // this.light.position.multiplyScalar(0.5);
      scene.add(this.light)

      // 初始化相机  (视野大小， 长宽比， 近景， 远景)
      this.camera = new Three.PerspectiveCamera(70, this.sceneWidth / this.sceneHeight, 0.01, 100)
      this.camera.position.set(0, 5, 8)
      this.camera.lookAt(new Three.Vector3(0, 0, 0))

      // 创建渲染器，在创建渲染器时自带一个dom，在后文中将其放在页面上显示
      this.renderer = new Three.WebGLRenderer({
        alpha: true, // canvas中是否包含透明度
        antialias: true // 是否执行抗锯齿
      })

      // 初始化控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      // this.controls.target.set(0, 0, 0);//------------------
      // this.controls.minDistance = 3;
      // this.controls.maxDistance = 100;
      // this.controls.maxPolarAngle = Math.PI / 3;
      this.controls.update()

      // 渲染
      this.renderer.setPixelRatio(window.devicePixelRatio) // 为了兼容高清屏幕
      this.renderer.setSize(this.sceneWidth, this.sceneHeight)
      this.renderer.setClearColor(0x050505)
      this.renderer.outputEncoding = Three.sRGBEncoding // 转换输出的颜色为sRGB颜色空间，使其输出颜色与建模软件上一致
      container.appendChild(this.renderer.domElement)

      // 添加辅助线
      var axesHelper = new Three.AxesHelper(100)
      scene.add(axesHelper)

      //   // 将平面添加到场景中
      //   var plane = this.createPlaneGeometryBasicMaterial()
      //   scene.add(plane)

      window.addEventListener('resize', this.onWindowResize, false) // 添加窗口监听事件（resize-onresize即窗口或框架被重新调整大小）
    },
    // 窗口监听函数
    onWindowResize() {
      // 模型比例调整
      this.camera.aspect = this.sceneWidth / this.sceneHeight
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(this.sceneWidth, this.sceneHeight)
    },

    /**
     * 创建地面并添加材质
     * wrapS属性定义的是纹理沿x轴方向的行为，而warpT属性定义的是纹理沿y轴方向的行为。
     * Three.js为这些属性提供了如下两个选项：
     * ·THREE.RepeatWrapping允许纹理重复自己。
     * ·THREE.ClampToEdgeWrapping是属性的默认值。
     * 属性值为THREE.ClampToEdgeWrapping时，那么纹理的整体不会重复，只会重复纹理边缘的像素来填满剩下的空间。
     */
    createPlaneGeometryBasicMaterial() {
      var textureLoader = new Three.TextureLoader()
      // var boxImg = require('../../assets/img/skyboxthree/pos-x.jpg')
      var cubeMaterial = new Three.MeshStandardMaterial({
        map: textureLoader.load(boxImg),
        color: 0xffffff
      })
      cubeMaterial.map.wrapS = Three.RepeatWrapping
      cubeMaterial.map.wrapT = Three.RepeatWrapping
      cubeMaterial.map.repeat.set(8, 8)
      // 创建地平面并设置大小
      var planeGeometry = new Three.PlaneGeometry(200, 200)
      var plane = new Three.Mesh(planeGeometry, cubeMaterial)

      // 设置平面位置并旋转
      plane.rotation.x = -0.5 * Math.PI
      plane.position.x = 0
      plane.position.z = 0
      return plane
    },
    // 绘制蓝色的箭头线
    drawLine() {
      // create a blue LineBasicMaterial
      const lineMaterial = new Three.LineBasicMaterial({ color: 0x0000ff })
      // 创建一个带有一些顶点的geometry(几何体)
      const points = []
      points.push(new Three.Vector3(-10, 0, 0))
      points.push(new Three.Vector3(0, 10, 0))
      points.push(new Three.Vector3(10, 0, 0))
      const geometry = new Three.BufferGeometry().setFromPoints(points)
      const line = new Three.Line(geometry, lineMaterial)
      scene.add(line)
    //   this.WebGLTestRender()
    },
    // 绘制平面
    drawPlane() {
      // 加载贴图
      let textureLoader = new Three.TextureLoader()
      // var boxImg = require('../../assets/img/skyboxthree/pos-x.jpg')
      let boxTexture = textureLoader.load(boxImg)

      const planeBufferGeometry = new PlaneBufferGeometry(50, 50) // 创建50*50的平面
      const plane = new Mesh(planeBufferGeometry, new MeshBasicMaterial({ map: boxTexture, side: DoubleSide, color: 0xffffff }))
      plane.name = 'plane'
      // 平面绕x轴旋转90度（弧度制）
      plane.rotation.x = -Math.PI / 2
      scene.add(plane)

      // 添加网格
      scene.add(new GridHelper(50, 50))
    },

    // 绘制天空盒
    drawSkybox() {
      let skyBox = new Three.BoxGeometry(200, 200, 200) // 创建立方体

      let textureLoader = new Three.TextureLoader()
      //   let right = require('../assets/skybox/right.jpg')
      //   let left = require('../assets/skybox/left.jpg')
      //   let top = require('../assets/skybox/top.jpg')
      //   let bottom = require('../assets/skybox/bottom.jpg')
      //   let back = require('../assets/skybox/back.jpg')
      //   let front = require('../assets/skybox/front.jpg')
      // let right = require('../../assets/img/skyboxthree/pos-x.jpg')
      // let left = require('../../assets/img/skyboxthree/neg-x.jpg')
      // let top = require('../../assets/img/skyboxthree/pos-y.jpg')
      // let bottom = require('../../assets/img/skyboxthree/neg-y.jpg')
      // let back = require('../../assets/img/skyboxthree/pos-z.jpg')
      // let front = require('../../assets/img/skyboxthree/neg-z.jpg')

      let skyBoxMaterialList = [
        new Three.MeshBasicMaterial({ map: textureLoader.load(right), side: DoubleSide }),
        new Three.MeshBasicMaterial({ map: textureLoader.load(left), side: DoubleSide }),
        new Three.MeshBasicMaterial({ map: textureLoader.load(top), side: DoubleSide }),
        new Three.MeshBasicMaterial({ map: textureLoader.load(bottom), side: DoubleSide }),
        new Three.MeshBasicMaterial({ map: textureLoader.load(front), side: DoubleSide }),
        new Three.MeshBasicMaterial({ map: textureLoader.load(back), side: DoubleSide })
      ]

      let sky = new Three.Mesh(skyBox, skyBoxMaterialList) // 创建网格
      scene.add(sky)
    },

    WebGLTestRender() {
      if (WebGL.isWebGLAvailable()) {
        console.log('WebGL is available')
        // Initiate function or other initializations here
        this.render()
      } else {
        const warning = WebGL.getWebGLErrorMessage()
        document.getElementById('container').appendChild(warning)
      }
    },
    // 外部模型加载函数
    loadGltf() {
      // 加载模型
      var loader = new GLTFLoader()
      //   loader.load('static/jigui.glb', (data) => {
      loader.load('static/gltf/dundunBing/dwendwen.gltf', (data) => {
        // console.log(data)
        let mesh = data.scene
        mesh.position.set(0, 0.1, 0)
        mesh.name = 'robot'
        scene.add(mesh) // 将模型引入three

        // 加入图形控制组件
        // this.createGUI( mesh, data.animations );

        this.animationClipList = data.animations

        console.log(555, data.animations[0])

        this.setAnimation()

        // this.render()
        this.WebGLTestRender()
      })
    },

    // 外部模型2加载函数
    loadGltf2() {
      // 加载模型
      var loader = new GLTFLoader()
      //   loader.load('static/RobotExpressive.glb', (data) => {
      loader.load('static/mtl/test-demo.mtl', (data) => {
        // console.log(data)
        let mesh = data.scene
        // mesh.position.set(-4, 1.2, 0);
        mesh.position.set(-4, 1.2, 0)
        mesh.name = 'bowl'
        scene.add(mesh) // 将模型引入three

        this.animationClipList2 = data.animations
        this.setAnimation()

        // this.render()
        this.WebGLTestRender()
      })
    },

    // 图形控制组件
    createGUI(model, animations) {
      const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
      const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']

      let gui = new GUI()
      let api = this.api
      let mixer = new Three.AnimationMixer(model)
      let actions = {}

      for (let i = 0; i < animations.length; i++) {
        const clip = animations[i]
        const action = mixer.clipAction(clip)
        actions[clip.name] = action
        if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
          action.clampWhenFinished = true
          action.loop = Three.LoopOnce
        }
      }

      // states
      const statesFolder = gui.addFolder('States')
      const clipCtrl = statesFolder.add(api, 'state').options(states)
      clipCtrl.onChange(() => {
        this.fadeToAction(api.state, 0.5)
      })
      statesFolder.open()

      // emotes
      const emoteFolder = gui.addFolder('Emotes')
      let createEmoteCallback = (name) => {
        api[name] = () => {
          this.fadeToAction(name, 0.2)
          mixer.addEventListener('finished', restoreState)
        }
        emoteFolder.add(api, name)
      }

      let restoreState = () => {
        mixer.removeEventListener('finished', restoreState)
        this.fadeToAction(api.state, 0.2)
      }
      for (let i = 0; i < emotes.length; i++) {
        createEmoteCallback(emotes[i])
      }
      emoteFolder.open()

      // expressions
      let face = model.getObjectByName('Head_4')
      console.log('face', face)
      const expressions = Object.keys(face.morphTargetDictionary)
      const expressionFolder = gui.addFolder('Expressions')
      for (let i = 0; i < expressions.length; i++) {
        expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i])
      }
      let activeAction = actions['Walking']
      activeAction.play()
      expressionFolder.open()
    },
    fadeToAction(name, duration) {
      let actions = this.animationActionList
      let activeAction = actions[name]
      let previousAction = activeAction
      if (previousAction !== activeAction) {
        previousAction.fadeOut(duration)
      }
      console.log(41864, this.animationActionList)
      activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play()
    },

    // 加载动画
    setAnimation() {
      this.animationMixer = new AnimationMixer(scene)
      this.clock = new Clock()

      console.log('动画列表', this.animationClipList)
    },

    render() {
      requestAnimationFrame(() => {
        this.render()
      })

      // 调用动画
      this.animationMixer.update(this.clock.getDelta())
      this.renderer.render(scene, this.camera)
    },

    // 监测点击事件
    clickRender() {
      this.renderer.domElement.addEventListener('click', (event) => {
        // 获取屏幕坐标
        let { offsetX, offsetY } = event
        // 计算画布上的二维坐标
        let x = (offsetX / this.sceneWidth) * 2 - 1
        let y = -(offsetY / this.sceneHeight) * 2 + 1
        let mousePoint = new Vector2(x, y)

        // 获取点击元素
        let raycaster = new Raycaster()
        // 按照this.camera摄像头下，mousePoint位置设置raycaster
        raycaster.setFromCamera(mousePoint, this.camera)
        // 获取点击的元素
        let intersect = raycaster.intersectObjects(scene.children, true)
        // 筛选去除点击的网格元素及平面元素
        intersect = intersect.filter((intersect) => !(intersect.object instanceof GridHelper) && intersect.object.name != 'plane')

        console.log('点击元素', intersect)
        this.intersect = intersect
        let hasClick = []
        // 所有被点击的指定元素及其子元素组成数组，通过数组中有无数据判断是否点击
        intersect.forEach((v) => {
          // let click = this.isClick(v.object, 'robot')
          // console.log("比较结果", click)
          if (this.isClick(v.object, 'robot')) {
            hasClick.push(v)
          }
        })
        // console.log("比较结果", hasClick)

        // 业务测试：点击触发动作
        let action = this.getAnimationAction(this.clickAction)
        // 判断元素被点击，并且该点击动作还未触发，触发动作，若已触发动作停止动作
        if (hasClick.length > 0 && action.isRunning()) {
          action.stop()
        } else if (hasClick.length > 0) {
          action.play()
        }

        // 业务测试：点击控制眼睛的显示隐藏
        this.changeModel(this.changeModelList)

        // action.play()
        // action.weight = 0
        // console.log("权重", action.getEffectiveWeight () )
        // if( hasClick.length > 0 && action.getEffectiveWeight () ){
        //   action.fadeOut(1)
        // } else if( hasClick.length > 0 ) {
        //   action.fadeIn(1)
        // }
      })
    },

    // 判断点击的元素是否是指定元素或其子元素
    isClick(object, name) {
      // console.log("点击验证", object, name)
      if (object.name === name) {
        return object
      } else if (object.parent) {
        return this.isClick(object.parent, name)
      } else {
        return false
      }
    },

    // 动画调用方法，当动作已使用混合器生成AnimationAction直接返回储存的AnimationAction，若还未生成，生成一个AnimationAction返回，并储存下次使用
    getAnimationAction(name) {
      let animationActionList = this.animationActionList
      // 检索animationActionList中是否已储存AnimationAction
      for (let actionName in animationActionList) {
        if (actionName === name) {
          return animationActionList[name]
        }
      }

      // 若还未储存AnimationAction
      let animationClip = this.animationClipList.find((animationClip) => animationClip.name === name)
      animationActionList[name] = this.animationMixer.clipAction(animationClip)
      return animationActionList[name]
    },

    // 删除对象
    dispose(name) {
      // console.log('删除测试', scene)
      let childrenList = scene.children
      let group = childrenList.find((v) => v.name === name)
      group.visible = !group.visible
    },

    // 点击触发，修改模型显示部位
    changeModel(body) {
      let sence = scene.getObjectByName('robot')
      let clickList = this.intersect
      let object
      // 使用try...catch跳出循环
      try {
        clickList.forEach((item) => {
          body.forEach((objItem) => {
            object = this.isClick(item.object, objItem)
            if (object) {
              console.log('控制隐藏模块', object)
              object.visible = !object.visible
            }
          })
        })
      } catch {
        console.log('未点击到需隐藏的元素')
      }
    }
  }
}
</script>

<style scoped>
#container {
  width: 100%;
  margin: 0 auto;
  height: 100%;
  overflow: hidden;
}
</style>
<template>
  <div id="info"> three.js - animation - groups</div>
</template>

<script>
import Stats from '../threeJS/stats.module'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { OrbitControls } from './commonJS/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
var scene , mesh // scene,mesh 两个用全局变量，不放属性里面就可以了，具体原因不知?????????
export default {
  name: 'AnimationGroup',
  data() {
    return {
      clock: null,
      container: null,
      // scene: null,
      camera: null,
      renderer: null,
      mixer: null,
      stats: null,
      ambientLight: null,
      spotLight: null,
      controls: ' '
    }
  },
  mounted() {
    this.init()
    this.animate()
  },
  methods: {
    init() {
      var that = this
      that.container = document.getElementById('info')
      scene = new THREE.Scene()

      //

      // 创建渲染器
      that.renderer = new THREE.WebGLRenderer({
        alpha: true, // canvas中是否包含透明度
        antialias: true // 是否执行抗锯齿
      })

      // 配置相机
      that.camera = new THREE.PerspectiveCamera(40, that.container.innerWidth / that.container.innerHeight, 1, 1000)
      that.camera.position.set(50, 50, 100)

      // that.camera.lookAt(scene.position)
      that.camera.lookAt(new THREE.Vector3(0, 0, 0))

      // 配置渲染器
      that.renderer.setPixelRatio(window.devicePixelRatio) // 为了兼容高清屏幕
      that.renderer.outputEncoding = THREE.sRGBEncoding // 转换输出的颜色为sRGB颜色空间，使其输出颜色与建模软件上一致
      that.renderer.antialias = true
      that.renderer.autoClear = true
      that.renderer.setClearColor(0x050505)
      that.renderer.setSize(that.container.innerWidth, that.container.innerHeight)
      that.container.appendChild(that.renderer.domElement)

      // 初始化控制器
      that.controls = new OrbitControls(that.camera, that.renderer.domElement)
      // this.controls.target.set(0, 0, 0);//------------------
      // this.controls.maxPolarAngle = Math.PI / 3;

      // 如果使用animate方法时，将此函数删除
      // controls.addEventListener( 'change', render );
      // 使动画循环使用时阻尼或自转 意思是否有惯性
      that.controls.enableDamping = true
      // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
      that.controls.dampingFactor = 0.25
      // 是否可以缩放
      that.controls.enableZoom = true
      // 是否自动旋转
      that.controls.autoRotate = false
      // 设置相机距离原点的最远距离
      that.controls.minDistance = 1
      // 设置相机距离原点的最远距离
      that.controls.maxDistance = 10000
      // 是否开启右键拖拽
      that.controls.enablePan = true
      that.controls.update()

      // 创建灯光
      that.ambientLight = new THREE.AmbientLight({ color: 0x404040 })
      scene.add(that.ambientLight)

      // 添加光源
      that.spotLight = new THREE.SpotLight(0xcccccc)
      that.spotLight.position.set(-100, 300, 10)
      scene.add(that.spotLight)

      // all objects of this animation group share a common animation state
      const animationGroup = new THREE.AnimationObjectGroup()

      // 创建网格;
      const geometry = new THREE.BoxGeometry(5, 5, 5)
      // 给几何体添加纹理,加载贴图图片
      var texture = new THREE.TextureLoader().load('static/texture/waterNormals.jpg', () => {
        this.renderer.render(scene, this.camera)
      })
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const mesh = new THREE.Mesh(geometry, material)

          mesh.position.x = 32 - 16 * i
          mesh.position.y = 0
          mesh.position.z = 32 - 16 * j

          scene.add(mesh)
          animationGroup.add(mesh)
        }
      }

      //
      var textLoad = new FontLoader().load('static/font/Source Han Sans CN Normal_Regular.json', function (font) {
        var txtGeo = new TextGeometry('THREE.JS字体！', {
          font: font,
          size: 0.8, // Float。字体大小，默认值为100
          height: 0.1, // Float。挤出文本的厚度。默认值为50
          curveSegments: 12, // Integer。（表示文本的）曲线上点的数量。默认值为12
          bevelEnabled: true, // Boolean。是否开启斜角，默认为false
          bevelThickness: 0.1, // Float。文本上斜角的深度，默认值为20
          bevelSize: 0.05, // Float。斜角与原始文本轮廓之间的延伸距离。默认值为8
          bevelSegments: 3 // Integer。斜角的分段数。默认值为3
        })
        // var txtMater = new THREE.MeshBasicMaterial({ color: 0x0000ff })
        // var txtMesh = new THREE.Mesh(txtGeo, txtMater)
        var txtMater = new THREE.MeshNormalMaterial({
          flatShading: THREE.FlatShading,
          transparent: true, // transparent开启且为true时才可以调节透明度opacity
          opacity: 0.9
        })
        var txtMesh = new THREE.Mesh(txtGeo, txtMater)
        txtMesh.position.set(-2, 2.3, -0.4)
        scene.add(txtMesh)
      })

      // create some keyframe tracks

      const xAxis = new THREE.Vector3(1, 0, 0)
      const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0)
      const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI)
      const quaternionKF = new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        [0, 1, 2],
        [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w]
      )

      const colorKF = new THREE.ColorKeyframeTrack('.material.color', [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete)
      const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1])

      // create clip

      const clip = new THREE.AnimationClip('default', 3, [quaternionKF, colorKF, opacityKF])

      // apply the animation group to the mixer as the root object

      that.mixer = new THREE.AnimationMixer(animationGroup)

      const clipAction = that.mixer.clipAction(clip)
      clipAction.play()

      //

      that.stats = new Stats()
      that.container.appendChild(that.stats.dom)

      //

      that.clock = new THREE.Clock()

      //
      // 添加辅助线
      var axesHelper = new THREE.AxesHelper(100)
      scene.add(axesHelper)
      // var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
      // scene.add( arrowHelper );

      /* 监听事件,自适应窗口 */
      window.addEventListener('resize', that.onWindowResize, true)
    },

    /* 浏览器窗口变动触发 */
    onWindowResize() {
      var that = this
      // 重新设置相机宽高比例
      that.camera.aspect = window.innerWidth / window.innerHeight
      // 更新相机投影矩阵
      that.camera.updateProjectionMatrix()
      // 重新设置渲染器渲染范围
      that.renderer.setSize(window.innerWidth, window.innerHeight)
    },

    animate() {
      requestAnimationFrame(this.animate)
      this.render()
    },

    render() {
      var that = this
      const delta = that.clock.getDelta()

      if (that.mixer) {
        that.mixer.update(delta)
      }

      that.renderer.render(scene, that.camera)

      that.stats.update()
    }
  }
}
</script>

<style scoped>
#info {
  height: 100%;
  width: 100%;
  /* border: 3px solid #2c3e50; */
}
</style>
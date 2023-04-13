<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-13 13:54:18
-->
<template>
  <div id="cesiumContainer" class="fullSize">
    
  </div>
  <contour-line :test="this.testArr" :viewer="this.cesiumViewer" :earth="this.Earth" :modelUrl="this.modelUrl" ref="contourLine"></contour-line>
  <!-- <div id="slider" className="slider">
        <div id="creditContainer"></div>
  </div>
  <div id="cesiumContainerR" className="cesiumContainerRight">
      <div id="creditContainerR" ></div>
  </div> -->
</template>

<script>
import * as Cesium from "cesium";
// import Cesium103 from '../../../public/static/cesium1.103/CesiumUnminified/Cesium'
// import 'cesium/Build/Cesium/Widgets/widgets.css'
// import 'cesium/Build/Cesium/Widgets/bucket.css'
// import 'cesium/widgets.css'
// import 'cesium/bucket.css'
// import {
//   Viewer,
//   Cartesian3,
//   Color,
//   SkyBox,
//   ScreenSpaceEventHandler,
//   UrlTemplateImageryProvider,
//   WebMercatorTilingScheme,
//   CesiumTerrainProvider,
//   createOsmBuildings,
//   WebMapTileServiceImageryProvider
// } from 'cesium'

import {
  LOCAL_IMG_URL,
  LOCAL_TERRAIN_URL,
  DAYANTA3DTILES,
  BAIMO3DTILES,
  GAODE_IMG_URL,
} from "../commonJS/config";
import {
  BaiduImageryProvider,
  AmapImageryProvider,
} from "../commonJS/BaiduImageryProvider";
import { updateMaterial } from "./ContourLine.js";
import positiveX from "../../assets/img/SkyBox/00h+00.jpg";
import negativeX from "../../assets/img/SkyBox/12h+00.jpg";
import positiveY from "../../assets/img/SkyBox/06h+00.jpg";
import negativeY from "../../assets/img/SkyBox/18h+00.jpg";
import positiveZ from "../../assets/img/SkyBox/06h+90.jpg";
import negativeZ from "../../assets/img/SkyBox/06h-90.jpg";
import MeasureTool from "../../components/measureTool/MeasureTool.js";
import ContourLine from '../../../src/components/views/ContourLine.vue'
import WallDiffuseMaterialProperty from "../commonJS/WallDiffuseMaterialProperty";
import WallLinkCustomMaterialProperty from "../commonJS/WallLinkCustomMaterialProperty";
// import Visibility from '../commonJS/viewShedTwoPoints'
// import { CV } from '../commonJS/CV.js'
import "../../constants/data/config";
// import gltfModel from '../../../public/static/gltf/Cesium_Man.glb'
var viewer, viewerEye, scene, tileset1, tilesetBaimo;
export default {
  name: "CesiumContainer",
  components: { ContourLine },
  data() {
    return {
      subdomains: 1,
      coordiatesArr: [],
      cesiumViewer: null,
      Earth: null,
      modelUrl: "@/static/gltf/Cesium_Man.glb",
      testArr: [1, 2, 3],
      wallPosition1: Cesium.Cartesian3.fromDegreesArrayHeights([
        104.07263175401185, 30.647622150198725, 1500.0, 104.06369117158526,
        30.648834374000277, 1500.0, 104.06437182811021, 30.62274533905387,
        1500.0, 104.07463538167119, 30.62285687644371, 1500.0,
        104.07263175401185, 30.647622150198725, 1500.0,
      ]),
      wallPosition2: Cesium.Cartesian3.fromDegreesArrayHeights([
        104.09816110606057, 30.659821965447698, 200.0, 104.1120972824757,
        30.65330300319938, 200.0, 104.10758419863926, 30.64592470850288, 200.0,
        104.09351691196979, 30.652434826507452, 200.0, 104.09816110606057,
        30.659821965447698, 200.0,
      ]),
    };
  },
  mounted() {
    // this.initDefaultView()
    this.initViewer();
    // this.initEarthViewer()
    // new Cesium.Viewer('cesiumContainer')
    // 测量距离
    // MeasureTool.measureLineSpace(viewer, null)
    // // 测量面积
    // MeasureTool.measureAreaSpace(viewer, null)
  },
  methods: {
    initDefaultView() {
      // 本地影像
      var imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: LOCAL_IMG_URL,
        //   url: GAODE_IMG_URL,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        fileExtension: "png",
        minimumLevel: 0,
        maximumLevel: 19,
      });
      var terrainProviderGoogle = Cesium.createWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: false,
      });
      new Cesium.Viewer("cesiumContainer", {
        terrainExaggeration: 0.95,
        imageryProvider: imageryProvider,
        // imageryProvider: baiduImageryProvider,
        // terrainProvider: terrainProvider,
        // terrainProvider: terrainProviderMars,
        terrainProvider: terrainProviderGoogle,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        timeline: false,
        animation: false,
        selectionIndicator: false,
        infoBox: false,
      });
    },
    initViewer() {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMmEyNjk5Ni02YjM4LTQ1NWUtOTk3Ny1mMzg5ZDFkZGEwYjYiLCJpZCI6MjYzODMsImlhdCI6MTY2NTczNDAwNX0.E8DSOKZagTy0leqyheZVzpjwrh3AactCSgQF3v22T2Q";
      // 天地图影像
      var imageryProvider1 = new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=你的token",
        layer: "tdtBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
      });
      // 注记
      var imageryProvider2 = new Cesium.WebMapTileServiceImageryProvider({
        url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=你的token",
        layer: "tdtAnnoLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
      });
      // 本地影像
      var imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: LOCAL_IMG_URL,
        //   url: GAODE_IMG_URL,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        fileExtension: "png",
        minimumLevel: 0,
        maximumLevel: 19,
      });
      var terrainProvider = new Cesium.CesiumTerrainProvider({
        url: LOCAL_TERRAIN_URL,
        requestWaterMask: true, // 请求水波纹效果
      });
      var terrainProviderMars = new Cesium.CesiumTerrainProvider({
        url: "http://data.marsgis.cn/terrain",
        requestWaterMask: true, // 请求水波纹效果
        requestVertexNormals: true,
      });
      var terrainProviderGoogle = Cesium.createWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: false,
      });
      // 百度
      var baiduImageryProvider = new BaiduImageryProvider({
        url: "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
        layer: "tdtAnnoLayer",
        style: "default",
        format: "image/jpeg",
        maximumLevel: 18,
        subdomains: this.subdomains,
        tileMatrixSetID: "GoogleMapsCompatible",
        crs: "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
        tilingScheme: null,
      });
      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainExaggeration: 0.95,
        imageryProvider: imageryProvider,
        // imageryProvider: baiduImageryProvider,
        // terrainProvider: terrainProvider,
        // terrainProvider: terrainProviderMars,
        terrainProvider: terrainProviderGoogle,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        timeline: false,
        animation: false,
        selectionIndicator: false,
        infoBox: false,
      });
      // 通过imageryLayers获取图层列表集合
      var layers = viewer.scene.imageryLayers;
      // 图层列表集合的addImageryProvider方法:
      // 两个参数，第一参数是一个ImageryProvider函数，这个函数的作用是新建一个图层;第二个参数是index，Number类型，作用是指定新插入图层在图层列表集合中的索引(位置)，若不指定，默认新图层添加在最上层
      // 返回值是新添加到图层列表集合中的图层
      var baiduImageryLayer = layers.addImageryProvider(
        new BaiduImageryProvider({
          url: "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1",
          layer: "tdtAnnoLayer",
          style: "dark",
          format: "image/jpeg",
          maximumLevel: 18,
          subdomains: this.subdomains,
          tileMatrixSetID: "GoogleMapsCompatible",
          crs: "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
          tilingScheme: null,
        })
      );
      // get或set图层透明度，范围是0-1
      baiduImageryLayer.alpha = 0.6;

      // get或set图层亮度，小于1图层更暗，大于1更亮
      baiduImageryLayer.brightness = 1.0;
      // 添加高德地图并使用插件纠偏
      var gaodeImageryLayer = layers.addImageryProvider(
        new AmapImageryProvider({
          url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
          layer: "tdtAnnoLayer",
          style: "default",
          format: "image/jpeg",
          maximumLevel: 18,
          subdomains: this.subdomains,
          tileMatrixSetID: "GoogleMapsCompatible",
          crs: "WGS84", // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
          tilingScheme: null,
        })
      );
      // get或set图层透明度，范围是0-1
      gaodeImageryLayer.alpha = 1.0;

      // get或set图层亮度，小于1图层更暗，大于1更亮
      gaodeImageryLayer.brightness = 1.0;
      // 修改影像图层颜色，变为暗色
      console.log(
        layers,
        "terrainLayers: ",
        viewer.scene.terrainProvider._layers
      );
      // this.modifyMap(viewer)
      // 百度
      // viewer.imageryLayers.addImageryProvider(
      //   new BaiduImageryProvider({
      //     url: 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1',
      //     layer: 'tdtAnnoLayer',
      //     style: 'default',
      //     format: 'image/jpeg',
      //     maximumLevel: 18,
      //     subdomains: this.subdomains,
      //     tileMatrixSetID: 'GoogleMapsCompatible',
      //     crs: 'WGS84', // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
      //     tilingScheme: null
      //   })
      // )

      // 高德
      // viewer.imageryLayers.addImageryProvider(
      //   new AmapImageryProvider({
      //     url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      //     layer: 'tdtAnnoLayer',
      //     style: 'default',
      //     format: 'image/jpeg',
      //     maximumLevel: 18,
      //     subdomains: this.subdomains,
      //     tileMatrixSetID: 'GoogleMapsCompatible',
      //     crs: 'WGS84', // 坐标系: WGS84 、BD09 、GCJ02，仅百度、高德有效
      //     tilingScheme: null
      //   })
      // )

      // 用于渲染星空的SkyBox对象
      viewer.scene.skyBox = new Cesium.SkyBox({
        sources: {
          positiveX: positiveX,
          negativeX: negativeX,
          positiveY: positiveY,
          negativeY: negativeY,
          positiveZ: positiveZ,
          negativeZ: negativeZ,
        },
      });
      viewer._cesiumWidget._creditContainer.style.display = "none";

      var ArcGisMap = new Cesium.UrlTemplateImageryProvider({
        // 调用深蓝夜色影像服务
        url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
      });

      // sliderBar
      // var layersL = viewer.imageryLayers
      // var googleLayer = layersL.addImageryProvider(ArcGisMap)
      // googleLayer.splitDirection = Cesium.ImagerySplitDirection.LEFT// 设置图层在左侧

      // var slider = document.getElementById('slider')
      // viewer.scene.imagerySplitPosition = (slider.offsetLeft) / slider.parentElement.offsetWidth
      // window.constants.dragStartX = 0
      // document.getElementById('slider').addEventListener('mousedown', this.mouseDown, false)
      // window.addEventListener('mouseup', this.mouseUp, false)

      // // 分屏联动
      // 用于联动的viewer
      // viewerEye = new Cesium.Viewer('cesiumContainerR', {
      //   imageryProvider: ArcGisMap,

      //   creditContainer: 'creditContainerR',

      //   scene3DOnly: true,

      //   baseLayerPicker: false,

      //   infoBox: false,

      //   selectionIndicator: false,

      //   geocoder: false, // 是否显示地名查找控件

      //   navigationHelpButton: false, // 是否显示帮助信息控件

      //   homeButton: false,

      //   timeline: false,

      //   animation: false
      // })
      // viewerEye._cesiumWidget._creditContainer.style.display = 'none'

      // // 第一种
      // var control = viewerEye.scene.screenSpaceCameraController

      // control.enableRotate = false

      // control.enableTranslate = false

      // control.enableZoom = false

      // control.enableTilt = false

      // control.enableLook = false

      // var syncViewer = function () {
      //   viewerEye.camera.flyTo({
      //     destination: viewer.camera.position,

      //     orientation: {
      //       heading: viewer.camera.heading,

      //       pitch: viewer.camera.pitch,

      //       roll: viewer.camera.roll
      //     },

      //     duration: 0.0
      //   })
      // }

      // viewer.camera.changed.addEventListener(syncViewer)

      // viewer.scene.preRender.addEventListener(syncViewer)

      // // 第二种
      // var sceneL = viewer.scene
      // var sceneR = viewerEye.scene

      // var handlerL = new Cesium.ScreenSpaceEventHandler(sceneL.canvas)
      // var ellipsoidL = sceneL.globe.ellipsoid
      // var handlerR = new Cesium.ScreenSpaceEventHandler(sceneR.canvas)
      // var ellipsoidR = sceneR.globe.ellipsoid

      // var isLeftTrigger = false
      // var isRightTrigger = false

      // handlerL.setInputAction(function (movement) {
      //   isLeftTrigger = true
      //   isRightTrigger = false
      // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      // handlerR.setInputAction(function (movement) {
      //   isLeftTrigger = false
      //   isRightTrigger = true
      // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      // var syncViewerL = function () {
      //   if (isLeftTrigger) {
      //     viewerEye.camera.flyTo({
      //       destination: viewer.camera.position,
      //       orientation: {
      //         heading: viewer.camera.heading,
      //         pitch: viewer.camera.pitch,
      //         roll: viewer.camera.roll
      //       },
      //       duration: 0.0
      //     })
      //   }
      // }

      // viewer.camera.changed.addEventListener(syncViewerL)
      // viewer.scene.preRender.addEventListener(syncViewerL)

      // var syncViewerR = function () {
      //   if (isRightTrigger) {
      //     viewer.camera.flyTo({
      //       destination: viewerEye.camera.position,
      //       orientation: {
      //         heading: viewerEye.camera.heading,
      //         pitch: viewerEye.camera.pitch,
      //         roll: viewerEye.camera.roll
      //       },
      //       duration: 0.0
      //     })
      //   }
      // }

      // viewer.camera.changed.addEventListener(syncViewerR)
      // viewer.scene.preRender.addEventListener(syncViewerR)
      // 分屏至此结束

      viewer.scene.globe.showGroundAtmosphere = false;
      // viewer.scene.globe.baseColor = Color.BLACK
      // viewer.scene.globe.baseColor = new Cesium.Color(1, 1, 1, 0) // 修改地球颜色
      // viewer.scene.primitives.add(createOsmBuildings())
      // viewer.scene.camera.flyTo({
      //   destination: Cartesian3.fromDegrees(-74.019, 40.6912, 750)
      // })
      // 调整场景光照
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: new Cesium.Cartesian3(
          0.35492591601301104,
          -0.8909182691839401,
          -0.2833588392420772
        ),
      });

      viewer.camera.setView({
        // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
        // fromDegrees()方法，将经纬度和高程转换为世界坐标
        destination: Cesium.Cartesian3.fromDegrees(99, 36.4, 18000008),
        orientation: {
          // 指向
          // heading:Cesium.Math.toRadians(90,0),
          // 视角
          // pitch:Cesium.Math.toRadians(-90),
          // roll:0.0
        },
      });
      // 显示帧率
      viewer.scene.debugShowFramesPerSecond = true;
      viewer.scene.globe.depthTestAgainstTerrain = false;

      // 添加3d tiles调试面板
      viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
      var inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;
      console.log("inspectorViewModel: ", inspectorViewModel);

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      this.$store.state.cesiumDrawHandler = handler;
      window.cesiumViewer = viewer;
      this.cesiumViewer = viewer;
      scene = viewer.scene;

      // // 加载100000个模型
      // this.addGlbCollection()
      // 加载大雁塔倾斜摄影
      this.set3Dtitle3();
      // 添加白膜
      // this.BAIMOEdit()
      // 添加等高线
      // this.setContourRef()
      // this.setContour()

      // 立体墙
      // this.wllUp()
      // this.wallCustom()

      // 开启两点间可视域分析
      // this.visibilityTwoPoints(viewer)
      // viewer.flyTo(tilesetBaimo)
      // viewer.flyTo(tileset1)
      viewer.camera.moveEnd.addEventListener(this.getCurrentExtent);
    },
    mouseUp() {
      window.removeEventListener("mousemove", this.sliderMove, true);
    },
    mouseDown(e) {
      var slider = document.getElementById("slider");
      window.constants.dragStartX = e.clientX - slider.offsetLeft;
      window.addEventListener("mousemove", this.sliderMove, true);
      console.log(viewer.scene.mode);
    },
    sliderMove(e) {
      var slider = document.getElementById("slider");
      var splitPosition =
        (e.clientX - window.constants.dragStartX) /
        slider.parentElement.offsetWidth;
      slider.style.left = 100.0 * splitPosition + "%";
      viewer.scene.imagerySplitPosition = splitPosition;
    },
    initEarthViewer() {
      this.Earth = new CV.Earth("cesiumContainer", {
        imageryProvider: CV.TAG.BASELAYER.BAIDUIMAGERY(),
        skyBox: CV.TAG.SKYBOX.customStyle(),
      });
    },
    setContourRef() {
      this.$refs.contourLine.updateMaterial(viewer);
    },
    setContour() {
      // 开启光照
      viewer.scene.globe.enableLighting = true;
      // 定义等高线初始值
      // const minHeight = -414.0 // approximate dead sea elevation
      // const maxHeight = 8777.0 // approximate everest elevation
      // const contourColor = Cesium.Color.RED.clone()
      // const contourUniforms = {}
      // const shadingUniforms = {}

      // // 修改材质
      // var hasContour = viewModel.enableContour
      // var selectedShading = viewModel.selectedShading
      // var globe = viewer.scene.globe
      // var material
      // if (hasContour) {
      //   if (selectedShading === 'elevation') {
      //     material = getElevationContourMaterial()
      //     shadingUniforms = material.materials.elevationRampMaterial.uniforms
      //     shadingUniforms.minimumHeight = minHeight
      //     shadingUniforms.maximumHeight = maxHeight
      //     contourUniforms = material.materials.contourMaterial.uniforms
      //   } else {
      //     material = Cesium.Material.fromType('ElevationContour')
      //     contourUniforms = material.uniforms
      //   }
      //   contourUniforms.width = viewModel.contourWidth
      //   contourUniforms.spacing = viewModel.contourSpacing
      //   contourUniforms.color = contourColor
      // } else if (selectedShading === 'elevation') {
      //   material = Cesium.Material.fromType('ElevationRamp')
      //   shadingUniforms = material.uniforms
      //   shadingUniforms.minimumHeight = minHeight
      //   shadingUniforms.maximumHeight = maxHeight
      // }
      // if (selectedShading !== 'none') {
      //   shadingUniforms.image = getColorRamp(selectedShading)
      // }
      // globe.material = material
      updateMaterial(viewer);
    },
    // 加速器园区
    set3Dtitle3() {
      const customShader = new Cesium.CustomShader({
        uniforms: {
          // 判断是否开启压平
          v_if: {
            type: Cesium.UniformType.BOOL,
            value: false,
          },
          // 压平值
          v_z: {
            type: Cesium.UniformType.FLOAT,
            value: 0.0,
          },
        },
        varyings: {
          // 压平区域
          v_area: Cesium.VaryingType.VEC3,
        },
        // 局部压平通过vsInput.attributes.positionMC.x<10.0 &&vsInput.attributes.positionMC.y<10.0实现（模型内部坐标筛选），可传入varyings使用
        vertexShaderText: `
				 void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
		 	if(v_if&& vsInput.attributes.positionMC.x<10.0 &&vsInput.attributes.positionMC.y<10.0){
		 		vsOutput.positionMC = vec3(vsInput.attributes.positionMC.x, vsInput.attributes.positionMC.y, v_z);
		 	}else{
		 		vsOutput.positionMC = vec3(vsInput.attributes.positionMC.x, vsInput.attributes.positionMC.y, vsInput.attributes.positionMC.z);
		 	}
		 }`,

        fragmentShaderText: `
		 void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
			
		  }`,
      });
      const translation = Cesium.Cartesian3.fromArray([0, 0, 0]);
      const m = Cesium.Matrix4.fromTranslation(translation);
      const tilesetJson = {
        url: DAYANTA3DTILES,
        minimumPixelSize: 128,
        customShader: customShader,
        enableModelExperimental: true,
        modelMatrix: m,
        // show: true, // 是否显示图块集(默认true)
        skipLevelOfDetail: true, // --- 优化选项。确定是否应在遍历期间应用详细级别跳过(默认false)
        baseScreenSpaceError: 1024, // --- When skipLevelOfDetailis true，在跳过详细级别之前必须达到的屏幕空间错误(默认1024)
        maximumScreenSpaceError: 32, // 数值加大，能让最终成像变模糊---用于驱动细节细化级别的最大屏幕空间误差(默认16)原128
        skipScreenSpaceErrorFactor: 16, // --- 何时skipLevelOfDetail是true，定义要跳过的最小屏幕空间错误的乘数。与 一起使用skipLevels来确定要加载哪些图块(默认16)
        skipLevels: 1, // --- WhenskipLevelOfDetail是true一个常量，定义了加载图块时要跳过的最小级别数。为 0 时，不跳过任何级别。与 一起使用skipScreenSpaceErrorFactor来确定要加载哪些图块。(默认1)
        immediatelyLoadDesiredLevelOfDetail: false, // --- 当skipLevelOfDetail是时true，只会下载满足最大屏幕空间错误的图块。忽略跳过因素，只加载所需的图块(默认false)
        loadSiblings: false, // 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋 --- 何时确定在遍历期间skipLevelOfDetail是否true始终下载可见瓦片的兄弟姐妹(默认false)
        cullWithChildrenBounds: false, // ---优化选项。是否使用子边界体积的并集来剔除瓦片（默认true）
        cullRequestsWhileMoving: false, // ---优化选项。不要请求由于相机移动而在返回时可能未使用的图块。这种优化只适用于静止的瓦片集(默认true)
        cullRequestsWhileMovingMultiplier: 10, // 值越小能够更快的剔除 ---优化选项。移动时用于剔除请求的乘数。较大的是更积极的剔除，较小的较不积极的剔除(默认60)原10
        preloadWhenHidden: true, // ---tileset.show时 预加载瓷砖false。加载图块，就好像图块集可见但不渲染它们(默认false)
        preloadFlightDestinations: true, // ---优化选项。在相机飞行时在相机的飞行目的地预加载图块(默认true)
        preferLeaves: true, // ---优化选项。最好先装载叶子(默认false)
        maximumMemoryUsage: 2048, // 内存分配变小有利于倾斜摄影数据回收，提升性能体验---瓦片集可以使用的最大内存量（以 MB 为单位）(默认512)原512 4096
        progressiveResolutionHeightFraction: 0.5, // 数值偏于0能够让初始加载变得模糊 --- 这有助于在继续加载全分辨率图块的同时快速放下图块层(默认0.3)
        dynamicScreenSpaceErrorDensity: 10, // 数值加大，能让周边加载变快 --- 用于调整动态屏幕空间误差的密度，类似于雾密度(默认0.00278)
        dynamicScreenSpaceErrorFactor: 1, // 不知道起了什么作用没，反正放着吧先 --- 用于增加计算的动态屏幕空间误差的因素(默认4.0)
        dynamicScreenSpaceErrorHeightFalloff: 0.25, // --- 密度开始下降的瓦片集高度的比率(默认0.25)
        foveatedScreenSpaceError: true, // --- 优化选项。通过暂时提高屏幕边缘周围图块的屏幕空间错误，优先加载屏幕中心的图块。一旦Cesium3DTileset#foveatedConeSize加载确定的屏幕中心的所有图块，屏幕空间错误就会恢复正常。(默认true)
        foveatedConeSize: 0.1, // --- 优化选项。当Cesium3DTileset#foveatedScreenSpaceError为 true 时使用来控制决定延迟哪些图块的锥体大小。立即加载此圆锥内的瓷砖。圆锥外的瓷砖可能会根据它们在圆锥外的距离及其屏幕空间误差而延迟。这是由Cesium3DTileset#foveatedInterpolationCallback和控制的Cesium3DTileset#foveatedMinimumScreenSpaceErrorRelaxation。将此设置为 0.0 意味着圆锥将是由相机位置及其视图方向形成的线。将此设置为 1.0 意味着锥体包含相机的整个视野,禁用效果(默认0.1)
        foveatedMinimumScreenSpaceErrorRelaxation: 0.0, // --- 优化选项。当Cesium3DTileset#foveatedScreenSpaceError为 true 时使用以控制中央凹锥之外的图块的起始屏幕空间误差松弛。屏幕空间错误将从 tileset 值开始Cesium3DTileset#maximumScreenSpaceError根据提供的Cesium3DTileset#foveatedInterpolationCallback.(默认0.0)
        // foveatedTimeDelay: 0.2, // ---优化选项。使用 whenCesium3DTileset#foveatedScreenSpaceError为 true 来控制在相机停止移动后延迟瓷砖开始加载之前等待的时间（以秒为单位）。此时间延迟可防止在相机移动时请求屏幕边缘周围的瓷砖。将此设置为 0.0 将立即请求任何给定视图中的所有图块。(默认0.2)
        luminanceAtZenith: 0.2, // --- 用于此模型的程序环境贴图的天顶处的太阳亮度（以千坎德拉每平方米为单位）(默认0.2)
        backFaceCulling: true, // --- 是否剔除背面几何体。当为 true 时，背面剔除由 glTF 材质的 doubleSided 属性确定；如果为 false，则禁用背面剔除(默认true)
        debugFreezeFrame: false, // --- 仅用于调试。确定是否应仅使用最后一帧的图块进行渲染(默认false)
        debugColorizeTiles: false, // --- 仅用于调试。如果为 true，则为每个图块分配随机颜色(默认false)
        debugWireframe: false, // --- 仅用于调试。如果为 true，则将每个图块的内容渲染为线框(默认false)
        debugShowBoundingVolume: false, // --- 仅用于调试。如果为 true，则为每个图块渲染边界体积(默认false)
        debugShowContentBoundingVolume: false, // --- 仅用于调试。如果为 true，则为每个图块的内容渲染边界体积(默认false)
        debugShowViewerRequestVolume: false, // --- 仅用于调试。如果为 true，则呈现每个图块的查看器请求量(默认false)
        debugShowGeometricError: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的几何误差(默认false)
        debugShowRenderingStatistics: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的命令、点、三角形和特征的数量(默认false)
        debugShowMemoryUsage: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块使用的纹理和几何内存（以兆字节为单位）(默认false)
        debugShowUrl: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的 url(默认false)
        dynamicScreenSpaceError: true, // 根据测试，有了这个后，会在真正的全屏加载完之后才清晰化房屋 --- 优化选项。减少距离相机较远的图块的屏幕空间错误(默认false)
      };
      tileset1 = new Cesium.Cesium3DTileset(tilesetJson);
      // 非异步加载
      // viewer.scene.primitives.add(tileset1)
      // 异步加载
      // tileset1.readyPromise
      //   .then(function (tileset) {
      //     viewer.scene.primitives.add(tileset);
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });

      tileset1.readyPromise
        .then(function (currentModel) {
          const that = this
          var scene = viewer.scene;
          var globe = scene.globe;
          //开启地下可视化
          // scene.screenSpaceCameraController.enableCollisionDetection = false;
          // globe.translucency.frontFaceAlphaByDistance =
          //   new Cesium.NearFarScalar(1000.0, 0.0, 2000.0, 1.0);
          globe.translucency.enabled = true;
          window.tileModel = currentModel;
          scene.globe.depthTestAgainstTerrain = true;
          // viewer.zoomTo(
          //   currentModel,
          //   new Cesium.HeadingPitchRange(-0.5, -0.5, 800)
          // );
          viewer.scene.primitives.add(currentModel);
          console.log(currentModel);
          var boundingSphere = currentModel.boundingSphere;
          var cartographic = Cesium.Cartographic.fromCartesian(
            boundingSphere.center
          );
          //获取模型中心点经纬度坐标
          // that.tileModelTool.longitude =
          //   (cartographic.longitude / Math.PI) * 180;
          // that.tileModelTool.latitude = (cartographic.latitude / Math.PI) * 180;
          // that.tileModelTool.height = cartographic.height;

          // //修改3dtiles位置，input，range组件的change事件绑定此函数
          // that.update3dtilesMaxtrix();

          //模型点击事件
          // attachTileset(viewer, currentModel);
          // that.tileModelToolVisiable = true; //显示3dtiles调整工具
        })
        .catch(function (error) {
          console.error('倾斜摄影模型加载失败：', error);
        });

      viewer.flyTo(tileset1);
      // viewerEye.flyTo(tileset1)
      // console.log('tileset1: ', tileset1)
      tileset1.allTilesLoaded.addEventListener(function () {
        console.log("模型已经全部加载完成");
      });
    },

    BAIMOEdit() {
      // 非异步加载3DTitle，并设置渐变光环
      // var tilesetBaimo = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      //   url: BAIMO3DTILES
      // }))

      // 异步加载
      const tilesetJson = {
        url: BAIMO3DTILES,
      };
      const height = 430;
      tilesetBaimo = new Cesium.Cesium3DTileset(tilesetJson);
      tilesetBaimo.readyPromise
        .then(function (tileset) {
          viewer.scene.primitives.add(tileset, 1);
          // 白膜高度抬升
          var boundingSphere = tileset.boundingSphere;
          var cartographic = Cesium.Cartographic.fromCartesian(
            boundingSphere.center
          );
          var surface = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0
          );
          var offset = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            height
          );
          const translation = Cesium.Cartesian3.subtract(
            offset,
            surface,
            new Cesium.Cartesian3()
          );
          tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        })
        .otherwise(function (error) {
          console.log(error);
        });
      tilesetBaimo.tileVisible.addEventListener(function (tile) {
        const content = tile.content;
        const featuresLength = content.featuresLength;
        let feature;
        for (var i = 0; i < featuresLength; i += 2) {
          feature = content.getFeature(i);
          const _model = feature.content._model;
          _model._shouldRegenerateShaders = true;
          // getOwnPropertyNames:返回指定对象的所有自身属性的属性名组成的数组
          // forEach：对数组里的所有元素都执行一遍
          // Object.keys：返回
          Object.getOwnPropertyNames(_model._sourcePrograms).forEach(function (
            j
          ) {
            const _modelSourceP = _model._sourcePrograms[0];
            _model._rendererResources.sourceShaders[
              _modelSourceP.fragmentShader
            ] = `
     varying vec3 v_positionEC;
     void main(void){
       vec4 position = czm_inverseModelView * vec4(v_positionEC,1); // 位置
       float glowRange = 120.78; // 光环的移动范围(高度)
       gl_FragColor = vec4(0.0, 0.3, 0.8, 0.8); // 颜色
       
       // 小于20米的低楼都不再变暗
       if(position.y > 31.0) {
         gl_FragColor *= vec4(vec3(position.y / 31.0), 0.8); // 渐变
       }
       
       // 动态光环
       float time = fract(czm_frameNumber / 360.0);
       time = abs(time - 0.5) * 3.0;
       float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));
       gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
     }
     `;
          });
          _model._shouldRegenerateShaders = true;
        }
      });
      viewer.flyTo(tilesetBaimo);
    },
    // 立体向上泛光效果
    wllUp() {
      var positions = Cesium.Cartesian3.fromDegreesArrayHeights([
        121.0, 31.25, 200000.0, 120.78, 31.25, 200000.0, 120.78, 31.0, 200000.0,
        121.0, 31.0, 200000.0, 121.0, 31.25, 200000.0,
      ]);
      let num = 20;
      let alp = 1;
      const speed = 0.006;
      const color = Cesium.Color.RED;
      // 绘制墙体
      viewer.entities.add({
        name: "立体墙效果",
        wall: {
          positions: this.wallPosition1,
          // 设置高度
          maximumHeights: new Array(this.wallPosition1.length).fill(700),
          minimunHeights: new Array(this.wallPosition1.length).fill(200),
          // 扩散墙材质
          material: new WallDiffuseMaterialProperty({
            // color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
            color: new Cesium.CallbackProperty(function () {
              if (num % 2 === 0) {
                alp -= speed;
              } else {
                alp += speed;
              }

              if (alp <= 0.1) {
                num++;
              } else if (alp >= 1) {
                num++;
              }
              return color.withAlpha(alp);
            }, false),
          }),
          //     material: new Cesium.ImageMaterialProperty({
          //       image: '/static/texture/fence.png',
          //       transparent: true,
          //       color: new Cesium.CallbackProperty(function () {
          //         if ((num % 2) === 0) {
          //           alp -= speed
          //         } else {
          //           alp += speed
          //         }

          //         if (alp <= 0.1) {
          //           num++
          //         } else if (alp >= 1) {
          //           num++
          //         }
          //         return color.withAlpha(alp)
          //       }, false)
          //     })
        },
      });
      // viewer.zoomTo(viewer.entities)
    },
    wallCustom() {
      const material = new WallLinkCustomMaterialProperty({
        image: "/static/texture/color3.png",
        freely: "vertical",
        direction: "+",
        count: 5,
        color: Cesium.Color.BLUE,
        duration: 2000,
      });
      const material2 = new WallLinkCustomMaterialProperty({
        image: "/static/texture/test1.png",
        freely: "cross",
        direction: "+",
        count: 0.0,
        color: Cesium.Color.BLUE,
        duration: 2000,
      });
      // var positions1 = Cesium.Cartesian3.fromDegreesArrayHeights([
      //   104.07263175401185, 30.647622150198725, 1500.0,
      //   104.06369117158526, 30.648834374000277, 1500.0,
      //   104.06437182811021, 30.62274533905387, 1500.0,
      //   104.07463538167119, 30.62285687644371, 1500.0,
      //   104.07263175401185, 30.647622150198725, 1500.0

      // ])
      // var position2 = Cesium.Cartesian3.fromDegreesArrayHeights([
      //   104.09816110606057, 30.659821965447698, 200.0,
      //   104.1120972824757, 30.65330300319938, 200.0,
      //   104.10758419863926, 30.64592470850288, 200.0,
      //   104.09351691196979, 30.652434826507452, 200.0,
      //   104.09816110606057, 30.659821965447698, 200.0
      // ])
      const entity1 = viewer.entities.add({
        name: "aaaaa",
        wall: {
          //     positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          //       104.07263175401185, 30.647622150198725, 1500.0,
          //       104.06369117158526, 30.648834374000277, 1500.0,
          //       104.06437182811021, 30.62274533905387, 1500.0,
          //       104.07463538167119, 30.62285687644371, 1500.0,
          //       104.07263175401185, 30.647622150198725, 1500.0

          //     ]),
          positions: this.wallPosition1,
          disableDepthTestDistance: 50000,
          // 设置高度
          maximumHeights: new Array(this.wallPosition1.length).fill(700),
          minimunHeights: new Array(this.wallPosition1.length).fill(200),
          material: material2,
        },
      });
      const entity2 = viewer.entities.add({
        name: "aaaaaa",
        wall: {
          //     positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          //       104.09816110606057, 30.659821965447698, 200.0,
          //       104.1120972824757, 30.65330300319938, 200.0,
          //       104.10758419863926, 30.64592470850288, 200.0,
          //       104.09351691196979, 30.652434826507452, 200.0,
          //       104.09816110606057, 30.659821965447698, 200.0
          //     ]),
          positions: this.wallPosition2,
          // 设置高度
          maximumHeights: new Array(this.wallPosition2.length).fill(700),
          minimunHeights: new Array(this.wallPosition2.length).fill(200),
          material: material,
        },
      });
      // viewer.zoomTo(viewer.entities)
    },
    /**
     * 初始化上下文
     * @param {viewer} viewer 视图
     */
    visibilityTwoPoints(viewer) {
      const pointVisible = new Visibility(viewer);
    },
    /* Cesium修改地图颜色代码(暗色电子地图) */
    modifyMap(viewer) {
      // 获取地图影像图层
      const baseLayer = viewer.imageryLayers.get(0);
      // 设置两个变量，用来判断是否进行颜色的翻转和过滤
      const options = {
        invertColor: true,
        filterRGB: [0, 50, 100],
      };
      // 更改地图着色器代码
      const baseFragShader =
        viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;
      for (let i = 0; i < baseFragShader.length; i++) {
        // console.log(baseFragShader[i])
        // console.log('------')

        const strS =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";
        let strT =
          "color = czm_saturation(color, textureSaturation);\n#endif\n";
        if (options.invertColor) {
          strT += `
      color.r = 1.0 - color.r;
      color.g = 1.0 - color.g;
      color.b = 1.0 - color.b;
      `;
        }
        if (options.filterRGB.length > 0) {
          strT += `
      color.r = color.r * ${options.filterRGB[0]}.0/255.0;
      color.g = color.g * ${options.filterRGB[1]}.0/255.0;
      color.b = color.b * ${options.filterRGB[2]}.0/255.0;
      `;
        }
        baseFragShader[i] = baseFragShader[i].replace(strS, strT);
      }
    },
    // 获取当前相机视角内的图幅范围
    getCurrentExtent() {
      // 范围对象
      var extent = {};

      // 得到当前三维场景
      var scene = viewer.scene;

      // 得到当前三维场景的椭球体
      var ellipsoid = scene.globe.ellipsoid;
      var canvas = scene.canvas;

      // canvas左上角
      var car3_lt = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(0, 0),
        ellipsoid
      );

      // canvas右下角
      var car3_rb = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(canvas.width, canvas.height),
        ellipsoid
      );

      // 当canvas左上角和右下角全部在椭球体上
      if (car3_lt && car3_rb) {
        var carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
        var carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
        extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
        extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
        extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
        extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
      }

      // 当canvas左上角不在但右下角在椭球体上
      else if (!car3_lt && car3_rb) {
        var car3_lt2 = null;
        var yIndex = 0;
        do {
          // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
          yIndex <= canvas.height ? (yIndex += 10) : canvas.height;
          car3_lt2 = viewer.camera.pickEllipsoid(
            new Cesium.Cartesian2(0, yIndex),
            ellipsoid
          );
        } while (!car3_lt2);
        var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt2);
        var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb);
        extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
        extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
        extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
        extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
      }

      // 获取高度
      extent.height = Math.ceil(viewer.camera.positionCartographic.height);
      // 获取当前缩放的地图层级
      let level = 0;
      if (viewer.scene.globe._surface._tilesToRender.length) {
        level = viewer.scene.globe._surface._tilesToRender[0].level;
        console.log("当前地图层级=======", level);
      }
      console.log(
        "地图变化监听事件",
        extent,
        (extent.xmin + extent.xmax) / 2,
        (extent.ymax + extent.ymin) / 2
      );
    },
    /* 批量处理gltf或glb格式模型 */
    getModelPostInstances(data) {
      var modelPosts = [];

      for (var y = 0; y < data.length; ++y) {
        var longitude = data[y].longitude;
        var latitude = data[y].latitude;
        var height = data[y].height;

        var position = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          height
        );

        var heading = Math.random();
        var pitch = Math.random();
        var roll = Math.random();
        // var scale = ((Math.random() + 1.0) / 4.0) * 100
        var scale = 200000;
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
          position,
          new Cesium.HeadingPitchRoll(heading, pitch, roll)
        );

        Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix);

        modelPosts.push({
          modelMatrix: modelMatrix,
        });
      }

      return modelPosts;
    },
    /* 加载gltf或glb格式模型 */
    addGlbCollection() {
      for (let i = 0; i < 1; i++) {
        var longitude = 108.841552734374 + Math.random() * (150 - 124.25); // [124.25,150)
        var latitude = 27.8779283336792 + Math.random() * (60 - 28);
        var height = 100 + Math.random() * (5000 - 100);
        // var longitude = 108.05914487576968 // [124.25,150)
        // var latitude = 27.67106595138396
        // var height = 50
        var ccord = { longitude, latitude, height };
        this.coordiatesArr.push(ccord);
      }
      // console.log(this.coordiatesArr)
      var modelInstances = this.getModelPostInstances(this.coordiatesArr);
      console.log(modelInstances);
      var instanceCollection = scene.primitives.add(
        new Cesium.ModelInstanceCollection({
          url: "/static/gltf/Cesium_Man.glb",

          instances: modelInstances,
        })
      );
      console.log(instanceCollection);
      // // 获取模型包围盒
      // var boundingSphere = instanceCollection._boundingSphere
      // var center = boundingSphere.center
      // var radius = boundingSphere.radius

      // // 计算模型包围盒的四个角点坐标
      // var positions = []
      // positions.push(center.x - radius, center.y - radius, center.z)
      // positions.push(center.x + radius, center.y - radius, center.z)
      // positions.push(center.x + radius, center.y + radius, center.z)
      // positions.push(center.x - radius, center.y + radius, center.z)

      // // 将四个角点坐标转换为经纬度高程坐标
      // var cartographicPositions = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions)

      // // 采样地形高程数据
      // Cesium.when(Cesium.sampleTerrainMostDetailed(scene.terrainProvider, cartographicPositions), function (updatedPositions) {
      //   // 更新模型矩阵，使其贴合地形
      //   var height = updatedPositions[0].height
      //   var translation = Cesium.Cartesian3.fromRadians(updatedPositions[0].longitude,
      //     updatedPositions[0].latitude, height)
      //   var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(90)))
      //   var rotationY = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(-90)))
      //   var m = Cesium.Matrix4.multiply(rotationX, rotationY, new Cesium.Matrix4())
      //   instanceCollection.modelMatrix = Cesium.Matrix4.multiplyByTranslation(m, translation, new Cesium.Matrix4())
      // })
    },
  },
};
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
</style>

<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-29 10:13:41
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-09-04 17:34:10
-->

<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="lonlataltdiv">
    <LonLatAltVue ref="sonInit"></LonLatAltVue>
  </div>
</template>

<script setup>
import * as Cesium from "cesium";
import LonLatAltVue from "./LonLatAlt.vue";
import * as turf from "@turf/turf";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  reactive,
  defineEmits,
  defineProps,
  defineExpose,
} from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import CesiumContainer from "@/views/CesiumContainer.vue";
import {
  LOCAL_IMG_URL,
  LOCAL_TERRAIN_URL,
  DAYANTA3DTILES,
  BAIMO3DTILES,
  GAODE_IMG_URL,
} from "../../../commonJS/config.js";
import {
  createGroudRegon,
  createDynamincWater,
  createGLTFModel,
  creatGateNumNote,
  addLineGround,
  createUpDownNote,
  createDuanMianNote,
  createBillboardEntity,
} from "./mapjs/entityprimitiveOperation.js";
import {
  CeateRainEffect,
  CeateSnowEffect,
  CeateFogEffect,
} from "./mapjs/weather.js";
import { createWaterFlowPartical } from "./mapjs/waterflow.js";
import PolylineTrailLinkMaterialProperty from "./mapjs/PolylineTrailLinkMaterialProperty.js";
import WaterPrimitive from "./mapjs/WaterPrimitive.js";
import riverRegon2 from "./riverRegon2.json";
import river from "./river.json";
import changjingline from "./changjiangline1.json";
import riverGroundUrl from "./changjiangriver_FeaturesToJS.json";
//导入图片
import labelbgcimg from "../../../../../public/static/texture/waterspeed.png";
import shangxiayou from "../../../../../public/static/texture/shangxiayou.png";
import videopng from "../../../../../public/static/texture/camera.png";
import smokepng from "../../../../../public/static/texture/smoke.png";
import waterflowpng from "../../../../../public/static/texture/water3(1).png";
// import DamURL from '../../../../../public/static/gltf/dam/34-3/1.gltf';
const emits = defineEmits([
  "GatesLoaded",
  "waterLevelLoaded",
  "cameramodelloaded",
]);

// export default defineComponent({
// components: { CesiumContainer, ElMessage },
// setup() {
const store = useStore();
// 摄像头
let videoInfo = reactive({
  positions: [
    {
      pos: {
        lon: 108.999967,
        lat: 30.937239,
        alt: 330,
        pitch: 0,
        roll: 0,
        heading: 110,
      },
      name: "1号监控",
      scale: 1,
      // modelurl: 'src/assets/models/sxt_out/sxt.gltf',
      modelurl: "static/gltf/dam/sxt_out/sxt.gltf",
    },
    {
      pos: {
        lon: 109.00183,
        lat: 30.933419,
        alt: 354,
        pitch: 0,
        roll: 0,
        heading: -50,
      },
      name: "2号监控",
      scale: 1,
      // modelurl: 'src/assets/models/sxt_out/sxt.gltf',
      modelurl: "static/gltf/dam/sxt_out/sxt.gltf",
    },
  ],
});
//定义属性
const viewTarget = {
  lon: 109.08,
  lat: 30.94,
  alt: 3000,
  heading: -90.0, // east, default value is 0.0 (north)
  pitch: -20, // default value (looking down)
  roll: 0.0, // default value
};
let viewModel = reactive({
  emissionRate: 20.0,
  gravity: -9.8,
  minimumParticleLife: 2,
  maximumParticleLife: 7,
  minimumSpeed: 25.0,
  maximumSpeed: 30.5,
  startScale: 10.0,
  endScale: 20.0,
  particleSize: 2.0,
  hpr: null,
  translation: null,
  rotation: null,
  trs: null,
  emitterModelMatrix: null,
  gravityScratch: null,
  emitterSystem: null,
});
let gates = reactive({
  _gateNoteEntity: {},
});
let liuyuInfo = reactive({
  _ganliuURL: "/api/digitaldata/geojson/changjiangline1.json",
  _entities: [],
});
let duanmianInfo = reactive({
  _upLabel: null,
  _downLabel: null,
  _upwaterLevelEntity: null,
  _downWaterLevelEntity: null,
  _upbasewaterLevel: 243,
  _upbasewaterSpeed: 2,
  _upbasewaterLevelMatrix: null,
  _downbaseWaterLevel: 175,
  _downbaseWaterSpeed: 5,
  _downbaseWaterLevelMatrix: null,
  _upLabelText: "",
  _downLabelText: "",
});
let waterFlow = reactive({
  _waterFolows: [],
  _params: [
    {
      name: "4号闸门",
      lon: 109.000863,
      lat: 30.935213,
      alt: 298.7,
      heading: -80,
      emissionRate: 20,
      minlife: 2,
      maxlife: 7,
      startscale: 10,
      endscale: 20,
      size: 2,
      minspeed: 25,
      maxspeed: 30,
    },
    {
      name: "3号闸门",
      lon: 109.000863,
      lat: 30.935663,
      alt: 298.7,
      heading: -80,
      emissionRate: 20,
      minlife: 2,
      maxlife: 7,
      startscale: 10,
      endscale: 20,
      size: 2,
      minspeed: 25,
      maxspeed: 30,
    },
    {
      name: "2号闸门",
      lon: 109.000863,
      lat: 30.936113,
      alt: 298.7,
      heading: -80,
      emissionRate: 20,
      minlife: 2,
      maxlife: 7,
      startscale: 10,
      endscale: 20,
      size: 2,
      minspeed: 25,
      maxspeed: 30,
    },
    {
      name: "1号闸门",
      lon: 109.000863,
      lat: 30.936553,
      alt: 298.7,
      heading: -80,
      emissionRate: 20,
      minlife: 2,
      maxlife: 7,
      startscale: 10,
      endscale: 20,
      size: 2,
      minspeed: 25,
      maxspeed: 30,
    },
    {
      name: "8号闸门",
      lon: 109.000863,
      lat: 30.935213,
      alt: 216.7,
      heading: -80,
      emissionRate: 30,
      minlife: 2,
      maxlife: 3,
      startscale: 5,
      endscale: 15,
      size: 2,
      minspeed: 30,
      maxspeed: 40,
    },
    {
      name: "7号闸门",
      lon: 109.000863,
      lat: 30.935663,
      alt: 216.7,
      heading: -80,
      emissionRate: 30,
      minlife: 2,
      maxlife: 3,
      startscale: 5,
      endscale: 15,
      size: 2,
      minspeed: 30,
      maxspeed: 40,
    },
    {
      name: "6号闸门",
      lon: 109.000863,
      lat: 30.936113,
      alt: 216.7,
      heading: -80,
      emissionRate: 30,
      minlife: 2,
      maxlife: 3,
      startscale: 5,
      endscale: 15,
      size: 2,
      minspeed: 30,
      maxspeed: 40,
    },
    {
      name: "5号闸门",
      lon: 109.000863,
      lat: 30.936553,
      alt: 216.7,
      heading: -80,
      emissionRate: 30,
      minlife: 2,
      maxlife: 3,
      startscale: 5,
      endscale: 15,
      size: 2,
      minspeed: 30,
      maxspeed: 40,
    },
  ],
});
let senceInfo = reactive({
  _viewer: null, //创建的viewer 实例
  _Cesium: null, //cesium 类
  _riverGroundUrl: "/api/digitaldata/geojson/changjiangriver_FeaturesToJS.json",
  _dynamicWaterURL: "/api/digitaldata/geojson/riverRegon2.json",
  // _DamURL: "src/assets/models/34-3/1.gltf",
  _DamURL: "http://localhost:6060/Data/gltf/dam/34-3/1.gltf",
  // _sluiceGatesURL: [
  //   "src/assets/models/sluicegates/5.gltf",
  //   "src/assets/models/sluicegates/6.gltf",
  //   "src/assets/models/sluicegates/7.gltf",
  //   "src/assets/models/sluicegates/8.gltf",
  //   "src/assets/models/sluicegates/1.gltf",
  //   "src/assets/models/sluicegates/2.gltf",
  //   "src/assets/models/sluicegates/3.gltf",
  //   "src/assets/models/sluicegates/4.gltf",
  // ],
  _sluiceGatesURL: [
    "http://localhost:6060/Data/gltf/dam/sluicegates/5.gltf",
    "http://localhost:6060/Data/gltf/dam/sluicegates/6.gltf",
    "http://localhost:6060/Data/gltf/dam/sluicegates/7.gltf",
    "http://localhost:6060/Data/gltf/dam/sluicegates/8.gltf",
    "http://localhost:6060/Data/gltf/dam/sluicegates/1.gltf",
    "http://localhost:6060/Data/gltf/dam/sluicegates/2.gltf",
    "http://localhost:6060/Data/gltf/dam/sluicegates/3.gltf",
    "http://localhost:6060/Data/gltf/dam/sluicegates/4.gltf",
  ],
  _sluiceGatesName: [
    "sluicegate-bottom1",
    "sluicegate-bottom2",
    "sluicegate-bottom3",
    "sluicegate-bottom4",
    "sluicegate-top1",
    "sluicegate-top2",
    "sluicegate-top3",
    "sluicegate-top4",
  ],
  _sluicegateEntities: {},
  _damPosition: {
    lon: 109.007,
    lat: 30.929,
    alt: 170,
    pitch: 0,
    roll: 0,
    heading: -87,
  },
  _gatedelt: 0,
  _gateMovestatus: "Down",
  _waterParticleSystem: null,
  _dynamicwaterprimi: [],
});
let weatherInfo = reactive({
  _rainSize: 200,
  _weatherObj: {},
});
// let emits = defineEmits([
//   "GatesLoaded",
//   "waterLevelLoaded",
//   "cameramodelloaded",
// ]);
const sonInit = ref(null);
/**
 * @author:
 * @Date: 2022-04-11 16:44:02
 * @note: 注意事项
 * @description: 绘制范围
 */
const drawDam = () => {
  const { viewer } = store.state;
  viewer.shouldAnimate = true;
  // loadLayers(viewer);
  const position = {
	x: 109.007,
	y: 30.929,
	z: 175
};
createWaterSystem(position);
};
// 创建粒子系统
const createWaterSystem = (position) => {
  const { viewer } = store.state;
    var gatePosition = Cesium.Cartesian3.fromRadians(position.x, position.y, position.z);;
    var hole = viewer.entities.add({ position: gatePosition });;
    var waterParticleSystem = new Cesium.ParticleSystem({
        //这里需要改为自己的图片路径
        image: smokepng,
        startColor: Cesium.Color.WHITE.withAlpha(0.0),
        endColor: Cesium.Color.WHITE.withAlpha(0.65),
        startScale: 10,
        endScale: 10,
        minimumParticleLife: 1.5,
        maximumParticleLife: 1.7,
        minimumSpeed: 1.5,
        maximumSpeed: 2.5,
        imageSize: new Cesium.Cartesian2(3, 3),
        emissionRate: 20,
        emitter: new Cesium.CircleEmitter(10.0),
        // emitter: new Cesium.BoxEmitter(new Cesium.Cartesian3(20.0, 5.0, 5.0)),
        modelMatrix: computeModelMatrix(hole),
        emitterModelMatrix: computeEmitterModelMatrix(...[65, 0, 0]),
        updateCallback: updateCallback,
    });
    // 将粒子系统添加到场景中
    viewer.scene.primitives.add(waterParticleSystem);
};
const computeModelMatrix = (entity) => {
    var position = Cesium.Property.getValueOrUndefined(entity.position);
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    return modelMatrix;
};
// 计算粒子发射器的位置姿态
const computeEmitterModelMatrix = (heading, pitch, roll) => {
    let hpr = Cesium.HeadingPitchRoll.fromDegrees(heading, pitch, roll);
    let trs = new Cesium.TranslationRotationScale();
    trs.translation = Cesium.Cartesian3.fromElements(0, 0, 0);
    trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr);
    let Matrix4 = Cesium.Matrix4.fromTranslationRotationScale(trs);
    return Matrix4
};
// 更新粒子运动状态
const updateCallback = (p, dt) => {
    var gravityScratch = new Cesium.Cartesian3();
    var position = p.position;
    Cesium.Cartesian3.normalize(position, gravityScratch);
    Cesium.Cartesian3.fromElements(
        20 * dt,
        gravityScratch.y * dt,
        -30 * dt,
        gravityScratch
    );
    p.velocity = Cesium.Cartesian3.add(
        p.velocity,
        gravityScratch,
        p.velocity
    );
};
//初始化地图图层
const loadLayers = (viewer) => {
  initParticalparam();
  //初始化子组件
  initSonVue(viewer, Cesium);
  //添加河流数据 贴地
  loadDynamicWater(viewer, Cesium);
  // //添加动态水面
  // //  window._viewer.zoomTo(tem)
  // //  console.log( Cesium.Material._materialCache);
  loadDynamingroundWater(viewer, Cesium);
  // //加载大坝
  loadDam(viewer, senceInfo._damPosition);
  // //加载闸门
  loadGates(senceInfo._damPosition, viewer);
  // //开闸水流
  // createwaterflow(viewer, Cesium);

  // //添加断面线
  addDuanMianline(viewer);
  // //上下游标注
  addUpDownLabel(viewer);
  // //添加标签
  // //  addGatesName(viewer, Cesium);

  // //添加摄像头
  AddCameras(viewer, Cesium);
  // // 添加 水域数据
  // // addLiuYuData(viewer, Cesium);

  setWeatherVisible(viewer, {});
};
const initParticalparam = () => {
  viewModel.hpr = new Cesium.HeadingPitchRoll();
  viewModel.translation = new Cesium.Cartesian3();
  viewModel.rotation = new Cesium.Quaternion();
  viewModel.trs = new Cesium.TranslationRotationScale();
  viewModel.emitterModelMatrix = new Cesium.Matrix4();
  viewModel.gravityScratch = new Cesium.Cartesian3();
};
const initSonVue = (viewer) => {
  sonInit.value.sonInit(viewer);
};
const loadDynamicWater = (viewer) => {
  // Http.get(senceInfo._riverGroundUrl).then(response => {
  //   response.data.features.forEach(element => {
  //     if (element.geometry.type == 'MultiPolygon') {
  //       element.geometry.coordinates.forEach(ele => {
  //         if (ele.length > 1) {
  //           ele.forEach(ele1 => {
  //             var primitive = createGroudRegon(ele1.flat(), Cesium.Color.fromCssColorString("#433d96"), Cesium);

  //             viewer.scene.primitives.add(primitive);
  //           });
  //         } else if (ele.length == 1) {
  //           var primitive = createGroudRegon(ele[0].flat(), Cesium.Color.fromCssColorString("#433d96"), Cesium);
  //           viewer.scene.primitives.add(primitive);
  //         }
  //       });
  //     }
  //     if (element.geometry.type == 'Polygon') {
  //       var primitive = createGroudRegon(element.geometry.coordinates[0].flat(), Cesium.Color.fromCssColorString("#433d96"), Cesium);
  //       viewer.scene.primitives.add(primitive);
  //     }
  //   });
  // });
  riverGroundUrl.features.forEach((element) => {
    if (element.geometry.type == "MultiPolygon") {
      element.geometry.coordinates.forEach((ele) => {
        if (ele.length > 1) {
          ele.forEach((ele1) => {
            var primitive = createGroudRegon(
              ele1.flat(),
              Cesium.Color.fromCssColorString("#433d96"),
              Cesium
            );

            viewer.scene.primitives.add(primitive);
          });
        } else if (ele.length == 1) {
          var primitive = createGroudRegon(
            ele[0].flat(),
            Cesium.Color.fromCssColorString("#433d96"),
            Cesium
          );
          viewer.scene.primitives.add(primitive);
        }
      });
    }
    if (element.geometry.type == "Polygon") {
      var primitive = createGroudRegon(
        element.geometry.coordinates[0].flat(),
        Cesium.Color.fromCssColorString("#433d96"),
        Cesium
      );
      viewer.scene.primitives.add(primitive);
    }
  });
};
const loadDynamingroundWater = (viewer) => {
  // Http.get(senceInfo._dynamicWaterURL).then(response => {
  //   response.data.features.forEach((element, index) => {
  //     if (element.geometry.type == 'Polygon') {
  //       var poses = [];
  //       element.geometry.coordinates[0].forEach(pos => {
  //         poses.push(pos[0]);
  //         poses.push(pos[1]);
  //       });
  //       if (index == 1) {

  //         var water = new WaterPrimitive({ positions: Cesium.Cartesian3.fromDegreesArray(poses), height: 0, extrudedHeight: duanmianInfo._upbasewaterLevel, alpha: 0.5 })
  //         viewer.scene.primitives.add(water)
  //         duanmianInfo._upwaterLevelEntity = water;
  //       } else if (index == 0) {

  //         var water = new WaterPrimitive({ positions: Cesium.Cartesian3.fromDegreesArray(poses), height: 0, extrudedHeight: duanmianInfo._downbaseWaterLevel, alpha: 0.5 })
  //         viewer.scene.primitives.add(water)
  //         duanmianInfo._downWaterLevelEntity = water;

  //       }
  //     }
  //   });

  //   //向父级发送信号
  //   emits('waterLevelLoaded', {
  //     upWater: { entity: duanmianInfo._upwaterLevelEntity, baseLevel: duanmianInfo._upbasewaterLevel },
  //     downWater: { entity: duanmianInfo._downWaterLevelEntity, baseLevel: duanmianInfo._downbaseWaterLevel }
  //   });
  // });

  riverRegon2.features.forEach((element, index) => {
    if (element.geometry.type == "Polygon") {
      var poses = [];
      element.geometry.coordinates[0].forEach((pos) => {
        poses.push(pos[0]);
        poses.push(pos[1]);
      });
      if (index == 1) {
        console.log(poses);
        // var water = new WaterPrimitive({ positions: Cesium.Cartesian3.fromDegreesArray(poses), height: 0, extrudedHeight: duanmianInfo._upbasewaterLevel, alpha: 0.5, scene: viewer.scene })
        var water = new WaterPrimitive({
          positions: Cesium.Cartesian3.fromDegreesArray(poses),
          height: 0,
          extrudedHeight: duanmianInfo._upbasewaterLevel,
          alpha: 0.5,
        });
        viewer.scene.primitives.add(water);
        duanmianInfo._upwaterLevelEntity = water;
      } else if (index == 0) {
        // var water = new WaterPrimitive({ positions: Cesium.Cartesian3.fromDegreesArray(poses), height: 0, extrudedHeight: duanmianInfo._downbaseWaterLevel, alpha: 0.5, scene: viewer.scene })
        var water = new WaterPrimitive({
          positions: Cesium.Cartesian3.fromDegreesArray(poses),
          height: 0,
          extrudedHeight: duanmianInfo._downbaseWaterLevel,
          alpha: 0.5,
        });
        viewer.scene.primitives.add(water);
        duanmianInfo._downWaterLevelEntity = water;
      }
    }
  });

  //向父级发送信号
  emits("waterLevelLoaded", {
    upWater: {
      entity: duanmianInfo._upwaterLevelEntity,
      baseLevel: duanmianInfo._upbasewaterLevel,
    },
    downWater: {
      entity: duanmianInfo._downWaterLevelEntity,
      baseLevel: duanmianInfo._downbaseWaterLevel,
    },
  });
};
const addLiuYuData = (viewer) => {
  //   Http.get(liuyuInfo._ganliuURL).then(response => {

  //    response.data.features.forEach(feature => {
  //       //添加高度
  //       var poesheight=[]
  //       feature.geometry.coordinates.forEach(ele=>{
  //        poesheight.push(ele[0]);
  //        poesheight.push(ele[1]);
  //        poesheight.push(400);
  //       })
  //      var tempPoints = Cesium.Cartesian3.fromDegreesArrayHeights(poesheight)
  //              var entity = viewer.entities.add({
  //          polyline: {
  //            positions: tempPoints,
  //            width: 20,
  //            material: new PolylineTrailLinkMaterialProperty(Cesium.Color.WHITE , waterflowpng, 2000),
  //            // clampToGround: true,
  //          }
  //        });

  //        liuyuInfo._entities.push(entity)
  //    })
  //  })

  changjingline.features.forEach((feature) => {
    //添加高度
    var poesheight = [];
    feature.geometry.coordinates.forEach((ele) => {
      poesheight.push(ele[0]);
      poesheight.push(ele[1]);
      poesheight.push(400);
    });
    var tempPoints = Cesium.Cartesian3.fromDegreesArrayHeights(poesheight);
    var entity = viewer.entities.add({
      polyline: {
        positions: tempPoints,
        width: 20,
        material: new PolylineTrailLinkMaterialProperty(
          Cesium.Color.WHITE,
          waterflowpng,
          2000
        ),
        // clampToGround: true,
      },
    });

    liuyuInfo._entities.push(entity);
  });
};
const addGatesName = (viewer, Cesium) => {
  // var names = ['1号', '2号', '3号', '4号', '溢1号', '溢2号', '溢3号', '溢4号', '5号', '6号', '7号', '8号'];
  // var positiones = [
  //   [109.000513, 30.936761, 305.25],
  //   [109.000513, 30.936314, 305.25],
  //   [109.000513, 30.935872, 305.25],
  //   [109.000513, 30.935416, 305.25],
  //   [109.000513, 30.936761, 322.33],
  //   [109.000513, 30.936314, 322.33],
  //   [109.000513, 30.935872, 322.33],
  //   [109.000513, 30.935416, 322.33],
  //   [109.000513, 30.936761, 228.25],
  //   [109.000513, 30.936314, 228.25],
  //   [109.000513, 30.935872, 228.25],
  //   [109.000513, 30.935416, 228.25]
  // ];

  var names = ["溢1号", "溢2号", "溢3号", "溢4号"];
  var positiones = [
    [109.000513, 30.936761, 322.33],
    [109.000513, 30.936314, 322.33],
    [109.000513, 30.935872, 322.33],
    [109.000513, 30.935416, 322.33],
  ];

  names.forEach((name, index) => {
    var gamenoteentity = creatGateNumNote(
      { position: positiones[index], text: name },
      Cesium
    );
    gates._gateNoteEntity[name] = gamenoteentity;
    viewer.entities.add(gamenoteentity);
  });
};
const loadDam = (viewer, position) => {
  var privi = createGLTFModel(senceInfo._DamURL, position, {
    x: 1,
    y: 2,
    z: 1,
  });
  viewer.scene.primitives.add(privi);
};
const loadGates = (position, viewer) => {
  senceInfo._sluiceGatesURL.forEach((url, index) => {
    var privi = createGLTFModel(url, position, { x: 1, y: 2, z: 1 });
    senceInfo._sluicegateEntities[senceInfo._sluiceGatesName[index]] = privi;
    viewer.scene.primitives.add(privi);
  });
  emits("GatesLoaded", { primitivesmap: senceInfo._sluicegateEntities });
};
const addDuanMianline = (viewer) => {
  var lineup = [108.996569, 30.93908, 108.996555, 30.931595];
  var linedown = [109.004309, 30.940211, 109.004338, 30.932114];
  var lineupEntity = addLineGround(
    {
      name: "lineup",
      positions: lineup,
      color: Cesium.Color.BLUE.withAlpha(0.5),
      height: 260,
    },
    Cesium
  );
  viewer.entities.add(lineupEntity);
  var linedwonEntity = addLineGround(
    {
      name: "linedwon",
      positions: linedown,
      color: Cesium.Color.BLUE.withAlpha(0.5),
      height: 200,
    },
    Cesium
  );
  viewer.entities.add(linedwonEntity);

  var downpos = [
    (linedown[0] + linedown[2]) / 2,
    (linedown[1] + linedown[3]) / 2,
    260,
  ];
  var uppos = [(lineup[0] + lineup[2]) / 2, (lineup[1] + lineup[3]) / 2, 260];
  var uplabel = createDuanMianNote(
    { name: "uplabel", text: "", url: labelbgcimg, position: uppos },
    viewer,
    Cesium
  );
  duanmianInfo._upLabel = uplabel;
  duanmianInfo._upLabel.label.text = new Cesium.CallbackProperty(
    () => duanmianInfo._upLabelText,
    false
  );
  duanmianInfo._upLabelText = `水位：${Number(
    duanmianInfo._upbasewaterLevel
  ).toFixed(2)} m\n \n流速：${Number(duanmianInfo._upbasewaterSpeed).toFixed(
    2
  )} m/s`;
  //new Cesium.CallbackProperty(() => duanmianInfo._upbasewaterLevel, false),
  var downlabel = createDuanMianNote(
    { name: "dwonlabel", text: "", url: labelbgcimg, position: downpos },
    viewer,
    Cesium
  );

  duanmianInfo._downLabel = downlabel;
  duanmianInfo._downLabel.label.text = new Cesium.CallbackProperty(
    () => duanmianInfo._downLabelText,
    false
  );
  duanmianInfo._downLabelText = `水位：${Number(
    duanmianInfo._downbaseWaterLevel
  ).toFixed(2)} m\n \n流速：${Number(duanmianInfo._downbaseWaterSpeed).toFixed(
    2
  )} m/s`;
};
const addUpDownLabel = (viewer) => {
  var downpos = [109.002747, 30.93576, 190];
  var uppos = [108.99783, 30.935026, 260];
  var upnote = createUpDownNote({
    text: "上 游",
    position: uppos,
    url: shangxiayou,
  });
  viewer.entities.add(upnote);
  var downnote = createUpDownNote({
    text: "下 游",
    position: downpos,
    url: shangxiayou,
  });
  viewer.entities.add(downnote);
};
//添加摄像头
const AddCameras = (viewer) => {
  var ids = [];

  videoInfo.positions.forEach((position, index) => {
    var privi = createGLTFModel(position.modelurl, position.pos, {
      x: 20,
      y: 20,
      z: 20,
    });
    viewer.scene.primitives.add(privi);
    var entity = createBillboardEntity(
      {
        pos: {
          lon: position.pos.lon,
          lat: position.pos.lat,
          alt: position.pos.alt + 3,
        },
        url: videopng,
        width: 40,
        height: 40,
        text: position.name,
      },
      viewer
    );
    ids.push(entity.id);
  });
  emits("cameramodelloaded", {
    viewer: viewer,
    Cesium: Cesium,
    entitis: [
      { position: videoInfo.positions[0], id: ids[0] },
      { position: videoInfo.positions[1], id: ids[1] },
    ],
  });
};
const setWeatherVisible = (viewer, param) => {
  //显示雨天
  var type = param.type;
  shutdwonWeather(param.keys);
  if (!weatherInfo._weatherObj[type]) {
    switch (type) {
      case "weather_rain": {
        weatherInfo._weatherObj[type] = CeateRainEffect(viewer, type);
        break;
      }
      case "weather_snow": {
        weatherInfo._weatherObj[type] = CeateSnowEffect(viewer, type);
        break;
      }
      case "weather_fog": {
        weatherInfo._weatherObj[type] = CeateFogEffect(viewer, type);
        break;
      }
      case "shotdown": {
        break;
      }
    }
  } else {
    shutdwonWeather(param.keys);
    console.log((weatherInfo._weatherObj[param.type].enabled = true));
  }
};
//显示天气效果
const shutdwonWeather = (keys) => {
  if (!keys) {
    return;
  }
  keys.forEach((key) => {
    if (weatherInfo._weatherObj[key]) {
      // console.log(weatherInfo._weatherObj[key]);
      weatherInfo._weatherObj[key].enabled = false;
    }
  });
};
const setView = (viewer, param) => {
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(param.lon, param.lat, param.alt),
    orientation: {
      heading: Cesium.Math.toRadians(param.heading), // east, default value is 0.0 (north)
      pitch: Cesium.Math.toRadians(param.pitch), // default value (looking down)
      roll: Cesium.Math.toRadians(param.roll), // default value
    },
  });
};
//更新粒子水流
const updateFlow = (param) => {
  const { viewer } = store.state;
  var particalitem = waterFlow._waterFolows.find(function (item) {
    return item.name == param.param.name;
  });
  var particalparam = waterFlow._params.find(function (paramitem) {
    return paramitem.name == param.param.name;
  });

  //如果不存在则创建
  if (!particalitem) {
    if (!particalparam) {
      return;
    } else {
      const particleSystem = viewer.scene.primitives.add(
        createWaterFlowPartical(smokepng, particalparam, applyGravity)
      );
      particalitem = { name: particalparam.name, partical: particleSystem };
      waterFlow._waterFolows.push(particalitem);
      console.log(particleSystem);
    }
  }

  var changerate =
    Math.abs(Number(param.param.movedelta) * 1.0) /
    Math.abs(Number(param.param.moveMax) * 1.0);
  if (param.param.state == "UP") {
    if (Math.abs(particalitem.partical.emissionRate) < 0.1) {
      viewer.scene.primitives.remove(particalitem.partical);
      particalitem.partical = null;
      removeObjItem(waterFlow._waterFolows, "name", param.param.name);
      return;
    }
  } else if (param.param.state == "DWON") {
    if (particalitem.partical.emissionRate > particalparam.emissionRate) {
      return;
    }
  }
  particalitem.partical.emissionRate = particalparam.emissionRate * changerate;
  particalitem.partical.emissionRate =
    particalitem.partical.emissionRate < 1
      ? 0
      : particalitem.partical.emissionRate;
  particalitem.partical.startScale =
    (1 - (1 - changerate) / 2) * particalparam.startscale;
  particalitem.partical.endScale =
    (1 - (1 - changerate) / 2) * particalparam.endscale;
};
const WatherControlCommnad = (param) => {
  const { viewer } = store.state;
  console.log(param);
  setWeatherVisible(viewer, param);
};
//粒子水流
const createwaterflow = (viewer, Cesium) => {
  //先清空
  waterFlow._waterFolows.forEach((item) => {
    viewer.scene.primitives.remove(item.partical);
    item.partical = null;
  });
  waterFlow._waterFolows = [];
  console.log("createwaterflow");
  waterFlow._params.forEach((element) => {
    const particleSystem = viewer.scene.primitives.add(
      createWaterFlowPartical(smokepng, element, applyGravity)
    );
    waterFlow._waterFolows.push({
      name: element.name,
      partical: particleSystem,
    });
  });
};
const waterFlowOpera = (param) => {
  const { viewer } = store.state;
  if (param.code == "START") {
    //创建水流粒子系统
    createwaterflow(viewer, senceInfo._Cesium);
    //所有闸门降到最低
  } else if (param.code == "END" && waterFlow._waterFolows.length > 0) {
    waterFlow._waterFolows.forEach((element) => {
      viewer.scene.primitives.remove(element.partical);
      element.partical = null;
    });
    waterFlow._waterFolows = [];
  }

  console.log(param);
  if (param.type == "flow_show") {
    if (liuyuInfo._entities.length == 0) {
      addLiuYuData(viewer);
    } else {
      liuyuInfo._entities.forEach((entity) => {
        entity.show = true;
      });
    }
    console.log(duanmianInfo._upwaterLevelEntity);
    duanmianInfo._upwaterLevelEntity._primitive.show = false;
    duanmianInfo._downWaterLevelEntity._primitive.show = false;
  } else if ((param.type = "flow_shutdown")) {
    if (liuyuInfo._entities.length == 0) {
      return;
    } else {
      liuyuInfo._entities.forEach((entity) => {
        entity.show = false;
        duanmianInfo._upwaterLevelEntity._primitive.show = true;
        duanmianInfo._downWaterLevelEntity._primitive.show = true;
      });
    }
  }
};
const applyGravity = (p, dt) => {
  // We need to compute a local up vector for each particle in geocentric space.
  const position = p.position;

  Cesium.Cartesian3.normalize(position, viewModel.gravityScratch);
  Cesium.Cartesian3.multiplyByScalar(
    viewModel.gravityScratch,
    dt * -9.8,
    viewModel.gravityScratch
  );

  p.velocity = Cesium.Cartesian3.add(
    p.velocity,
    viewModel.gravityScratch,
    p.velocity
  );
};
const updateDuanmian = (param) => {
  duanmianInfo._upbasewaterLevel = param.upWaterLevel._currentLevel;
  duanmianInfo._upbasewaterSpeed = param.upWaterLevel._currenSpeed;

  duanmianInfo._downbaseWaterLevel = param.downWaterLevel._currentLevel;
  duanmianInfo._downbaseWaterSpeed = param.downWaterLevel._currenSpeed;
  duanmianInfo._upLabelText = `水位：${Number(
    duanmianInfo._upbasewaterLevel
  ).toFixed(2)} m\n \n 流速：${duanmianInfo._upbasewaterSpeed.toFixed(2)} m/s`;
  duanmianInfo._downLabelText = `水位：${Number(
    duanmianInfo._downbaseWaterLevel
  ).toFixed(2)} m\n \n 流速：${duanmianInfo._downbaseWaterSpeed.toFixed(
    2
  )} m/s`;
};
const createTerrain = () => {
  var terrainProvider = new Cesium.CesiumTerrainProvider({
    // url: viewerInfo.terrainUrl,
    url: 'http://127.0.0.1:8091/api/digitaldata/DEM' //http://localhost:8091是NGINX的地址
  });
  return terrainProvider;
};
const handleClear = () => {
  const { viewer } = store.state;
};
defineExpose({
  updateDuanmian,
  waterFlowOpera,
  updateFlow,
  WatherControlCommnad,
});
onMounted(() => {
  // loadLayers();
  const { viewer } = store.state;
  //设置地形数据
  viewer.terrainProvider = createTerrain();
  //补充17，18层影像数据
  let longqiao = new Cesium.UrlTemplateImageryProvider({
            url: 'http://127.0.0.1:8091/api/digitaldata/dabatiles/{z}/{x}/{y}.png',
            maximumLevel: 18,
            // minimumLevel:17,
            rectangle: Cesium.Rectangle.fromDegrees(108.898756, 30.744637,109.094237, 31.070878)
        });
   viewer.imageryLayers.addImageryProvider(longqiao);
  //初始化地图图层
  loadLayers(viewer);
  //设置相机位置
  setView(viewer, viewTarget);
});
onUnmounted(() => {
  handleClear();
});
// return {
//   handleClear,
//   drawDam,
// };
// },
// });
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

<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-31 14:51:34
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <input
      type="range"
      min="0"
      max="1000"
      value="0"
      class="slider"
      id="slider"
    />
    <el-button @click="drawDam()">添加大坝</el-button>
    <el-button @click="releaseWater()">添加大坝开闸放水</el-button>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  reactive,
  defineEmits,
  defineProps,
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
import WaterPrimitive from "./mapjs/WaterPrimitive.js";
import riverRegon2 from "./riverRegon2.json";
import river from "./river.json";
import changjingline from "./changjiangline1.json";
import riverGroundUrl from "./changjiangriver_FeaturesToJS.json";
//导入图片
import labelbgcimg from '../../../../../public/static/texture/waterspeed.png';
import shangxiayou from '../../../../../public/static/texture/shangxiayou.png';
import videopng from '../../../../../public/static/texture/camera.png';
import smokepng from '../../../../../public/static/texture/smoke.png'
import waterflowpng from'../../../../../public/static/texture/water3(1).png'
// import DamURL from '../../../../../public/static/gltf/dam/34-3/1.gltf';
export default defineComponent({
  components: { CesiumContainer, ElMessage },
  setup() {
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
        heading: 110
      },
      name: '1号监控',
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
        heading: -50
      },
      name: '2号监控',
      scale: 1,
      // modelurl: 'src/assets/models/sxt_out/sxt.gltf',
      modelurl: 'static/gltf/dam/sxt_out/sxt.gltf',
    }
  ]
})
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
    let senceInfo = reactive({
      _viewer: null, //创建的viewer 实例
      _Cesium: null, //cesium 类
      _riverGroundUrl:
        "/api/digitaldata/geojson/changjiangriver_FeaturesToJS.json",
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
    let emits = defineEmits([
      "GatesLoaded",
      "waterLevelLoaded",
      "cameramodelloaded",
    ]);
    const sonInit = ref(null);
    /**
     * @author:
     * @Date: 2022-04-11 16:44:02
     * @note: 注意事项
     * @description: 绘制范围
     */
    const drawDam = () => {
      const { viewer } = store.state;
      loadLayers(viewer);
      // // 开启深度检测
      // viewer.scene.globe.depthTestAgainstTerrain = true;
      // // 创建一个矩形实体（表示闸门）
      // const rectangle = viewer.entities.add({
      //   name: "Gate",
      //   rectangle: {
      //     coordinates: Cesium.Rectangle.fromDegrees(115.0, 39.0, 117.0, 41.0),
      //     material: Cesium.Color.RED.withAlpha(0.5),
      //     outline: true,
      //     outlineColor: Cesium.Color.BLACK,
      //   },
      // });
      // viewer.camera.flyTo({
      //   destination: Cesium.Cartesian3.fromDegrees(115.0, 39.0, 117.0, 5000),
      // });
      // // 定义闸门当前的高度
      // let gateHeight = 0;

      // // 创建一个滑动条控件，用于控制闸门高度
      // const slider = document.getElementById("slider");
      // slider.oninput = function () {
      //   // 更新闸门高度
      //   gateHeight = parseFloat(slider.value);

      //   // 更新闸门实体的高度
      //   rectangle.rectangle.height = gateHeight;

      //   // 刷新场景
      //   viewer.scene.requestRender();
      // };
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
      // //createwaterflow(viewer, Cesium);

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
      // sonInit.value.sonInit(viewer);
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
        senceInfo._sluicegateEntities[senceInfo._sluiceGatesName[index]] =
          privi;
        viewer.scene.primitives.add(privi);
      });
      // emits("GatesLoaded", { primitivesmap: senceInfo._sluicegateEntities });
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
      var uppos = [
        (lineup[0] + lineup[2]) / 2,
        (lineup[1] + lineup[3]) / 2,
        260,
      ];
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
      ).toFixed(2)} m\n \n流速：${Number(
        duanmianInfo._upbasewaterSpeed
      ).toFixed(2)} m/s`;
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
      ).toFixed(2)} m\n \n流速：${Number(
        duanmianInfo._downbaseWaterSpeed
      ).toFixed(2)} m/s`;
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
        var privi = createGLTFModel(
          position.modelurl,
          position.pos,
          { x: 20, y: 20, z: 20 }
        );
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
      // emits("cameramodelloaded", {
      //   viewer: viewer,
      //   Cesium: Cesium,
      //   entitis: [
      //     { position: videoInfo.positions[0], id: ids[0] },
      //     { position: videoInfo.positions[1], id: ids[1] },
      //   ],
      // });
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
        destination: Cesium.Cartesian3.fromDegrees(
          param.lon,
          param.lat,
          param.alt
        ),
        orientation: {
          heading: Cesium.Math.toRadians(param.heading), // east, default value is 0.0 (north)
          pitch: Cesium.Math.toRadians(param.pitch), // default value (looking down)
          roll: Cesium.Math.toRadians(param.roll), // default value
        },
      });
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      // loadLayers();
      console.log(vue.version);
      const { viewer } = store.state;
      //初始化地图图层
      loadLayers(viewer);
      //设置相机位置
      setView(viewer, viewTarget);
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      drawDam,
    };
  },
});
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

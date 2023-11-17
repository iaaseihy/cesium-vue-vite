<!--
 * @Descripttion: 道路穿梭线
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-10-19 15:14:44
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <!-- <div id="cesiumContainer"></div> -->
  <el-container>
    <div class="panel_view">
      <ul class="volume-main">
        <li class="volume-clear">
          <span @click="roaming()">roaming漫游</span>
          <!-- <span @click="initFly()">初始化</span>
        <span @click="startFly()">开始飞行</span>
        <span @click="pauseFly()">暂停/继续飞行</span>
        <span @click="aircraftView()">跟随视角</span>
        <span @click="flyBack()">向后飞行</span>
        <span @click="flyForward()">向前飞行</span>
        <span @click="stopFly()">结束飞行</span> -->

          <button @click="initFly()">初始化</button>
          <button @click="startFly()">开始飞行</button>
          <button @click="pauseFly()">暂停/继续飞行</button>
          <button @click="aircraftView()">跟随视角</button>
          <button @click="flyBack()">向后飞行</button>
          <button @click="flyForward()">向前飞行</button>
          <button @click="stopFly(true)">结束飞行</button>
          <button @click="updateLine()">动态绘制轨迹线</button>
          <button @click="realTimeRoute()">实时轨迹线</button>
          <button @click="pathRoamingNew()">路径漫游</button>
        </li>
      </ul>
    </div>
    <div style="color: white; display: none" class="flyByKeywordContainer">
      <table class="infoPanel">
        <tbody>
          <tr>
            <td>左右: <span id="heading"></span>°</td>
          </tr>
          <tr>
            <td>← 左/→ 右</td>
          </tr>
          <tr>
            <td>上下: <span id="pitch"></span>°</td>
          </tr>
          <tr>
            <td>↑ 上/↓ 下</td>
          </tr>
          <tr>
            <td>倾斜: <span id="roll"></span>°</td>
          </tr>
          <tr>
            <td>← + shift 左/→ + shift 右</td>
          </tr>
          <tr>
            <td>速度: <span id="speed"></span>m/s</td>
          </tr>
          <tr>
            <td>↑ + shift 加速/↓ + shift 减速</td>
          </tr>
          <tr>
            <td>
              跟随飞机
              <input id="fromBehind" type="checkbox" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </el-container>
</template>

<script>
import * as Cesium from "cesium";
import { defineComponent, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import { getGeojson } from "@/api/api.js";
import Roaming from "../../../commonJS/commonTool/roaming.js";
import { fromDegreesToCartesian3Arr } from "./tool";
import pathRoaming from "./pathRoaming";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let viewer;
    let mFlyPath = [];
    let mFlySpeed = 0.1;

    let Primitive;
let entityPath;
// let path = [104.063914, 30.640356, 500]; //存在路线数组
let path = [
                [104.063914, 30.640356, 500],
                [118.93830177292894, 25.488280583435404, 300],
                [119.14034602637892, 25.32388938213355, 800],
                [119.43064375816327, 25.230148210056235, 1500],
                [120.93105921868252, 24.769194048014963, 2500],
                [121.5592902752412, 24.658964292017885, 3500],
                [121.56445881860067, 25.16649023047563, 4500],
                [119.94263373897657,25.49632056739945,5500],
                [119.30910179629008, 25.559938450361965, 6500],
                [118.96295053426707, 25.571485127594467, 0]
              ];
let linePath = []; //轨迹线数组
let maxIndex = 0// 最大插值经纬度数组索引
let m_lng = Number(104.063914);
let m_lat = Number(30.640356);
let m_alt = Number(496);
let m_interval = 1;
let showPath = [];
let timer;
let pathIndex = 0;
let index = 0;
let forNum = 20;

    // 引用roaming.js开始相机漫游
    const roaming = async () => {
      const { viewer } = store.state;
      viewer.scene.debugShowFramesPerSecond = true;
      viewer.clock.shouldAnimate = true;
      let Lines = [
        { longitude: 116.538799, latitude: 39.9948, height: 0 },
        { longitude: 116.130034, latitude: 38.291387, height: 5000 },
        { longitude: 116.415192, latitude: 34.841955, height: 5000 },
        { longitude: 117.261468, latitude: 31.831171, height: 5000 },
        { longitude: 115.881671, latitude: 28.70164, height: 5000 },
        { longitude: 116.120835, latitude: 24.308311, height: 5000 },
        { longitude: 113.269254, latitude: 23.13956, height: 0 },
      ];
      let roaming = new Roaming(viewer, {
        modeluri:
          "http://openlayers.vip/cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
        time: 360,
        Lines: Lines,
        isPathShow: true,
      });
    };

    /**
     * 初始化飞行数据
     **/
    const initFly = () => {
      const { viewer } = store.state;
      pauseFly();

      // 数据
      if (!mFlyPath || mFlyPath.length == 0) {
        mFlyPath[0] = [
          { longitude: 116.538799, dimension: 39.9948, height: 0, time: 0 },
          {
            longitude: 116.130034,
            dimension: 38.291387,
            height: 5000,
            time: 120,
          },
          {
            longitude: 116.415192,
            dimension: 34.841955,
            height: 5000,
            time: 240,
          },
          {
            longitude: 117.261468,
            dimension: 31.831171,
            height: 5000,
            time: 360,
          },
          {
            longitude: 115.881671,
            dimension: 28.70164,
            height: 5000,
            time: 480,
          },
          {
            longitude: 116.120835,
            dimension: 24.308311,
            height: 5000,
            time: 600,
          },
          { longitude: 113.269254, dimension: 23.13956, height: 0, time: 720 },
        ];

        //设置初始位置
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            mFlyPath[0][0].longitude,
            mFlyPath[0][0].dimension,
            100000
          ),
          orientation: {
            heading: Cesium.Math.toRadians(20.0), // 方向
            pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
            roll: 0,
          },
          pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
          maximumHeight: 5000, // 相机最大飞行高度
          flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度
        });
      }

      // 起始时间
      let start = new Cesium.JulianDate();
      // 结束时间
      let stop = Cesium.JulianDate.addSeconds(
        start,
        (mFlyPath[0].length - 1) * 120,
        new Cesium.JulianDate()
      );
      // 设置始时钟始时间
      viewer.clock.startTime = start.clone();
      // 设置时钟当前时间
      viewer.clock.currentTime = start.clone();
      // 设置始终停止时间
      viewer.clock.stopTime = stop.clone();
      // 时间速率，数字越大时间过的越快
      viewer.clock.multiplier = mFlySpeed;
      // 循环执行
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      let data = mFlyPath;
      for (let j = 0; j < data.length; j++) {
        let property = new Cesium.SampledPositionProperty();
        for (let i = 0; i < data[j].length; i++) {
          let time = Cesium.JulianDate.addSeconds(
            start,
            data[j][i].time,
            new Cesium.JulianDate()
          );
          let position = Cesium.Cartesian3.fromDegrees(
            data[j][i].longitude,
            data[j][i].dimension,
            data[j][i].height
          );
          // 添加位置，和时间对应
          property.addSample(time, position);
        }
        // 添加模型
        viewer.entities.add({
          id: "fly",
          // 和时间轴关联
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: start,
              stop: stop,
            }),
          ]),
          position: property,
          //基于位置移动自动计算方向.
          orientation: new Cesium.VelocityOrientationProperty(property),
          // 模型数据,跨域，模型文件必须放本地
          model: {
            uri: "http://openlayers.vip/cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
            scale: 6,
            minimumPixelSize: 64,
          },
          //路径
          path: {
            resolution: 1,
            //设置航线样式，线条颜色，内发光粗细，航线宽度等
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.1,
              color: Cesium.Color.YELLOW,
            }),
            width: 20,
          },
        });
      }
      viewer.clock.shouldAnimate = false;
    };
    /**
     * 开始飞行
     **/
    const startFly = () => {
      const { viewer } = store.state;
      viewer.clock.shouldAnimate = true;
    };

    /**
     * 暂停飞行
     **/
    const pauseFly = () => {
      const { viewer } = store.state;
      viewer.clock.shouldAnimate = !viewer.clock.shouldAnimate;
    };

    /**
     * 顶部视图
     **/
    const topView = () => {
      const { viewer } = store.state;
      viewer.trackedEntity = undefined;
      viewer.zoomTo(
        viewer.entities,
        new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90))
      );
    };

    /**
     * 侧面视图
     **/
    const sideView = () => {
      const { viewer } = store.state;
      viewer.trackedEntity = undefined;
      viewer.zoomTo(
        viewer.entities,
        new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(-90),
          Cesium.Math.toRadians(-15),
          7500
        )
      );
    };

    /**
     * 跟随视图
     **/
    const aircraftView = () => {
      const { viewer } = store.state;
      viewer.trackedEntity = viewer.entities.getById("fly");
    };

    /**
     * 向后飞行
     **/
    const flyBack = () => {
      const { viewer } = store.state;
      mFlySpeed = -0.1;
      viewer.clock.multiplier = mFlySpeed;
    };

    /**
     * 向前飞行
     **/
    const flyForward = () => {
      const { viewer } = store.state;
      mFlySpeed = 0.1;
      viewer.clock.multiplier = mFlySpeed;
    };
    /**
     * 自定义路线飞行
     **/
    const customFly = () => {
      const { viewer } = store.state;
      window.PolyLinePrimitive = (function () {
        function _(positions) {
          this.options = {
            polyline: {
              show: true,
              positions: [],
              material: Cesium.Color.CORNFLOWERBLUE,
              width: 5,
            },
          };
          this.positions = positions;
          this._init();
        }
        _.prototype._init = function () {
          var _self = this;
          var _update = function () {
            return _self.positions;
          };
          //实时更新polyline.positions
          this.options.polyline.positions = new Cesium.CallbackProperty(
            _update,
            false
          );
          viewer.entities.add(this.options);
        };
        return _;
      })();

      var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      var positions = [];
      var poly = undefined;
      var lnglatPositions = [];
      handler.setInputAction(function (movement) {
        //屏幕坐标转成经纬度坐标
        var cartesian = viewer.scene.camera.pickEllipsoid(
          movement.position,
          viewer.scene.globe.ellipsoid
        );
        if (positions.length == 0) {
          positions.push(cartesian.clone());
        }
        positions.push(cartesian);
        var ray = viewer.camera.getPickRay(movement.position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) return;
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lng = Cesium.Math.toDegrees(cartographic.longitude); //经度值
        let lat = Cesium.Math.toDegrees(cartographic.latitude); //纬度值
        lnglatPositions.push({
          longitude: lng,
          dimension: lat,
          height: 5000,
          time: lnglatPositions.length * 120,
        });
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      //鼠标移动事件
      handler.setInputAction(function (movement) {
        var cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          viewer.scene.globe.ellipsoid
        );
        if (positions.length >= 2) {
          if (!Cesium.defined(poly)) {
            poly = new PolyLinePrimitive(positions);
          } else {
            positions.pop();
            cartesian.y += 1 + Math.random();
            positions.push(cartesian);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      //双击完成绘制飞行路线操作
      handler.setInputAction(function (movement) {
        handler.destroy();
        if (positions.length > 0) {
          positions[0].height = 0;
          positions[positions.length - 1].height = 0;
          //先停止之前的飞行，初始化飞行数据，开始飞行
          stopFly(false);
          if (lnglatPositions.length > 2) {
            lnglatPositions.splice(lnglatPositions.length - 1, 1);
            mFlyPath[0] = lnglatPositions;
            initFly();
            startFly();
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    };
    /**
     * 停止飞行
     **/
    const stopFly = (clearData) => {
      const { viewer } = store.state;
      viewer.trackedEntity = undefined;
      var start = Cesium.JulianDate.fromDate(new Date());
      viewer.clock.startTime = start.clone();
      var stop = Cesium.JulianDate.addSeconds(
        start,
        300000000,
        new Cesium.JulianDate()
      );
      viewer.clock.stopTime = stop.clone();
      viewer.entities.removeAll();
      if (clearData) mFlyPath = [];
    };
    /**
     * 键盘控制飞行
     **/
    const flyByKeyword = () => {
      const { viewer } = store.state;
      viewer.entities.removeAll();
      viewer.scene.primitives.removeAll();
      let display = document.getElementsByClassName("flyByKeywordContainer")[0]
        .style.display;
      if (display == "block")
        document.getElementsByClassName(
          "flyByKeywordContainer"
        )[0].style.display = "none";
      else
        document.getElementsByClassName(
          "flyByKeywordContainer"
        )[0].style.display = "block";

      var canvas = viewer.canvas;
      canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
      canvas.addEventListener("click", function () {
        canvas.focus();
      });
      canvas.focus();

      var scene = viewer.scene;

      var pathPosition = new Cesium.SampledPositionProperty();
      var entityPath = viewer.entities.add({
        position: pathPosition,
        name: "path",
        path: {
          show: true,
          leadTime: 0,
          trailTime: 60,
          width: 10,
          resolution: 1,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            taperPower: 0.3,
            color: Cesium.Color.PALEGOLDENROD,
          }),
        },
      });

      var camera = viewer.camera;
      var controller = scene.screenSpaceCameraController;
      var r = 0;
      var center = new Cesium.Cartesian3();

      var hpRoll = new Cesium.HeadingPitchRoll();
      var hpRange = new Cesium.HeadingPitchRange();
      var speed = 10;
      var deltaRadians = Cesium.Math.toRadians(3.0);

      var position = Cesium.Cartesian3.fromDegrees(
        116.0744619,
        39.0503706,
        5000.0
      );
      var speedVector = new Cesium.Cartesian3();
      var fixedFrameTransform =
        Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");

      var planePrimitive = viewer.entities.getById("fly")
      // var planePrimitive = scene.primitives.add(
      //   Cesium.Model.fromGltf({
      //     url: "http://openlayers.vip/cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
      //     modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
      //       position,
      //       hpRoll,
      //       Cesium.Ellipsoid.WGS84,
      //       fixedFrameTransform
      //     ),
      //     minimumPixelSize: 128,
      //   })
      // );

      planePrimitive.readyPromise.then(function (model) {
        // Play and loop all animations at half-speed
        model.activeAnimations.addAll({
          multiplier: 0.5,
          loop: Cesium.ModelAnimationLoop.REPEAT,
        });

        // Zoom to model
        r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
        controller.minimumZoomDistance = r * 0.5;
        Cesium.Matrix4.multiplyByPoint(
          model.modelMatrix,
          model.boundingSphere.center,
          center
        );
        var heading = Cesium.Math.toRadians(230.0);
        var pitch = Cesium.Math.toRadians(-20.0);
        hpRange.heading = heading;
        hpRange.pitch = pitch;
        hpRange.range = r * 50.0;
        camera.lookAt(center, hpRange);
      });

      document.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
          case 40:
            if (e.shiftKey) {
              // speed down
              speed = Math.max(--speed, 1);
            } else {
              // pitch down
              hpRoll.pitch -= deltaRadians;
              if (hpRoll.pitch < -Cesium.Math.TWO_PI) {
                hpRoll.pitch += Cesium.Math.TWO_PI;
              }
            }
            break;
          case 38:
            if (e.shiftKey) {
              // speed up
              speed = Math.min(++speed, 100);
            } else {
              // pitch up
              hpRoll.pitch += deltaRadians;
              if (hpRoll.pitch > Cesium.Math.TWO_PI) {
                hpRoll.pitch -= Cesium.Math.TWO_PI;
              }
            }
            break;
          case 39:
            if (e.shiftKey) {
              // roll right
              hpRoll.roll += deltaRadians;
              if (hpRoll.roll > Cesium.Math.TWO_PI) {
                hpRoll.roll -= Cesium.Math.TWO_PI;
              }
            } else {
              // turn right
              hpRoll.heading += deltaRadians;
              if (hpRoll.heading > Cesium.Math.TWO_PI) {
                hpRoll.heading -= Cesium.Math.TWO_PI;
              }
            }
            break;
          case 37:
            if (e.shiftKey) {
              // roll left until
              hpRoll.roll -= deltaRadians;
              if (hpRoll.roll < 0.0) {
                hpRoll.roll += Cesium.Math.TWO_PI;
              }
            } else {
              // turn left
              hpRoll.heading -= deltaRadians;
              if (hpRoll.heading < 0.0) {
                hpRoll.heading += Cesium.Math.TWO_PI;
              }
            }
            break;
          default:
        }
      });

      var headingSpan = document.getElementById("heading");
      var pitchSpan = document.getElementById("pitch");
      var rollSpan = document.getElementById("roll");
      var speedSpan = document.getElementById("speed");
      var fromBehind = document.getElementById("fromBehind");

      viewer.scene.preUpdate.addEventListener(function (scene, time) {
        speedVector = Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.UNIT_X,
          speed / 10,
          speedVector
        );
        position = Cesium.Matrix4.multiplyByPoint(
          planePrimitive.modelMatrix,
          speedVector,
          position
        );
        pathPosition.addSample(Cesium.JulianDate.now(), position);
        Cesium.Transforms.headingPitchRollToFixedFrame(
          position,
          hpRoll,
          Cesium.Ellipsoid.WGS84,
          fixedFrameTransform,
          planePrimitive.modelMatrix
        );
        if (fromBehind.checked) {
          // Zoom to model
          Cesium.Matrix4.multiplyByPoint(
            planePrimitive.modelMatrix,
            planePrimitive.boundingSphere.center,
            center
          );
          hpRange.heading = hpRoll.heading;
          hpRange.pitch = hpRoll.pitch;
          camera.lookAt(center, hpRange);
        }
      });

      viewer.scene.preRender.addEventListener(function (scene, time) {
        headingSpan.innerHTML = Cesium.Math.toDegrees(hpRoll.heading).toFixed(
          1
        );
        pitchSpan.innerHTML = Cesium.Math.toDegrees(hpRoll.pitch).toFixed(1);
        rollSpan.innerHTML = Cesium.Math.toDegrees(hpRoll.roll).toFixed(1);
        speedSpan.innerHTML = speed.toFixed(1);
      });
    };


    // 动态绘制飞机的轨迹线
    const updateLine = () => {
      const { viewer } = store.state;
      let positionA = [
                [118.93830177292894, 25.488280583435404, 300],
                [119.14034602637892, 25.32388938213355, 800],
                [119.43064375816327, 25.230148210056235, 1500],
                [120.93105921868252, 24.769194048014963, 2500],
                [121.5592902752412, 24.658964292017885, 3500],
                [121.56445881860067, 25.16649023047563, 4500],
                [119.94263373897657,25.49632056739945,5500],
                [119.30910179629008, 25.559938450361965, 6500],
                [118.96295053426707, 25.571485127594467, 0]
              ];
    let positions = [];
    positionA.forEach((p) => {
      positions.push(new Cesium.Cartesian3.fromDegrees(
        p[0],
        p[1],
        p[2]
      ))
                });
// 最开始的时候没有线，后面点肯定就不止2个，所以也可以正常移除。
if (positions.length>=2) {
    viewer.scene.primitives.remove(window.line);
  }
  if (positions.length < 2) {
    // 这个地方我是为了在刚开始的时候不要报错，因为primitive绘制线要求至少有两个点
    positions = [
      new Cesium.Cartesian3.fromDegrees(
        108.89080568,
        34.22720682,
        9997.06879914
      ),
      new Cesium.Cartesian3.fromDegrees(
        108.86996023,
        34.22265071,
        9994.60869058
      ),
    ];
  }
  let LineInstanceArr = [];
  //定义折线几何
  let polyline = new Cesium.PolylineGeometry({
    positions: positions,
    width: 5.0,
    vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
  });
  var LineInstance = new Cesium.GeometryInstance({
    geometry: polyline,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        Cesium.Color.RED
      ),
    },
  });
  LineInstanceArr.push(LineInstance);

  // 这里使用window.line的原因是我不想让vue组件对我的cesium绘制的任何实体进行监控，以免出现效率问题，这在我的另外一篇博客中有提到
  window.line = new Cesium.Primitive({
    geometryInstances: LineInstanceArr,
    //折线外观
    appearance: new Cesium.PolylineColorAppearance({
      translucent: false,
    }),
    asynchronous: false,
  });

  viewer.scene.primitives.add(line);
    };

    const realTimeRoute = () => {
      const { viewer } = store.state;
      add();
    };

    
const initModel = () => { //初始化模型
  const { viewer } = store.state;
  let pos = Cesium.Cartesian3.fromDegrees(path[0][0], path[0][1], path[0][2])
  linePath = [pos]
  entityPath = viewer.entities.add({ //轨迹线
      polyline: {
          positions: new Cesium.CallbackProperty(() => {
              return linePath;
          }, false),
          show: true,
          material: Cesium.Color.RED,
          width: 1.5,
          clampToGround: true //是否贴地
      }
  });
  Primitive = viewer.scene.primitives.add( //加载模型
      Cesium.Model.fromGltf({
          url: "http://openlayers.vip/cesium/Apps/SampleData/models/CesiumAir/Cesium_Air.glb",
          modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
              pos,
              hpRoll,
              Cesium.Ellipsoid.WGS84,
              fixedFrameTransform,
          ),
          scale: 1,
          maximumScale: 10
      })
  );
  Primitive.readyPromise.then((model) => {
      // Play and loop all animations at half-speed
      (model).activeAnimations.addAll({
          multiplier: 0.5,
          loop: Cesium.ModelAnimationLoop.REPEAT,
      });
  });
};


const add = () => { //添加位置点进入数组
  const { viewer } = store.state;
    if (m_lng === 0 || m_lat === 0) {
        console.warning('经纬度不能为0')
        return
    }
    let len = path.length - 1
    if (path[len] && m_lng === path[len][0] && m_lat === path[len][1]) return
    path.push([m_lng, m_lat, m_alt])
    m_lng = 0
    m_lat = 0
    interpolation() //将轨迹添加进数组中
    if (path.length === 1) {
        initModel()
    }
    //设置初始位置
    viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            104.063914, 
            30.640356,
            100000
          ),
          orientation: {
            heading: Cesium.Math.toRadians(20.0), // 方向
            pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
            roll: 0,
          },
          pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
          maximumHeight: 5000, // 相机最大飞行高度
          flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度
        });
}
const interpolation = () => { //插值坐标
    if (path.length < 2) return
    const po1 = Cesium.Cartesian3.fromDegrees(path[pathIndex][0], path[pathIndex][1], path[pathIndex][2])
    const po2 = Cesium.Cartesian3.fromDegrees(path[pathIndex + 1][0], path[pathIndex + 1][1], path[pathIndex + 1][2])
    getPosition(po1, po2, m_interval).then((res) => {
        showPath = showPath.concat(res)
        pathIndex++
        maxIndex = showPath.length
    })
}
const getPosition = (startP, endP, duration) => {
    return new Promise((resolve) => {
        let arr = []
        duration = duration * 1000
        for (let i = 0; i <= duration; i = i + forNum) {
            let pos = Cesium.Cartesian3.lerp(startP, endP, i / duration, new Cesium.Cartesian3());
            arr.push(pos)
        }
        if (duration % forNum !== 0) {
            arr.push(endP)
        }
        resolve(arr);
    })
};

const pathRoamingNew = () => {
  const { viewer } = store.state;
  let ps = [
    new Cesium.Cartographic(119.44037341293323, 35.34197106899855, 5.872732096309598),
    new Cesium.Cartographic(119.44252948098223, 35.34223901339689, 6.31711015359973),
    new Cesium.Cartographic(119.4560550425358, 35.34202148007459, 22.906707659456394),
    new Cesium.Cartographic(119.45610614546445, 35.32762691608659, 3.0852594116911622)
];

viewer.entities.add({
    polyline: {
        positions: fromDegreesToCartesian3Arr(ps),
        width: 4,
        clampToGround: true,
        arcType: Cesium.ArcType.RHUMB,
    }
});

let speed = 1
let roam = pathRoaming.getInstance(viewer);
roam.startRoaming(ps, 1, 1);
};
    const handleClear = () => {
      const { viewer } = store.state;
      stopFly(false);
      //   viewer.scene.primitives.removeAll();
    };
    onMounted(() => {
      // flyByKeyword();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      flyForward,
      flyBack,
      aircraftView,
      sideView,
      topView,
      pauseFly,
      startFly,
      customFly,
      stopFly,
      flyByKeyword,
      initFly,
      roaming,
      updateLine,
      realTimeRoute,
      pathRoamingNew,
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
.panel_view {
  position: absolute;
  top: 100px;
  right: 170px;
  z-index: 200;
  width: 200px;
  height: 80px;
  background: rgba(0, 255, 255, 0.7);
  border: 1px solid #529dd6;
  border-radius: 5px;
}
.volume-main {
  line-height: 26px;
  padding: 0 10px;
}
.volume-main li {
  list-style-type: none;
}
.volume-clear {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed;
  color: #ffffff;
  padding-bottom: 6px;
}
.volume-color {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
.volume-clear span {
  cursor: pointer;
}
.volume-item {
  margin-top: 8px;
}
.volume-color {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
</style>

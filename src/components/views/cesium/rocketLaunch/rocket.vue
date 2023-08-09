<template>
  <div class="btn-box"></div>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <button @click="onViewerLoaded()">火箭发射</button>
      </li>
    </ul>
  </div>
  <!-- <Map @onViewerLoaded="onViewerLoaded" :options="options">
    </Map>> -->
</template>
<script lang="ts">
// import Map from "@/components/Cesium/lib/Map.vue";
import * as Cesium from "cesium";
import CesiumContainer from "@/views/CesiumContainer.vue";
// import { GetPosition } from "@/components/Cesium/utils";
//import { initLayerPromise } from "@/components/Cesium/utils/initLayer";
// import { Helper } from "@/components/Cesium/lib/helper";
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";

export default defineComponent({
    components: { CesiumContainer },
  setup() {
    const store = useStore();
    let viewer: Cesium.Viewer;
    const options = {};
    let handler: Cesium.ScreenSpaceEventHandler;

    const onViewerLoaded = (Viewer?: Cesium.Viewer) => {
    //   viewer = Viewer;
      const { viewer } = store.state;
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            104.200403,
            30.396231,
            2000
          ),
          // destination: Cesium.Cartesian3.fromDegrees(120.38105869, 31.10115627, 3000),
        //   complete: () => {
        //     init();
        //   },
        });
        init();
    //   initLayerPromise(Viewer, true).then(() => {
    //     viewer.camera.flyTo({
    //       destination: Cesium.Cartesian3.fromDegrees(
    //         104.200403,
    //         30.396231,
    //         2000
    //       ),
    //       // destination: Cesium.Cartesian3.fromDegrees(120.38105869, 31.10115627, 3000),
    //       complete: () => {
    //         init();
    //       },
    //     });
    //     // init()
    //   });
    //   const getP = new GetPosition(Viewer);
    //   getP.getPositionByClick((position: any) => {
    //     console.log(position);
    //   });
    };
    let planePrimitive: Cesium.Model;
    let position = Cesium.Cartesian3.fromDegrees(104.200403, 30.396231, 600.0);
    const hpRoll = new Cesium.HeadingPitchRoll();
    const fixedFrameTransform =
      Cesium.Transforms.localFrameToFixedFrameGenerator("north", "west");

    let activeIndex = 0; //插值经纬度索引
    let maxIndex = 0; // 最大插值经纬度数组索引
    let autoDirection = true; //自动调整方向
    let path: [number, number, number][] = []; //存在路线数组
    let showPath: Cesium.Cartesian3[] = []; //插值数组
    let camera: Cesium.Camera;
    let controller: Cesium.ScreenSpaceCameraController;
    let r: number;
    const hpRange = new Cesium.HeadingPitchRange();
    let nodes: any[] = [];
    const init = () => {
        const { viewer } = store.state;
      hpRoll.pitch = (90 * Math.PI) / 180;
      planePrimitive = viewer.scene.primitives.add(
        Cesium.Model.fromGltf({
          url: "static/glb/launchvehicle.glb",
          modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
            position,
            hpRoll,
            Cesium.Ellipsoid.WGS84,
            fixedFrameTransform
          ),
          minimumPixelSize: 128,
        })
      );
      const scene = viewer.scene;
      planePrimitive.readyPromise.then((model) => {
        camera = viewer.camera;
        controller = scene.screenSpaceCameraController;
        r = 2.0 * Math.max(model.boundingSphere.radius, camera.frustum.near);
        controller.minimumZoomDistance = r * 0.2;
        /**
         modelAnimationController({
            type: 'SRBFlames Size', initVal: 0, maxVal: 1, step: 0.05, fn: () => {
                modelAnimationController({ type: 'SRBFlames Size', initVal: 1, minVal: 0, step: -0.5 })
                modelAnimationController({
                    type: 'SRBs Separate', initVal: 0, maxVal: 10, step: 0.5, fn: () => {//一级脱落
                        modelAnimationController({ type: 'SRBs Drop', initVal: 0, minVal: -50, step: -0.5 })
                    }
                })
                // modelAnimationController({ type: 'BoosterEngines Yaw', initVal: 0, maxVal: 1, step: 0.1 }) //左右
                // modelAnimationController({ type: 'BoosterEngines Pitch', initVal: 0, maxVal: 1, step: 0.1 }) //上下
                modelAnimationController({
                    type: 'BoosterFlames Size', initVal: 0, maxVal: 1, step: 0.1, fn: () => {
                        modelAnimationController({ type: 'Fairing Open', initVal: 0, maxVal: 45, step: 0.5 })
                        modelAnimationController({ type: 'Fairing Separate', initVal: 0, minVal: -10, step: -0.1 })
                        modelAnimationController({ type: 'Fairing Drop', initVal: 0, minVal: -50, step: -0.5, fn: ()=> {
                            //主推进器脱落
                            modelAnimationController({ type: 'Booster MoveZ', initVal: 0, minVal: -50, step: -0.5})
                            modelAnimationController({ type: 'UpperStageFlames Size', initVal: 0, maxVal: 1, step: 0.05, fn:()=> {
                                modelAnimationController({ type: 'InterstageAdapter MoveZ', initVal: 0, minVal: -50, step: -0.5})
                            }})
                            // modelAnimationController({ type: 'UpperStageEngines Yaw', initVal: 0, maxVal: 1, step: 0.05,})//左右
                            // modelAnimationController({ type: 'UpperStageEngines Pitch', initVal: 0, maxVal: 1, step: 0.05,}) //上下
                        } })
                    }
                })
            }
        })
         */
        lookAt();
        pickup();
        // nodes = planePrimitive.gltf.nodes;
        nodes = planePrimitive.loader.gltfJson.nodes;
        console.log(nodes);
        // nodes.forEach(i => {
        //     if (new RegExp(/InterstageAdapter/).test(i.name)) {
        //         planePrimitive.getNode(i.name).show = false
        //     }
        // })

        crateLine().then(() => {
          modelAnimationController({
            type: "SRBFlames Size",
            initVal: 0,
            maxVal: 1,
            step: 0.05,
            fn: () => {
              viewer.scene.preUpdate.addEventListener(keepRun);
            },
          });
        });
      });
    };
    const pickup = () => {
        const { viewer } = store.state;
      handler.setInputAction(function (movement: {
        position: Cesium.Cartesian2;
      }) {
        const pickedObject = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedObject)) {
          console.log(pickedObject);
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    const lookAt = () => {
        const { viewer } = store.state;
      const center = Cesium.Matrix4.multiplyByPoint(
        planePrimitive.modelMatrix,
        Cesium.Cartesian3.ZERO,
        new Cesium.Cartesian3()
      );
      const heading = Cesium.Math.toRadians(10.0);
      const pitch = Cesium.Math.toRadians(-5.0);
      camera.lookAt(
        center,
        new Cesium.HeadingPitchRange(heading, pitch, r * 0.5)
      );
    };
    type typeModelAnimationController = {
      type: string;
      initVal: number;
      maxVal?: number;
      minVal?: number;
      fn?: Function;
      step?: number;
    };
    const modelAnimationController = (
      controller: typeModelAnimationController
    ) => {
        const { viewer } = store.state;
      const { type, initVal, maxVal, fn, step, minVal } = controller;
      let num = initVal;
      let stopFrame: number;
      const max = maxVal || 1;
      const min = minVal || -99999;
      const duration = step || 0.1;
      const render = () => {
        num += duration;
        planePrimitive.setArticulationStage(type, num);
        planePrimitive.applyArticulations();
        stopFrame = requestAnimationFrame(render);
        if (num > max || num <= min) {
          window.cancelAnimationFrame(stopFrame);
          fn && fn();
        }
      };
      render();
    };
    const crateLine = () => {
        const { viewer } = store.state;
      const lon = 104.200403,
        lat = 30.396231,
        alt = 20600;
      for (let index = 1; index < 20; index++) {
        path.push([lon, lat, 600 + 1000 * index]);
      }
      const len = 1000;
      let lastLat = 0,
        lastLon = 0,
        lastAlt = 0,
        activeLon: number,
        activeLat: number,
        activeAlt: number;
      for (let index = 0; index < len; index++) {
        activeLon = Number((lon + index * 0.01).toFixed(6));
        activeLat = Number((lat + index * 0.02).toFixed(6));
        activeAlt = alt + index * 1000;
        path.push([activeLon, activeLat, activeAlt]);
        if (index === len - 1) {
          lastLon = activeLon;
          lastLat = activeLat;
          lastAlt = activeAlt;
        }
      }
      for (let i = 0; i <= 360; i += 1) {
        path.push([lastLon + i, lastLat, lastAlt]);
      }
      return new Promise((resolve) => {
        getPosition().then((res) => {
          showPath = res;
          maxIndex = res.length;
          const line = viewer.scene.primitives.add(
            new Cesium.Primitive({
              geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolylineGeometry({
                  positions: res,
                  width: 3.0,
                  vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
                }),
                attributes: {
                  color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.BLUE.withAlpha(0.7)
                  ),
                },
              }),
              appearance: new Cesium.PolylineColorAppearance(),
            })
          );
          line.readyPromise.then(() => {
            resolve("");
          });
        });
      });
    };

    const keepRun = (scene: Cesium.Scene, time: number) => {
        const { viewer } = store.state;
      if (activeIndex >= maxIndex) return;
      console.log(activeIndex);
      if (activeIndex === 1000) {
        modelAnimationController({
          type: "SRBFlames Size",
          initVal: 1,
          minVal: 0,
          step: -0.5,
        });
        modelAnimationController({
          type: "SRBs Separate",
          initVal: 0,
          maxVal: 10,
          step: 0.5,
          fn: () => {
            //一级脱落
            modelAnimationController({
              type: "SRBs Drop",
              initVal: 0,
              minVal: -100,
              step: -1,
              fn: () =>
                nodes.forEach((i) => {
                  if (new RegExp(/SRB\d/).test(i.name)) {
                    planePrimitive.getNode(i.name).show = false;
                  }
                }),
            });
          },
        });
        modelAnimationController({
          type: "BoosterFlames Size",
          initVal: 0,
          maxVal: 1,
          step: 0.1,
        }); //主推期开始点火
      }
      if (activeIndex === 3000) {
        modelAnimationController({
          type: "Fairing Open",
          initVal: 0,
          maxVal: 45,
          step: 0.5,
        });
        modelAnimationController({
          type: "Fairing Separate",
          initVal: 0,
          minVal: -10,
          step: -0.1,
        });
        modelAnimationController({
          type: "Fairing Drop",
          initVal: 0,
          minVal: -150,
          step: -1,
          fn: () => {
            //主推进器脱落
            modelAnimationController({
              type: "BoosterFlames Size",
              initVal: 1,
              minVal: 0,
              step: -0.05,
            });
            modelAnimationController({
              type: "Booster MoveZ",
              initVal: 0,
              minVal: -150,
              step: -1,
              fn: () => {
                nodes.forEach((i) => {
                  if (
                    new RegExp(/Fairing\d/).test(i.name) ||
                    new RegExp(/Booster/).test(i.name)
                  ) {
                    planePrimitive.getNode(i.name).show = false;
                  }
                });
              },
            });
            modelAnimationController({
              type: "UpperStageFlames Size",
              initVal: 0,
              maxVal: 1,
              step: 0.05,
            });
          },
        });
      }
      if (activeIndex === 3600) {
        modelAnimationController({
          type: "InterstageAdapter MoveZ",
          initVal: 0,
          minVal: -150,
          step: -1,
          fn: () => {
            nodes.forEach((i) => {
              if (new RegExp(/InterstageAdapter/).test(i.name)) {
                planePrimitive.getNode(i.name).show = false;
              }
            });
          },
        });
      }
      lookAt();
      if (
        autoDirection &&
        activeIndex > 0 &&
        !showPath[activeIndex - 1].equals(showPath[activeIndex])
      ) {
        // console.log('showPath: ', showPath[activeIndex - 1], showPath[activeIndex]);
        
        // const heading = Helper.getHeading(
        //   showPath[activeIndex - 1],
        //   showPath[activeIndex]
        // );
        // if (heading) hpRoll.heading = heading;
        // const pitch = Helper.getPitch(
        //   showPath[activeIndex - 1],
        //   showPath[activeIndex]
        // );
        // if (pitch) hpRoll.pitch = pitch;
        const heading = getHeading(
          showPath[activeIndex - 1],
          showPath[activeIndex]
        );
        if (heading) hpRoll.heading = heading;
        const pitch = getPitch(
          showPath[activeIndex - 1],
          showPath[activeIndex]
        );
        if (pitch) hpRoll.pitch = pitch;
      }
      Cesium.Transforms.headingPitchRollToFixedFrame(
        showPath[activeIndex],
        hpRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransform,
        planePrimitive.modelMatrix
      );
      activeIndex += 1;
    };
    //根据两点坐标获取Heading(朝向)
    const getHeading = (pointA: Cesium.Cartesian3, pointB: Cesium.Cartesian3): number => {
        //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        //向量AB
        const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
        //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
        //AB为世界坐标中的向量
        //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
        const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
        //归一化
        const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
        //heading
        const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
        return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
    };
    // 根据两点坐标获取Pitch(俯仰角)
    const getPitch = (pointA: Cesium.Cartesian3, pointB: Cesium.Cartesian3): number => {
        let transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        const vector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
        let direction = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transfrom, transfrom), vector, vector);
        Cesium.Cartesian3.normalize(direction, direction);
        //因为direction已归一化，斜边长度等于1，所以余弦函数等于direction.z
        return Cesium.Math.PI_OVER_TWO - Cesium.Math.acosClamped(direction.z);
    };
    // 根据A，B，获取点A的模型矩阵
    const getModelMatrix = (pointA: Cesium.Cartesian3, pointB: Cesium.Cartesian3): Cesium.Matrix4 => {
        //向量AB
        const vector2 = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
        //归一化
        const normal = Cesium.Cartesian3.normalize(vector2, new Cesium.Cartesian3());
        //旋转矩阵 rotationMatrixFromPositionVelocity源码中有，并未出现在cesiumAPI中
        const rotationMatrix3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(pointA, normal, Cesium.Ellipsoid.WGS84);
        const orientation = Cesium.Quaternion.fromRotationMatrix(rotationMatrix3);
        const modelMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix3, pointA);
        //点B的模型矩阵
        //const modelMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix3, pointB);
        const hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientation);
        return modelMatrix4;
    };
    const getPosition = () => {
        const { viewer } = store.state;
      //插值 new Cesium.LinearSpline  new Cesium.CatmullRomSpline esium.HermiteSpline.createNaturalCubic
      //let pos = Cesium.Cartesian3.lerp(startP, endP, i / duration, new Cesium.Cartesian3());
      return new Promise((resolve: (value: Cesium.Cartesian3[]) => void) => {
        const points = path.map((i) => Cesium.Cartesian3.fromDegrees(...i));
        let times: number[] = [];
        for (let index = 0; index < points.length; index++) {
          times.push(index);
        }
        const spline = new Cesium.CatmullRomSpline({
          points,
          times,
        });
        const positions: Cesium.Cartesian3[] = [];
        for (let i = 1; i < times.length; i++) {
          for (let j = 0; j < 100; j++) {
            const cartesian3 = spline.evaluate(i - 1 + j * 0.01);
            positions.push(cartesian3);
          }
        }
        resolve(positions);
      });
    };
    // // 实例cesium
    // const getCesiumDem = () => {
    //   let self = this;
    //   Cesium.Ion.defaultAccessToken =
    //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZWFlYjAyYS0xN2JlLTQ0OTItOGNkOC05YWJlNGY0MjI2NmQiLCJpZCI6NDkyMjYsImlhdCI6MTYxNzM0NjA3N30.crkTg0Logk_JUA7BROy0r9RqTJWCi8NZpTyu4qI11Fo";
    //   viewer = new Cesium.Viewer("cesiumDemo", {
    //     animation: false, // 是否显示动画控件
    //     baseLayerPicker: false, // 是否显示图层选择控件
    //     geocoder: false, // 是否显示地名查找控件
    //     timeline: false, // 是否显示时间线控件
    //     sceneModePicker: false, // 是否显示投影方式控件
    //     navigationHelpButton: false, // 是否显示帮助信息控件
    //     infoBox: false, // 是否显示点击要素之后显示的信息
    //     fullscreenButton: false, // 是否显示全屏按钮
    //     selectionIndicator: false, // 是否显示选中指示框
    //     scene3DOnly: true,
    //     homeButton: false,
    //     terrainProvider: new Cesium.EllipsoidTerrainProvider({}),
    //   });
    //   // 显示帧率
    //   viewer.scene.debugShowFramesPerSecond = true;
    //   // 地图事件开始
    //   // 得到当前三维场景
    //   let scene = viewer.scene;
    //   // 得到当前三维场景的椭球体
    //   let ellipsoid = scene.globe.ellipsoid;
    //   // 保利倾斜摄影
    //   //   viewer.camera.flyTo({
    //   //     destination: Cesium.Cartesian3.fromDegrees(113.060458, 22.640675, 180),
    //   //     orientation: {
    //   //       heading: Cesium.Math.toRadians(20),
    //   //       pitch: Cesium.Math.toRadians(-20),
    //   //       roll: 0,
    //   //     },
    //   //   });
    // };
    // onMounted(() => {
    //   getCesiumDem();
    // });
    return {
        onViewerLoaded,
    };
  },
});
</script>
<style lang="less" scoped>
.btn-box {
  position: absolute;
  top: 10px;
  z-index: 10;
  width: 500px;
  margin-left: 20px;
}
.panel_view {
  position: absolute;
  top: 500px;
  right: 100px;
  z-index: 200;
  width: 200px;
  height: 300px;
  background: rgba(0, 255, 255, 0.7);
  border: 1px solid #529dd6;
  border-radius: 5px;
}
#cesiumContainer {
  background: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}
</style>

<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-09-22 10:31:43
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="BAIMOEditWay2()">白膜变色2</el-button>
    <el-button @click="drawExtent()">添加淹没分析范围</el-button>
    <el-button @click="reflectWater()">水体镜面反射折射</el-button>
    <el-button @click="induationAnalysis()">开始淹没分析</el-button>
    <el-button @click="induationAnalysis2()">开始淹没分析2</el-button>
    <el-button @click="clearAllEntities()">清除</el-button>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import { defineComponent, onMounted, onUnmounted, ref, reactive } from "vue";
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
import measureAreaSpace from "./subMerged.js";
import WaterPrimitive from "./WaterPrimitive.js";
export default defineComponent({
  components: { CesiumContainer, ElMessage },
  setup() {
    const store = useStore();
    let entities;
    let entityDrag;
    let imageryProvider;
    let layer;
    let handler;
    let tilesetBaimo = ref < Cesium.Cesium3DTileset > null;
    let pickEntity;
    let activeShapePoints = [];
    let floatingPoint = undefined;
    let activeShape = undefined;
    let isDraw = ref < Boolean > false;
    let maxWaterHeight = 3000;
    let minWaterHeight = 0;
    let warningWaterHeight = 100; // 预警高度
    let waterHeight = 0;
    let waterHeightShow = ref < Boolean > false;
    let speed = "1";
    let waterHeightTimeer = 0;
    let waterPrimitive = undefined;
    let tempEntities = [];
    const state = reactive({
      dragtool: null,
    });

    const BAIMOEditWay2 = () => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测
      // 异步加载
      const height = 430;
      tilesetBaimo = new Cesium.Cesium3DTileset({
        // url: DAYANTA3DTILES,
        url: BAIMO3DTILES,
        minimumPixelSize: 128,
        customShader: new Cesium.CustomShader({
          lightingModel: Cesium.LightingModel.UNLIT,
          fragmentShaderText: `
                  void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                      float _baseHeight = 0.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
                      float _heightRange = 60.0; // 高亮的范围(_baseHeight ~ _baseHeight + _      heightRange) 默认是 0-60米
                      float _glowRange = 300.0; // 光环的移动范围(高度)
                      float vtxf_height = fsInput.attributes.positionMC.z-_baseHeight;
                      float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
                      float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
                      material.diffuse*= vec3(vtxf_a12, vtxf_a12, vtxf_a12);
                      float vtxf_a13 = fract(czm_frameNumber / 360.0);
                      float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
                      vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
                      float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
                      material.diffuse += material.diffuse * (1.0 - vtxf_diff);
                  }
                  `,
        }),
        // enableModelExperimental: true,
      });
      tilesetBaimo.readyPromise
        .then(function (tileset) {
          tileset.style = new Cesium.Cesium3DTileStyle({
            color: {
              conditions: [["true", "color('rgb(51, 153, 255)',1)"]],
            },
          });
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
        .catch(function (error) {
          console.log(error);
        });
      viewer.scene.primitives.add(tilesetBaimo);
      viewer.flyTo(tilesetBaimo);
    };
    /**
     * @author:
     * @Date: 2022-04-11 16:44:02
     * @note: 注意事项
     * @description: 绘制范围
     */
    const drawExtent = () => {
      const { viewer } = store.state;
      // 开启深度检测
      viewer.scene.globe.depthTestAgainstTerrain = true;
      handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

      handler.setInputAction((event) => {
        const earthPosition = viewer.scene.pickPosition(event.position);
        if (Cesium.defined(earthPosition)) {
          if (activeShapePoints.length === 0) {
            floatingPoint = createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            const dynamicPositions = new Cesium.CallbackProperty(function () {
              return new Cesium.PolygonHierarchy(activeShapePoints);
            }, false);
            activeShape = drawShape(
              dynamicPositions,
              Cesium.Color.fromBytes(64, 157, 253, 50)
            );
          }
          activeShapePoints.push(earthPosition);
          tempEntities.push(createPoint(earthPosition));
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((event) => {
        if (Cesium.defined(floatingPoint)) {
          const newPosition = viewer.scene.pickPosition(event.endPosition);
          if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction((event) => {
        activeShapePoints.pop();
        if (activeShapePoints.length < 3) return;

        tempEntities.push(drawPolyline(activeShapePoints));
        let ploy = drawShape(
          activeShapePoints,
          Cesium.Color.fromBytes(64, 157, 253, 20)
        );
        tempEntities.push(ploy);
        getAreaHeight(activeShapePoints);
        // induationAnalysis();
        viewer.entities.remove(floatingPoint);
        viewer.entities.remove(activeShape);
        floatingPoint = undefined;
        activeShape = undefined;
        handler.destroy(); // 关闭事件句柄
        handler = null;
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    /**
     * @author:
     * @Date: 2022-04-11 16:48:43
     * @note: 注意事项
     * @description: 获取区域内最大最小高程
     * @param {*} positions
     */
    const getAreaHeight = (positions) => {
      const { viewer } = store.state;
      let startP = positions[0];
      let endP = positions[positions.length - 1];
      if (startP.x != endP.x && startP.y != endP.y && startP.z != endP.z)
        positions.push(positions[0]);

      const tempPoints = [];
      for (let i = 0; i < positions.length; i++) {
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartographic = ellipsoid.cartesianToCartographic(positions[i]);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        tempPoints.push([lng, lat]);
      }
      var line = turf.lineString(tempPoints);
      var chunk = turf.lineChunk(line, 10, { units: "meters" });

      const tempArray = [];
      chunk.features.forEach((f) => {
        f.geometry.coordinates.forEach((c) => {
          tempArray.push(Cesium.Cartographic.fromDegrees(c[0], c[1]));
        });
      });

      var promise = Cesium.sampleTerrainMostDetailed(
        viewer.terrainProvider,
        tempArray
      );
      // Cesium.when(promise, (updatedPositions) => {
      //   const max = Math.max.apply(Math, updatedPositions.map(item => { return item.height }))
      //   const min = Math.min.apply(Math, updatedPositions.map(item => { return item.height }))
      //   waterHeight = Math.ceil(min)
      //   minWaterHeight = Math.ceil(min)
      //   maxWaterHeight = Math.ceil(max)
      //   // 禁用绘制按钮
      //   isDraw = !isDraw
      // })
      Promise.resolve(promise).then(function (updatedPositions) {
        const max = Math.max.apply(
          Math,
          updatedPositions.map((item) => {
            return item.height;
          })
        );
        const min = Math.min.apply(
          Math,
          updatedPositions.map((item) => {
            return item.height;
          })
        );
        waterHeight = Math.ceil(min);
        minWaterHeight = Math.ceil(min);
        maxWaterHeight = Math.ceil(max);
        // 禁用绘制按钮
        isDraw = !isDraw;
      });
    };
    /**
     * @author:
     * @Date: 2022-04-11 16:46:47
     * @note: 注意事项
     * @description: 创建点
     * @param {*} worldPosition
     */
    const createPoint = (worldPosition) => {
      const { viewer } = store.state;
      const point = viewer.entities.add({
        position: worldPosition,
        point: {
          color: Cesium.Color.SKYBLUE,
          pixelSize: 5,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
      return point;
    };
    /**
     * @author:
     * @Date: 2022-04-11 16:46:37
     * @note: 注意事项
     * @description: 绘制多边形
     * @param {*} positionData
     * @param {*} mat
     */
    const drawShape = (positionData, mat) => {
      const { viewer } = store.state;
      let shape = viewer.entities.add({
        polygon: {
          hierarchy: positionData,
          material: mat,
          outline: true,
          outlineColor: Cesium.Color.SKYBLUE,
          outlineWidth: 4,
        },
      });
      return shape;
    };
    /**
     * @author:
     * @Date: 2022-04-11 16:46:11
     * @note: 注意事项
     * @description: 绘制线
     * @param {*} positions
     */
    const drawPolyline = (positions) => {
      const { viewer } = store.state;
      if (positions.length < 1) return;

      let startP = positions[0];
      let endP = positions[positions.length - 1];
      if (startP.x != endP.x && startP.y != endP.y && startP.z != endP.z)
        positions.push(positions[0]);

      return viewer.entities.add({
        name: "polyline",
        polyline: {
          positions: positions,
          width: 2.0,
          material: Cesium.Color.SKYBLUE,
          clampToGround: true,
        },
      });
    };

    const reflectWater = () => {
      const { viewer } = store.state;
      const aaa = new WaterPrimitive({
        scene: viewer.scene,
        positions: activeShapePoints,
        height: 10,
        rippleSize: 100,
      });
    };

    /**
     * @author:
     * @Date: 2022-04-11 16:45:05
     * @note: 注意事项
     * @description: 淹没分析
     */
    const induationAnalysis = () => {
      const { viewer } = store.state;
      // if (
      //   Number(warningWaterHeight) < Number(minWaterHeight) ||
      //   Number(warningWaterHeight) > Number(maxWaterHeight)
      // ) {
      //   // vue2 写法
      //   // this.$message({
      //   //   message: '预警高度必须在最小高度和最小高度之间',
      //   //   type: 'warning'
      //   // });
      //   // vue3写法
      //   ElMessage.success({
      //     message: "预警高度必须在最小高度和最小高度之间",
      //     type: "warning",
      //   });
      //   return;
      // }

      warningWaterHeight = minWaterHeight + 0.1;
      let shape = viewer.entities.add({
        polygon: {
          hierarchy: activeShapePoints,
          material: Cesium.Color.fromBytes(64, 157, 253, 20),
          extrudedHeight: Number(warningWaterHeight),
          outline: true,
          outlineColor: Cesium.Color.RED,
          outlineWidth: 4,
          // perPositionHeight: true
        },
      });
      tempEntities.push(shape);

      waterHeightShow = true;
      waterHeight = Number(minWaterHeight);
      const en = viewer.entities.add({
        polygon: {
          hierarchy: activeShapePoints,
          extrudedHeight: new Cesium.CallbackProperty(() => {
            return waterHeight;
          }, false),
          material: Cesium.Color.fromBytes(64, 157, 253, 150),
        },
      });
      tempEntities.push(en);

      let garphicPos = [];
      for (let i = 0; i < activeShapePoints.length; i++) {
        let pos = cartesian3ToCartographic(activeShapePoints[i]);
        garphicPos.push(pos);
      }
      let waterEntityEnd = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(
                // Cesium.Cartesian3.fromDegreesArrayHeights(activeShapePoints)
                activeShapePoints
              ),
              height: minWaterHeight,
              //     extrudedHeight: new Cesium.CallbackProperty(() => {
              //   return waterHeight;
              // }, false),
            }),
          }),
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: true,
            material: new Cesium.Material({
              fabric: {
                type: "Water",
                uniforms: {
                  baseWaterColor: new Cesium.Color(
                    64 / 255.0,
                    157 / 255.0,
                    253 / 255.0,
                    0.5
                  ),
                  normalMap:
                    "../../../../../public/static/texture/waterNormals.jpg",
                  frequency: 1000.0, //波的数量
                  animationSpeed: 0.05, //水震动的速度
                  amplitude: 10.0, //振幅大小
                  specularIntensity: 10,
                },
                // source: `

                // `,
              },
            }),
            //             fragmentShaderSource: `
            //         in vec2 v_st;
            //         in vec3 v_positionEC;
            //         in vec3 v_normalEC;
            //         in vec3 positionWC;
            //         in vec3 iMouse = vec3(0.0, 0.0 ,0.0 )
            //       void main( out vec4 fragColor, in vec2 fragCoord )
            // {
            //     float resolution = 10. * exp2(-3.*iMouse.x/iResolution.x);
            // 	vec2 uv = fragCoord.xy / iResolution.y * resolution;
            //     vec2 p0 = floor(uv);

            //     vec2 circles = vec2(0.);
            //     for (int j = -MAX_RADIUS; j <= MAX_RADIUS; ++j)
            //     {
            //         for (int i = -MAX_RADIUS; i <= MAX_RADIUS; ++i)
            //         {
            // 			vec2 pi = p0 + vec2(i, j);
            //             #if DOUBLE_HASH
            //             vec2 hsh = hash22(pi);
            //             #else
            //             vec2 hsh = pi;
            //             #endif
            //             vec2 p = pi + hash22(hsh);

            //             float t = fract(0.3*iTime + hash12(hsh));
            //             vec2 v = p - uv;
            //             float d = length(v) - (float(MAX_RADIUS) + 1.)*t;

            //             float h = 1e-3;
            //             float d1 = d - h;
            //             float d2 = d + h;
            //             float p1 = sin(31.*d1) * smoothstep(-0.6, -0.3, d1) * smoothstep(0., -0.3, d1);
            //             float p2 = sin(31.*d2) * smoothstep(-0.6, -0.3, d2) * smoothstep(0., -0.3, d2);
            //             circles += 0.5 * normalize(v) * ((p2 - p1) / (2. * h) * (1. - t) * (1. - t));
            //         }
            //     }
            //     circles /= float((MAX_RADIUS*2+1)*(MAX_RADIUS*2+1));

            //     float intensity = mix(0.01, 0.15, smoothstep(0.1, 0.6, abs(fract(0.05*iTime + 0.5)*2.-1.)));
            //     vec3 n = vec3(circles, sqrt(1. - dot(circles, circles)));
            //     vec3 color = texture(iChannel0, uv/resolution - intensity*n.xy).rgb + 5.*pow(clamp(dot(n, normalize(vec3(1., 0.7, 0.5))), 0., 1.), 6.);
            //     out_FragColor = vec4(color, 1.0);
            // }
            //                 `,
          }),
          show: true,
        })
      );
      // let waterEntityEnd = createWaterPrimitive(activeShapePoints, maxWaterHeight);
      // let waterEntityEnd = createWaterPrimitive2();
      tempEntities.push(waterEntityEnd);

      waterHeightTimeer = setInterval(() => {
        waterHeight += Number(speed);

        let l = speed.split(".").length > 1 ? speed.split(".")[1].length : 0;
        waterHeight = Number(waterHeight.toFixed(l));
        maxWaterHeight = Number(maxWaterHeight);
        minWaterHeight = Number(minWaterHeight);
        if (waterHeight > maxWaterHeight || waterHeight < minWaterHeight) {
          clearInterval(waterHeightTimeer);
          waterHeight =
            waterHeight > maxWaterHeight ? maxWaterHeight : minWaterHeight;
        }
      }, 1000);
    };

    const induationAnalysis2 = () => {
      const { viewer } = store.state;
      //运行
      measureAreaSpace(viewer, handler, 2000, 10, 1); //maxH 设置为2000;最大淹没海拔 每10毫秒前进1海拔;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(102.5, 30.0, 50000),
      });
    };

    const createWaterPrimitive2 = () => {
      const { viewer } = store.state;
      let vs =
        "out vec3 position;" +
        "out vec2 st;" +
        "uniform mat4 u_modelViewMatrix;" +
        "uniform mat4 u_invWorldViewMatrix;" +
        //'uniform vec2 u_texCoordOffset;' +
        //'uniform vec2 u_texCoordScale;' +
        //'uniform float u_frameTime;' +
        "uniform int u_clampToGroud;" +
        "uniform vec3 u_camPos;" +
        "uniform vec3 u_scale;" +
        //'varying vec3 eyeDir;' +
        "out vec3 vToEye;" +
        //'varying vec2 texCoord;' +
        "out vec2 vUv;" +
        //'varying float myTime;' +
        //'varying vec4 projectionCoord;' +
        "out vec4 vCoord;" +
        "void main(void)" +
        "{" +
        //gl_Position = ftransform();
        "vec4 positionW = u_modelViewMatrix * vec4(position.xyz, 1.0);" +
        "vec4 eyep = czm_modelView * positionW;" +
        "gl_Position = czm_projection * eyep; " +
        "if (u_clampToGroud == 1)" +
        "{" +
        //'eyeDir = (u_camPos - position.xyz) * u_scale;' +vToEye
        "vToEye = (u_camPos - position.xyz) * u_scale;" +
        "} else {" +
        "vec4 pos = u_modelViewMatrix * vec4(position.xyz,1.0);" +
        //'eyeDir = vec3(u_invWorldViewMatrix*vec4(pos.xyz,0.0));' +
        "vToEye = vec3(u_invWorldViewMatrix*vec4(pos.xyz,0.0));" +
        //'projectionCoord = gl_Position;' +
        "vCoord = gl_Position;" +
        "}" +
        //'texCoord = (st+u_texCoordOffset)*u_texCoordScale;' +
        //'vUv = (st+u_texCoordOffset)*u_texCoordScale;' +
        "vUv = st;" +
        //'myTime = 0.01 * u_frameTime;' +
        "}";
      let fs = [
        "uniform sampler2D tReflectionMap;",
        "uniform sampler2D tRefractionMap;",
        "uniform sampler2D tNormalMap0;",
        "uniform sampler2D tNormalMap1;",
        "uniform sampler2D tFlowMap;",

        "uniform vec3 color;",
        "uniform float reflectivity;",
        "uniform vec4 config;",

        "in vec4 vCoord;",
        "in vec2 vUv;",
        "in vec3 vToEye;",

        "void main() {",
        "	float flowMapOffset0 = config.x;",
        "	float flowMapOffset1 = config.y;",
        "	float halfCycle = config.z;",
        "	float scale = config.w;",

        "	vec3 toEye = normalize( vToEye );",

        // determine flow direction
        "	vec2 flow;",
        //'	#ifdef USE_FLOWMAP',
        //'		flow = texture( tFlowMap, vUv ).rg * 2.0 - 1.0;',
        "		flow = texture( tFlowMap, vUv ).rg;",
        //'	#else',
        //'		flow = flowDirection;',
        //'	#endif',
        //'	flow.x *= - 1.0;',

        // sample normal maps (distort uvs with flowdata)
        "	vec4 normalColor0 = texture( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );",
        "	vec4 normalColor1 = texture( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );",

        "	float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;",
        "	vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );",

        "	vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );",

        // calculate the fresnel term to blend reflection and refraction maps
        "	float theta = max( dot( toEye, normal ), 0.0 );",
        "	float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );",

        // calculate final uv coords
        "	vec3 coord = vCoord.xyz / vCoord.w;",
        "   vec2 coord1 = gl_FragCoord.xy / czm_viewport.zw;",
        "	vec2 uv = coord1.xy + coord.z * normal.xz * 0.05;",

        "	vec4 reflectColor = texture( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );",
        "	vec4 refractColor = texture( tRefractionMap, uv );",

        "	out_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );",
        "out_FragColor = refractColor;",
        "}",
      ].join("\n");
      let waterEntityEnd = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: Cesium.Rectangle.fromDegrees(
                -180.0,
                -90.0,
                180.0,
                90.0
              ),
              vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
            }),
          }),
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false,
            material: new Cesium.Material({
              fabric: {
                type: "Water",
                uniforms: {
                  specularMap:
                    "../../../../../public/static/texture/waterNormals.jpg",
                  normalMap: Cesium.buildModuleUrl(
                    "../../../../../public/static/texture/waterNormals.jpg"
                  ),
                  frequency: 10000.0,
                  animationSpeed: 0.01,
                  amplitude: 1.0,
                },
              },
            }),
            // vertexShaderSource: vs,
            // fragmentShaderSource: fs,
            fragmentShaderSource:
              "in vec3 v_positionMC;\n" +
              "in vec3 v_positionEC;\n" +
              "in vec2 v_st;\n" +
              "void main()\n" +
              "{\n" +
              "czm_materialInput materialInput;\n" +
              "vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n" +
              "#ifdef FACE_FORWARD\n" +
              "normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n" +
              "#endif\n" +
              "materialInput.s = v_st.s;\n" +
              "materialInput.st = v_st;\n" +
              "materialInput.str = vec3(v_st, 0.0);\n" +
              "materialInput.normalEC = normalEC;\n" +
              "materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n" +
              "vec3 positionToEyeEC = -v_positionEC;\n" +
              "materialInput.positionToEyeEC = positionToEyeEC;\n" +
              "czm_material material = czm_getMaterial(materialInput);\n" +
              "#ifdef FLAT\n" +
              "out_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n" +
              "#else\n" +
              "out_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);\n" +
              "out_FragColor.a=0.85;\n" +
              "#endif\n" +
              "}\n",
          }),
          show: true,
        })
      );
      return waterEntityEnd;
    };
    const createWaterPrimitive = (activeShapePoints, maxWaterHeight) => {
      const { viewer } = store.state;
      let planePos = Cesium.Cartesian3.fromDegrees(110, 40, 0);
      let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(planePos);
      let planeNor = Cesium.Cartesian3.normalize(
        planePos,
        new Cesium.Cartesian3()
      );
      // 自定义材质
      let aper = new Cesium.MaterialAppearance({
        material: new Cesium.Material({
          fabric: {
            uniforms: {
              iTime: 0,
              planeNor: planeNor,
              skyBoxU: "../../../../../public/static/texture/py.png",
              skyBoxD: "../../../../../public/static/texture/ny.png",
              skyBoxR: "../../../../../public/static/texture/px.png",
              skyBoxL: "../../../../../public/static/texture/nx.png",
              skyBoxF: "../../../../../public/static/texture/nz.png",
              skyBoxB: "../../../../../public/static/texture/pz.png",
            },
            // uniforms: {
            //   baseWaterColor: new Cesium.Color(
            //     64 / 255.0,
            //     157 / 255.0,
            //     253 / 255.0,
            //     0.5
            //   ),
            //   normalMap:
            //     "../../../../../public/static/texture/waterNormals.jpg",
            //   frequency: 1000.0,
            //   animationSpeed: 0.05,
            //   amplitude: 10.0,
            //   specularIntensity: 10,
            // },
            source: `
        const int NUM_STEPS = 8;
      const float PI     = 3.141592;
      const float EPSILON  = 1e-3;
      //#define EPSILON_NRM (0.1 / iResolution.x)
      #define EPSILON_NRM (0.1 / 200.0)
      // sea
      const int ITER_GEOMETRY = 3;
      const int ITER_FRAGMENT = 5;
      const float SEA_HEIGHT = 0.6;
      const float SEA_CHOPPY = 4.0;
      const float SEA_SPEED = 1.8;
      const float SEA_FREQ = 0.16;
      const vec3 SEA_BASE = vec3(0.1,0.19,0.22);
      const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
      //#define SEA_TIME (1.0 + iTime * SEA_SPEED)
      const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);
      // math
      mat3 fromEuler(vec3 ang) {
        vec2 a1 = vec2(sin(ang.x),cos(ang.x));
        vec2 a2 = vec2(sin(ang.y),cos(ang.y));
        vec2 a3 = vec2(sin(ang.z),cos(ang.z));
        mat3 m;
        m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
        m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
        m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
        return m;
      }
      float hash( vec2 p ) {
        float h = dot(p,vec2(127.1,311.7));
        return fract(sin(h)*43758.5453123);
      }
      float noise( in vec2 p ) {
        vec2 i = floor( p );
        vec2 f = fract( p );
        vec2 u = f*f*(3.0-2.0*f);
        return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),
                 hash( i + vec2(1.0,0.0) ), u.x),
              mix( hash( i + vec2(0.0,1.0) ),
                 hash( i + vec2(1.0,1.0) ), u.x), u.y);
      }
      // lighting
      float diffuse(vec3 n,vec3 l,float p) {
        return pow(dot(n,l) * 0.4 + 0.6,p);
      }
      float specular(vec3 n,vec3 l,vec3 e,float s) {
        float nrm = (s + 8.0) / (PI * 8.0);
        return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
      }
      // sky
      vec3 getSkyColor(vec3 e) {
        e.y = max(e.y,0.0);
        return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
      }
      // sea
      float sea_octave(vec2 uv, float choppy) {
        uv += noise(uv);
        vec2 wv = 1.0-abs(sin(uv));
        vec2 swv = abs(cos(uv));
        wv = mix(wv,swv,wv);
        return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
      }
      float map(vec3 p) {
        float freq = SEA_FREQ;
        float amp = SEA_HEIGHT;
        float choppy = SEA_CHOPPY;
        vec2 uv = p.xz; uv.x *= 0.75;
        float d, h = 0.0;
        float SEA_TIME = 1.0 + iTime * SEA_SPEED;
        for(int i = 0; i < ITER_GEOMETRY; i++) {
          d = sea_octave((uv+SEA_TIME)*freq,choppy);
          d += sea_octave((uv-SEA_TIME)*freq,choppy);
          h += d * amp;
          uv *= octave_m; freq *= 1.9; amp *= 0.22;
          choppy = mix(choppy,1.0,0.2);
        }
        return p.y - h;
      }
      float map_detailed(vec3 p) {
        float freq = SEA_FREQ;
        float amp = SEA_HEIGHT;
        float choppy = SEA_CHOPPY;
        vec2 uv = p.xz; uv.x *= 0.75;
        float SEA_TIME = 1.0 + iTime * SEA_SPEED;
        float d, h = 0.0;
        for(int i = 0; i < ITER_FRAGMENT; i++) {
          d = sea_octave((uv+SEA_TIME)*freq,choppy);
          d += sea_octave((uv-SEA_TIME)*freq,choppy);
          h += d * amp;
          uv *= octave_m; freq *= 1.9; amp *= 0.22;
          choppy = mix(choppy,1.0,0.2);
        }
        return p.y - h;
      }
      vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {
        float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);
        fresnel = pow(fresnel,3.0) * 0.65;
        vec3 reflected = getSkyColor(reflect(eye,n));
        vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12;
        vec3 color = mix(refracted,reflected,fresnel);
        float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);
        color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
        color += vec3(specular(n,l,eye,60.0));
        return color;
      }
      // tracing
      vec3 getNormal(vec3 p, float eps) {
        vec3 n;
        n.y = map_detailed(p);
        n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
        n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
        n.y = eps;
        return normalize(n);
      }
      float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {
        float tm = 0.0;
        float tx = 1000.0;
        float hx = map(ori + dir * tx);
        if(hx > 0.0) return tx;
        float hm = map(ori + dir * tm);
        float tmid = 0.0;
        for(int i = 0; i < NUM_STEPS; i++) {
          tmid = mix(tm,tx, hm/(hm-hx));
          p = ori + dir * tmid;
          float hmid = map(p);
          if(hmid < 0.0) {
            tx = tmid;
            hx = hmid;
          } else {
            tm = tmid;
            hm = hmid;
          }
        }
        return tmid;
      }
           vec4 czm_getMaterial(vec2 vUv, vec3 positionWC)
           {
            vec2 uv = vUv;
            uv = vUv * 2.0 - 1.0;
            // return texture(skyBox,uv);
            float time = iTime * 0.3 + 0.0*0.01;
            // ray
            vec3 ang = vec3(0, 1.2, 0.0);
              vec3 ori = vec3(0.0,3.5,0);
            vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.15;
            dir = normalize(dir) * fromEuler(ang);
            // tracing
            vec3 p;
            heightMapTracing(ori,dir,p);
            vec3 dist = p - ori;
            vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
            vec3 light = normalize(vec3(0.0,1.0,0.8));
            // color
            vec3 color = mix(
              getSkyColor(dir),
              getSeaColor(p,n,light,dir,dist),
              pow(smoothstep(0.0,-0.05,dir.y),0.3)
            );
            vec3 cameraPos = czm_encodedCameraPositionMCHigh + czm_encodedCameraPositionMCLow;
            vec3 inDir = normalize(positionWC - cameraPos);
            vec3 refDir = normalize( reflect(inDir, planeNor) );
            vec2 dirOnUp = normalize( vec2(refDir.x,refDir.y) );
            float theta = acos(dot(refDir, vec3(0,0,1.0)));
            float len = tan(theta);
            vec2 dirOnPlane = normalize( vec2(refDir.x,refDir.y) );
            vec2 interPos = len * dirOnPlane;
            vec2 uvSky = (interPos+1.0)/2.0;
            vec3 skyColor = texture(skyBoxU,uvSky).rgb;
            // skyColor = vec3(1.0,1.0,0.0);
            if(refDir.z<0.0){
              theta = acos(dot(refDir, vec3(0,0,-1.0)));
              len = tan(theta);
              dirOnPlane = normalize( vec2(refDir.x,-refDir.y) );
              interPos = len * dirOnPlane;
              uvSky = (interPos+1.0)/2.0;
              skyColor = texture(skyBoxD,uvSky).rgb;
              // skyColor = vec3(1.0,1.0,1.0);
            }
            if(abs(interPos.x)>1.0 || abs(interPos.y)>1.0){
              float thetaX = acos(dot(dirOnUp, vec2(1.0,0.0)));
              float thetaXM = acos(dot(dirOnUp, vec2(-1.0,0.0)));
              float thetaY = acos(dot(dirOnUp, vec2(0.0,1.0)));
              float thetaYM = acos(dot(dirOnUp, vec2(0.0,-1.0)));
              if(thetaX<PI/4.0){
                theta = acos(dot(refDir, vec3(1.0,0,0)));
                len = tan(theta);
                dirOnPlane = normalize( vec2(refDir.y,refDir.z) );
                interPos = len * dirOnPlane;
                uvSky = (interPos+1.0)/2.0;
                skyColor = texture(skyBoxR,uvSky).rgb;
                // skyColor = vec3(0.0,1.0,0);
              }else if(thetaXM<PI/4.0){
                theta = acos(dot(refDir, vec3(-1.0,0,0)));
                len = tan(theta);
                dirOnPlane = normalize( vec2(-refDir.y,refDir.z) );
                interPos = len * dirOnPlane;
                uvSky = (interPos+1.0)/2.0;
                skyColor = texture(skyBoxL,uvSky).rgb;
                // skyColor = vec3(0.0,0.0,1.0);
              }else if(thetaYM<PI/4.0){
                theta = acos(dot(refDir, vec3(0,1.0,0)));
                len = tan(theta);
                dirOnPlane = normalize( vec2(refDir.x,-refDir.z) );
                interPos = len * dirOnPlane;
                uvSky = (interPos+1.0)/2.0;
                skyColor = texture(skyBoxB,uvSky).rgb;
                // skyColor = vec3(1.0,0.5,0.0);
              }else if(thetaY<PI/4.0){
                theta = acos(dot(refDir, vec3(0,-1.0,0)));
                len = tan(theta);
                dirOnPlane = normalize( vec2(refDir.x,-refDir.z) );
                interPos = len * dirOnPlane;
                uvSky = (interPos+1.0)/2.0;
                skyColor = texture(skyBoxF,uvSky).rgb;
                // skyColor = vec3(1.0,0.0,0.0);
              }
            }
            vec3 seaColorV3 = pow(color,vec3(0.75));
            vec3 finallColor = seaColorV3*0.4+skyColor*0.6;
            return vec4( finallColor, 1.0 );
           }
        `,
          },
        }),
        translucent: true,
        vertexShaderSource: `
        in vec3 position3DHigh;
        in vec3 position3DLow;
        // in float batchId;
        in vec2 st;
        in vec3 normal;
        out vec2 v_st;
        out vec3 v_positionEC;
        out vec3 v_normalEC;
        out vec3 positionWC;
        void main() {
            v_st = st;
            vec4 p = czm_computePosition();
            v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
            v_normalEC = czm_normal * normal;                         // normal in eye coordinates
            positionWC = position3DHigh + position3DLow;
            gl_Position = czm_modelViewProjectionRelativeToEye * p;
        }
                    `,
        fragmentShaderSource: `
        in vec2 v_st;
        in vec3 v_positionEC;
        in vec3 v_normalEC;
        in vec3 positionWC;
      void main()  {
        vec3 positionToEyeEC = -v_positionEC;
        vec3 normalEC = normalize(v_normalEC);
        czm_materialInput materialInput;
        materialInput.normalEC = normalEC;
        materialInput.positionToEyeEC = positionToEyeEC;
        materialInput.st = v_st;
        vec4 color = czm_getMaterial(v_st,positionWC);
        out_FragColor = color;
      }
                `,
      });
      let waterEntityEnd = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(
                // Cesium.Cartesian3.fromDegreesArrayHeights(activeShapePoints)
                activeShapePoints
              ),
              height: maxWaterHeight,
            }),
          }),
          // appearance: new Cesium.EllipsoidSurfaceAppearance({
          //   aboveGround: true,
          //   material: new Cesium.Material({
          //     fabric: {
          //       type: "Water",
          //       uniforms: {
          //         baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5),
          //         normalMap:
          //           "../../../../../public/static/texture/waterNormals.jpg",
          //         frequency: 1000.0,
          //         animationSpeed: 0.05,
          //         amplitude: 10.0,
          //         specularIntensity: 10,
          //       },
          //     },
          //   }),
          // }),
          appearance: aper,
          asynchronous: false,
          modelMatrix: modelMatrix,
          show: true,
        })
      );
      return waterEntityEnd;
    };
    /**
     * 笛卡尔坐标转经纬度坐标
     * @param {Cartesian3} cartesian3 笛卡尔坐标
     * @param {String } cartographicType 经纬度坐标表示类型（Radians：弧度表示 Degrees：度表示）
     * @function cartesian3ToCartographic
     * @memberof Coordinate
     */
    const cartesian3ToCartographic = (
      cartesian3,
      cartographicType = "Radians"
    ) => {
      var cartographic;
      if (cartographicType == "Radians") {
        cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
      } else if (cartographicType == "Degrees") {
        cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        cartographic = this.latitude(cartographic);
        // cartographic = Cesium.Cartographic.fromDegrees(point.lng, point.lat, point.alt);
      }
      return cartographic;
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
    /**
     * @author:
     * @Date: 2022-04-11 16:44:42
     * @note: 注意事项
     * @description: 清除当前页面所有数据
     */
    const clearAllEntities = () => {
      const { viewer } = store.state;
      if (waterHeightTimeer) {
        clearInterval(waterHeightTimeer);
      }
      let positions = [];
      const length = tempEntities.length;
      for (let f = 0; f < length; f++) {
        viewer.entities.remove(tempEntities[f]);
      }
      tempEntities = [];
      waterHeightShow = false;
      activeShapePoints = [];
      warningWaterHeight = 0;
      isDraw = !isDraw;
      floatingPoint = undefined;
      activeShape = undefined;
      if (handler) {
        handler.destroy(); // 关闭事件句柄
        handler = undefined;
      }
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      const { viewer } = store.state;
      let viewTarget = {
            lon: 109.08,
            lat: 30.94,
            alt: 3000,
            heading: -90.0, // east, default value is 0.0 (north)
            pitch: -20, // default value (looking down)
            roll: 0.0, // default value
      };
      //设置相机位置
      setView(viewer, viewTarget);
      // outlineView();
      // addTiandituMap();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      drawExtent,
      reflectWater,
      BAIMOEditWay2,
      induationAnalysis,
      induationAnalysis2,
      clearAllEntities,
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

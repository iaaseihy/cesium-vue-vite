<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-23 10:31:32
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="dragEntity()">开始拖拽</el-button>
    <el-button @click="cancelDragEntity()">取消拖拽</el-button>
    <el-button @click="addTetrahedronPrimitive()">添加旋转发光四棱锥</el-button>
    <el-button @click="addPyramidGeometry()">添加动态泛光四棱锥</el-button>
    <el-button @click="add3DTiles()">添加建筑自定义光源</el-button>
    <el-button @click="add3DTilesSnow()">添加倾斜摄影积雪效果</el-button>
    <el-button @click="BAIMOLight()">添加白模泛光效果</el-button>
    <el-button @click="wllUp()">添加向上泛光墙</el-button>
    <el-button @click="wallCustom()">添加向下泛光墙</el-button>
    <el-button @click="boolInside()">判断点是否在泛光墙内</el-button>
    <el-button @click="BAIMOEdit()">白膜变色(鼠标点击事件报错)</el-button>
    <el-button @click="BAIMOEditWay2()">白膜变色2</el-button>
    <el-button @click="modifyMap()">添加暗色电子地图</el-button>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import { defineComponent, onMounted, onUnmounted, ref, reactive } from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import {
  LOCAL_IMG_URL,
  LOCAL_TERRAIN_URL,
  DAYANTA3DTILES,
  BAIMO3DTILES,
  GAODE_IMG_URL,
} from "../../../commonJS/config.js";
import WallDiffuseMaterialProperty from "../../../commonJS/WallDiffuseMaterialProperty.js";
import WallLinkCustomMaterialProperty from "../../../commonJS/WallLinkCustomMaterialProperty.js";
import json from "../../../../../public/static/geojson/jiangsu.json";
import DragTool from "./DragTool.js";
import TetrahedronPrimitive from "./TetrahedronPrimitive.js";
import PyramidGeometry from "./PyramidGeometry.js";
import InfoTool from "./InfoTool.js";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let entities;
    let entityDrag;
    let imageryProvider;
    let layer;
    let handler;
    let tilesetBaimo = ref < Cesium.Cesium3DTileset > null;
    let pickEntity;
    let wallPosition1 = Cesium.Cartesian3.fromDegreesArrayHeights([
      104.07263175401185, 30.647622150198725, 1500.0, 104.06369117158526,
      30.648834374000277, 1500.0, 104.06437182811021, 30.62274533905387, 1500.0,
      104.07463538167119, 30.62285687644371, 1500.0, 104.07263175401185,
      30.647622150198725, 1500.0,
    ]);
    let wallPosition2 = Cesium.Cartesian3.fromDegreesArrayHeights([
      104.09816110606057, 30.659821965447698, 200.0, 104.1120972824757,
      30.65330300319938, 200.0, 104.10758419863926, 30.64592470850288, 200.0,
      104.09351691196979, 30.652434826507452, 200.0, 104.09816110606057,
      30.659821965447698, 200.0,
    ]);

    const state = reactive({
      dragtool: null,
    });
    const dragEntity = () => {
      const { viewer } = store.state;
      viewer.scene.globe.depthTestAgainstTerrain = true; // 开启地形深度探测
      entityDrag = {
        name: "点",
        id: "dragEntity",
        position: Cesium.Cartesian3.fromDegrees(104.0752, 30.6077, 460), //经纬度转世界坐标
        point: {
          show: true,
          color: Cesium.Color.GREEN,
          pixelSize: 20,
          outlineColor: Cesium.Color.YELLOW,
          outlineWidth: 3,
        },
      };
      viewer.entities.add(entityDrag);

      state.dragtool = new DragTool({ viewer });
      state.dragtool?.startDrag();
    };
    const cancelDragEntity = () => {
      const { viewer } = store.state;
      state.dragtool?.cancelDrag();
      viewer.entities.removeById("dragEntity");
    };
    const add3DTilesSnow = () => {
      const { viewer } = store.state;
      const modelArr = [];
      let tilesetModel = null;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      tilesetModel = new Cesium.Cesium3DTileset({
        // url: DAYANTA3DTILES,
        url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
        minimumPixelSize: 128,
        customShader: new Cesium.CustomShader({
          lightingModel: Cesium.LightingModel.UNLIT,
          fragmentShaderText: `
          void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
          {
              vec3 normalEC = fsInput.attributes.normalEC;
              vec3 normalMC = czm_inverseNormal * normalEC;
              vec3 color = material.diffuse;
              vec3 white = vec3(1.0,1.0,1.0);
              float m = dot(normalMC, vec3(0.0,0.0,1.0));
              m = pow(m,5.0);
              material.diffuse = mix(color, white, clamp(m,0.0,1.0) * 0.5);
          }
          `,
        }),
        enableModelExperimental: true,
      });
      // this.setOpenModelHeight(tilesetModel, true);
      // this.setModelHeight(tilesetModel, 50);
      tilesetModel.readyPromise.then(function (argument) {
        const heightOffset = 0; // 调整倾斜摄影高度，防止飘和进入地下

        const boundingSphere = tilesetModel.boundingSphere;
        const cartographic = Cesium.Cartographic.fromCartesian(
          boundingSphere.center
        );
        const surface = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        );
        const offset = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          heightOffset
        );
        const translation = Cesium.Cartesian3.subtract(
          offset,
          surface,
          new Cesium.Cartesian3()
        );
        tilesetModel.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        viewer.scene.primitives.add(tilesetModel);
        modelArr.push(tilesetModel);
      });
      viewer.flyTo(tilesetModel);
      console.log("模型积雪：" + tilesetModel);
    };
    const add3DTiles = () => {
      const { viewer } = store.state;
      const modelArr = [];
      let tilesetModel = null;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      tilesetModel = new Cesium.Cesium3DTileset({
        // url: DAYANTA3DTILES,
        url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
        minimumPixelSize: 128,
        customShader: new Cesium.CustomShader({
          lightingModel: Cesium.LightingModel.UNLIT,
          uniforms: {
            u_cameraDirectionWC: {
              type: Cesium.UniformType.VEC3,
              value: viewer.scene.camera.positionWC,
            },
            u_lightColor1: {
              type: Cesium.UniformType.VEC4,
              // value: lightPoint1.color,
              value: Cesium.Color.BLUE,
            },
            u_lightPos1: {
              type: Cesium.UniformType.VEC3,
              // value: lightPoint1.postion,
              value: Cesium.Cartesian3.fromDegrees(108.9573, 34.2274, 387.9688),
            },
            u_lightColor2: {
              type: Cesium.UniformType.VEC4,
              // value: lightPoint2.color,
              value: Cesium.Color.RED,
            },
            u_lightPos2: {
              type: Cesium.UniformType.VEC3,
              // value: lightPoint2.postion,
              value: Cesium.Cartesian3.fromDegrees(108.957, 34.226, 386.4178),
            },
            u_lightColor3: {
              type: Cesium.UniformType.VEC4,
              // value: lightPoint3.color,
              value: Cesium.Color.GREEN,
            },
            u_lightPos3: {
              type: Cesium.UniformType.VEC3,
              // value: lightPoint3.postion,
              value: Cesium.Cartesian3.fromDegrees(108.9605, 34.2223, 390.135),
            },
          },
          fragmentShaderText: `
        vec4 makeLight(vec4 lightColorHdr,vec3 lightPos,
          vec3 positionWC,vec3 positionEC,vec3 normalEC,czm_pbrParameters pbrParameters)
        {
          vec3 color = vec3(0.0);
          float mx1 = 1.0;
          vec3 light1Dir = positionWC - lightPos;
          float distance1 = length(light1Dir);
          if(distance1 < 1000.0){
            vec4 l1 = czm_view * vec4(lightPos, 1.0);
            vec3 lightDirectionEC = l1.xyz - positionEC;
            mx1 = 1.0 - distance1 / 1000.0;
            color = czm_pbrLighting(
              positionEC,
              normalEC,
              lightDirectionEC,
              lightColorHdr.xyz,
              pbrParameters
            ).xyz;
          }
          mx1 = max(color.r,max(color.g,color.b)) * pow(mx1,1.0) * 10.0;
          return vec4(color,mx1);
        }
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
        {
          material.diffuse = vec3(1.0);
          vec3 positionWC = fsInput.attributes.positionWC;
          vec3 normalEC = fsInput.attributes.normalEC;
          vec3 positionEC = fsInput.attributes.positionEC;

          vec3 lightColorHdr = czm_lightColorHdr;
          vec3 lightDirectionEC = czm_lightDirectionEC;
          lightDirectionEC = (czm_view * vec4(u_cameraDirectionWC,1.0)).xyz - positionEC;

          czm_pbrParameters pbrParameters;
          pbrParameters.diffuseColor = material.diffuse;
          pbrParameters.f0 = vec3(0.5);
          pbrParameters.roughness = 1.0;

          vec3 ligth1Color0 = czm_pbrLighting(
            positionEC,
            normalEC,
            lightDirectionEC,
            lightColorHdr,
            pbrParameters
          );

          vec4 ligth1ColorR = makeLight(u_lightColor1,u_lightPos1,positionWC,positionEC,normalEC,pbrParameters);
          vec4 ligth1ColorG = makeLight(u_lightColor2,u_lightPos2,positionWC,positionEC,normalEC,pbrParameters);
          vec4 ligth1ColorB = makeLight(u_lightColor3,u_lightPos3,positionWC,positionEC,normalEC,pbrParameters);

          vec3 finalColor = mix(ligth1Color0.rgb, ligth1ColorR.rgb, ligth1ColorR.a);
          finalColor = mix(finalColor, ligth1ColorG.rgb, ligth1ColorG.a);
          finalColor = mix(finalColor, ligth1ColorB.rgb, ligth1ColorB.a);
          material.diffuse = finalColor;
        }
        `,
        }),
        enableModelExperimental: true,
      });
      // this.setOpenModelHeight(tilesetModel, true);
      // this.setModelHeight(tilesetModel, 50);
      tilesetModel.readyPromise.then(function (argument) {
        const heightOffset = 0; // 调整倾斜摄影高度，防止飘和进入地下
        const boundingSphere = tilesetModel.boundingSphere;
        const cartographic = Cesium.Cartographic.fromCartesian(
          boundingSphere.center
        );
        const surface = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        );
        const offset = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          heightOffset
        );
        const translation = Cesium.Cartesian3.subtract(
          offset,
          surface,
          new Cesium.Cartesian3()
        );
        tilesetModel.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        viewer.scene.primitives.add(tilesetModel);
        modelArr.push(tilesetModel);
      });
      viewer.flyTo(tilesetModel);
      console.log("模型压平：" + tilesetModel);
    };
    const addTetrahedronPrimitive = () => {
      const { viewer } = store.state;
      var positionaa = Cesium.Cartesian3.fromDegrees(104.0752, 30.6077, 700.0);
      //加入场景
      var tetrahedronPrimitive = new TetrahedronPrimitive({
        viewer: viewer,
        position: positionaa,
        color: Cesium.Color.fromCssColorString("#FF0000"),
        imageUrl: "../",
      });
      viewer.scene.primitives.add(tetrahedronPrimitive);
      //开启动画
      tetrahedronPrimitive.startAnimate();
      //关闭动画
      //tetrahedronPrimitive.closeAnimate();
    };
    const addPyramidGeometry = () => {
      const { viewer } = store.state;
      viewer.scene.primitives.add(new PyramidGeometry());
    };
    const BAIMOLight = () => {
      const { viewer } = store.state;
      // 非异步加载3DTitle，并设置渐变光环
      // var tilesetBaimo = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      //   url: BAIMO3DTILES
      // }))

      // 异步加载
      const tilesetJson = {
        url: BAIMO3DTILES,
      };
      // 抬升高度
      const height = 430;
      tilesetBaimo = new Cesium.Cesium3DTileset({
        // url: DAYANTA3DTILES,
        // url: BAIMO3DTILES,
        url: Cesium.IonResource.fromAssetId(75343),
        minimumPixelSize: 128,
        customShader: new Cesium.CustomShader({
          lightingModel: Cesium.LightingModel.UNLIT,
          uniforms: {
            maxHeight: {
              type: Cesium.UniformType.FLOAT,
              value: 0.0,
            },
            minHeight: {
              type: Cesium.UniformType.FLOAT,
              value: 0.0,
            },
          },
          fragmentShaderText: `
          void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                  float curz = fsInput.attributes.positionMC.z;
                  float d = (curz - minHeight) / (maxHeight - minHeight);
                  float r = 0.01;
                  r = fract(r * czm_frameNumber);
                  float c = smoothstep(r, r+0.03, d) - smoothstep(r + 0.035,r + 0.04, d);
                  vec3 linearColor = mix(vec3(1.0,1.0,1.0) ,vec3(255.0,48.0,48.0)/255.0,r);
                  vec3 renderColor = mix(vec3(0.0,0.96,1.0) ,linearColor,c);
                  material.diffuse = renderColor;
      }`,
        }),
        backFaceCulling: false,
      });
      tilesetBaimo.readyPromise
        .then(function (tileset) {
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
          let [maxheight, minheight] = [
            tileset.properties.Height.maximum,
            tileset.properties.Height.minimum,
          ];
          tileset.customShader.setUniform("maxHeight", maxheight);
          tileset.customShader.setUniform("minHeight", minheight);
          console.log(`Maximum building height: ${maxheight}`);
          console.log(`Minimum building height: ${minheight}`);
        })
        .catch(function (error) {
          console.log(error);
        });
      viewer.scene.primitives.add(tilesetBaimo);
      viewer.flyTo(tilesetBaimo);
      pickEntity = new InfoTool(viewer);
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (movement) {
        let pick = viewer.scene.pick(movement.position);
        if (Cesium.defined(pick)) {
          console.log(pick);
          pickEntity.add(pick);
        } else {
        }
        const pickRay = viewer.camera.getPickRay(movement.position);
        const featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(
          pickRay,
          viewer.scene
        );
        console.log(featuresPromise);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    // 立体向上泛光效果
    const wllUp = () => {
      const { viewer } = store.state;
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
          positions: wallPosition1,
          // 设置高度
          maximumHeights: new Array(wallPosition1.length).fill(1000),
          minimunHeights: new Array(wallPosition1.length).fill(500),
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
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          104.06527182811021,
          30.62309533905387,
          3600
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });
      //   viewer.zoomTo(viewer.entities);
    };
    const wallCustom = () => {
      const { viewer } = store.state;
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
          positions: wallPosition1,
          disableDepthTestDistance: 50000,
          // 设置高度
          maximumHeights: new Array(wallPosition1.length).fill(700),
          minimunHeights: new Array(wallPosition1.length).fill(200),
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
          positions: wallPosition2,
          // 设置高度
          maximumHeights: new Array(wallPosition2.length).fill(700),
          minimunHeights: new Array(wallPosition2.length).fill(200),
          material: material,
        },
      });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          104.06527182811021,
          30.62309533905387,
          3600
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });
      // viewer.zoomTo(viewer.entities)
    };
    const boolInside = () => {
      let queryData = [
        [
          {
            lng: 104.07263175401185,
            lat: 30.647622150198725,
            label: "标点AA1",
          },
          { lng: 134.023442, lat: 27.44331, label: "标点AA2" },
          { lng: 105.023442, lat: 32.44311, label: "标点AA3" }, //
          { lng: 104.023442, lat: 23.44231, label: "标点AA4" },
          { lng: 105.023442, lat: 13.44311, label: "标点AA5" },
          { lng: 114.023442, lat: 33.44331, label: "标点AA6" }, //
          { lng: 124.023442, lat: 43.42311, label: "标点AA7" }, //
          { lng: 134.023442, lat: 33.42331, label: "标点AA8" },
          { lng: 144.023442, lat: 53.14311, label: "标点AA9" },
          { lng: 101.023442, lat: 23.44341, label: "标点AA10" },

          { lng: 104.06437182811021, lat: 30.62274533905387, label: "标点一" },
          { lng: 134.023442, lat: 27.44321, label: "标点二" },
          { lng: 105.023442, lat: 32.44321, label: "标点三" }, //
          { lng: 134.023442, lat: 23.44221, label: "标点四" },
          { lng: 125.023442, lat: 13.44321, label: "标点五" },
          { lng: 114.023442, lat: 33.44321, label: "标点六" }, //
          { lng: 124.023442, lat: 43.42321, label: "标点七" }, //
          { lng: 114.023442, lat: 33.42321, label: "标点八" }, //
          { lng: 124.023442, lat: 53.14321, label: "标点九" },
          { lng: 101.023442, lat: 23.44321, label: "标点十" },

          { lng: 104.07463538167119, lat: 30.62285687644371, label: "标点CC1" },
          { lng: 114.023442, lat: 27.44323, label: "标点CC2" },
          { lng: 125.023442, lat: 32.44322, label: "标点CC3" }, //
          { lng: 134.023442, lat: 23.44221, label: "标点CC4" },
          { lng: 115.023442, lat: 13.44323, label: "标点CC5" },
          { lng: 134.023442, lat: 33.44324, label: "标点CC6" },
          { lng: 104.023442, lat: 43.42322, label: "标点CC7" }, //
          { lng: 114.023442, lat: 33.42324, label: "标点CC8" }, //
          { lng: 124.023442, lat: 53.14322, label: "标点CC9" },
          { lng: 131.023442, lat: 23.44323, label: "标点CC10" },
        ],
      ];
      let pointList = [];
      let pointNameList = [];
      queryData.forEach((item) => {
        item.forEach((tag) => {
          pointList.push([tag.lng, tag.lat]);
          pointNameList.push(tag.label);
        });
      });
      let polygonList = [
        [105.0, 32.0],
        [131.0, 32.0],
        [131.0, 50.0],
        [105.0, 50.0],
        [102.0, 40.0],
        [105.0, 32.0],
      ];
      // TODO 返回在多边形内的点【存在缺陷，标点CC3】
      /* var ptsWithin = turf.pointsWithinPolygon(
    turf.points(pointList),
    turf.polygon([polygonList])
  );
  console.log(ptsWithin,'====ptsWithin===='); */
      // TODO 判断点是否在多边形内
      pointList.forEach((item, index) => {
        if (
          turf.booleanPointInPolygon(
            turf.point(item),
            turf.polygon([polygonList])
          )
        ) {
          console.log(item, "-----", pointNameList[index]);
        }
      });
    };
    const BAIMOEdit = () => {
      const { viewer } = store.state;
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
      //旧版Cesium更改着色器代码
      //   tilesetBaimo.tileVisible.addEventListener(function (tile) {
      //     const content = tile.content;
      //     const featuresLength = content.featuresLength;
      //     let feature;
      //     for (var i = 0; i < featuresLength; i += 2) {
      //       feature = content.getFeature(i);
      //       const _model = feature.content._model;
      //       _model._shouldRegenerateShaders = true;
      //       // getOwnPropertyNames:返回指定对象的所有自身属性的属性名组成的数组
      //       // forEach：对数组里的所有元素都执行一遍
      //       // Object.keys：返回
      //       Object.getOwnPropertyNames(_model._sourcePrograms).forEach(function (
      //         j
      //       ) {
      //         const _modelSourceP = _model._sourcePrograms[0];
      //         _model._rendererResources.sourceShaders[
      //           _modelSourceP.fragmentShader
      //         ] = `
      //  varying vec3 v_positionEC;
      //  void main(void){
      //    vec4 position = czm_inverseModelView * vec4(v_positionEC,1); // 位置
      //    float glowRange = 120.78; // 光环的移动范围(高度)
      //    gl_FragColor = vec4(0.0, 0.3, 0.8, 0.8); // 颜色

      //    // 小于20米的低楼都不再变暗
      //    if(position.y > 31.0) {
      //      gl_FragColor *= vec4(vec3(position.y / 31.0), 0.8); // 渐变
      //    }

      //    // 动态光环
      //    float time = fract(czm_frameNumber / 360.0);
      //    time = abs(time - 0.5) * 3.0;
      //    float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));
      //    gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - diff);
      //  }
      //  `;
      //       });
      //       _model._shouldRegenerateShaders = true;
      //     }
      //   });

      //升级Cesium到1.106.1版本后更改着色器代码
      // _fragmentShaderSource里的position.z泛光从下到上  position.y从左到右
      tilesetBaimo.tileVisible.addEventListener(function (res) {
        let content = res.content;
        let featuresLength = content.featuresLength;
        for (let i = 0; i < featuresLength; i += 2) {
          let feature = content.getFeature(i);
          let model = feature.content._model;
          if (model && model._pipelineResources) {
            let program = model._pipelineResources[1];
            const color = `vec4(0,127.5/255.,1.,1.)`;
            program._fragmentShaderSource.sources[0] = `
							uniform vec2 model_iblFactor;
							uniform mat3 model_iblReferenceFrameMatrix;
							uniform float model_luminanceAtZenith;
							uniform float u_metallicFactor;
							uniform float u_roughnessFactor;
							uniform int model_featuresLength;
							uniform sampler2D model_batchTexture;
							uniform vec4 model_textureStep;
							uniform float model_colorBlend;
							uniform bool model_commandTranslucent;
							uniform sampler2D model_pickTexture;
							in vec3 v_positionWC;
							in vec3 v_positionEC;
							in vec3 v_normalEC;
							in vec3 v_positionMC;
							in float v_featureId_0;
                            out vec4 fragColor;
							struct SelectedFeature
							{
								int id;
								vec2 st;
								vec4 color;
							};
							struct FeatureIds
							{
								int featureId_0;
							};
							vec2 computeSt(float featureId)
							{
								float stepX = model_textureStep.x;
								float centerX = model_textureStep.y;

								#ifdef MULTILINE_BATCH_TEXTURE
								float stepY = model_textureStep.z;
								float centerY = model_textureStep.w;

								float xId = mod(featureId, model_textureDimensions.x);
								float yId = floor(featureId / model_textureDimensions.x);

								return vec2(centerX + (xId * stepX), centerY + (yId * stepY));
								#else
								return vec2(centerX + (featureId * stepX), 0.5);
								#endif
							}
							void selectedFeatureIdStage(out SelectedFeature feature, FeatureIds featureIds)
							{
								int featureId = featureIds.SELECTED_FEATURE_ID;
								if (featureId < model_featuresLength)
								{
									vec2 featureSt = computeSt(float(featureId));

									feature.id = featureId;
									feature.st = featureSt;
									feature.color = texture(model_batchTexture, featureSt);
								}
								else
								{
									feature.id = model_featuresLength + 1;
									feature.st = vec2(0.0);
									feature.color = vec4(1.0);
								}

								#ifdef HAS_NULL_FEATURE_ID
								if (featureId == model_nullFeatureId) {
									feature.id = featureId;
									feature.st = vec2(0.0);
									feature.color = vec4(1.0);
								}
								#endif
							}
							SelectedFeature selectedFeature;
							void main(){
								vec4 position = czm_inverseModelView * vec4(v_positionEC,1.);//获取模型的世界坐标
								float buildMaxHeight = 30.0;//建筑群最高高度 配渐变色
								fragColor = ${color};//赋予基础底色
								fragColor *= vec4(vec3(position.z / buildMaxHeight ), 1.0);//根据楼层高度比例渲染渐变色
								float time = abs(fract(czm_frameNumber / 360.0)-0.5)*2.;//动画频率 约束在(0,1) 更改频率修改360.0
								float diffuse = step(0.005, abs(clamp(position.z / buildMaxHeight, 0.0, 1.0) - time));//根据帧数变化,光圈颜色白色,由底部朝上一丢丢(0.05)开始逐渐上移显现.
								fragColor.rgb += fragColor.rgb * (1.0 - diffuse );//单纯叠加颜色 感兴趣的可以mix混合下
							}
						`;
          }
        }
      });
      viewer.scene.primitives.add(tilesetBaimo);
      viewer.flyTo(tilesetBaimo);
    };
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
      pickEntity = new InfoTool(viewer);
      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      let pickedObject;
      handler.setInputAction(function (movement) {
        let scene = viewer.scene;
        // 判断场景的模式，不能是 变形模式
        if (scene.mode !== Cesium.SceneMode.MORPHING) {
          // scene.pick: 返回scene中指定位置的顶端的primitive属性的一个对象
          pickedObject = scene.pick(movement.position);
          // 判断是否拾取到模型
          if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
            let cartesian = viewer.scene.pickPosition(movement.position);
            // 是否获取到空间坐标
            if (Cesium.defined(cartesian)) {
              // // 空间坐标转世界坐标(弧度)
              let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              // 弧度转为角度（经纬度）
              let lon = Cesium.Math.toDegrees(cartographic.longitude);
              let lat = Cesium.Math.toDegrees(cartographic.latitude);
              //模型高度
              let height = cartographic.height;
              pickedObject.pos = Cesium.Cartesian3.fromDegrees(
                lon,
                lat,
                height
              );
              console.log("模型表面的经纬度高程是：", {
                x: lon,
                y: lat,
                height: height,
              });
            }
          }
        }

        let pick = viewer.scene.pick(movement.position);
        if (Cesium.defined(pick)) {
          pick.pos = pickedObject.pos;
          console.log(pick);
          pickEntity.add(pick);
        } else {
        }

        const pickRay = viewer.camera.getPickRay(movement.position);
        const featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(
          pickRay,
          viewer.scene
        );
        console.log(featuresPromise);

        // 获取div:nth-child(3)元素
        // let div3 = document.querySelector("div:nth-child(3)");
        let divElement = document.getElementsByClassName(
          "helsing-three-plugins-infotool"
        );
        if (divElement && divElement.length > 0) {
          let div3 = divElement[0].children[2];
          if (div3) {
            // 添加鼠标点击事件监听器
            // div3.addEventListener("click", (event) => {
            //   isClicked = true;
            //   // 在这里编写鼠标点击事件的处理逻辑
            //   console.log("鼠标点击了div:nth-child(3)");
            // });
            div3.onclick = function () {
              console.log("鼠标点击了div:nth-child(3)");
              windowClose();
            };
          }
        }

        // tilesetBaimo.tileLoad.addEventListener(function (tile) {
        //   let content = tile.content;
        //   let featuresLength = content.featuresLength;
        //   console.log("要素数量为：");
        //   console.log(featuresLength);
        //   console.log("第一个要素属性为：");
        //   let feature = content.getFeature(0).getProperty("name");
        //   console.log(feature);
        // });
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    //关闭
    const windowClose = () => {
      const { viewer } = store.state;
      if (pickEntity) {
        pickEntity.remove();
      }
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    /* Cesium修改地图颜色代码(暗色电子地图) */
    const modifyMap = () => {
      const { viewer } = store.state;
      // // 获取地图影像图层
      // const baseLayer = viewer.imageryLayers.get(0);
      // // 设置两个变量，用来判断是否进行颜色的翻转和过滤
      // const options = {
      //   invertColor: true,
      //   filterRGB: [0, 50, 100],
      // };
      // // 更改地图着色器代码
      // const baseFragShader =
      //   viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;
      // for (let i = 0; i < baseFragShader.length; i++) {
      //   // console.log(baseFragShader[i])
      //   // console.log('------')

      //   const strS =
      //     "color = czm_saturation(color, textureSaturation);\n#endif\n";
      //   let strT =
      //     "color = czm_saturation(color, textureSaturation);\n#endif\n";
      //   if (options.invertColor) {
      //     strT += `
      // color.r = 1.0 - color.r;
      // color.g = 1.0 - color.g;
      // color.b = 1.0 - color.b;
      // `;
      //   }
      //   if (options.filterRGB.length > 0) {
      //     strT += `
      // color.r = color.r * ${options.filterRGB[0]}.0/255.0;
      // color.g = color.g * ${options.filterRGB[1]}.0/255.0;
      // color.b = color.b * ${options.filterRGB[2]}.0/255.0;
      // `;
      //   }
      //   baseFragShader[i] = baseFragShader[i].replace(strS, strT);
      // }

      let options = {
        //反色?
        invertColor: true,
        //滤镜值
        filterRGB: [60, 145, 172],
      };
      DarkMap(viewer, options);
    };
    const DarkMap = (viewer, options) => {
      const baseLayer = viewer.imageryLayers.get(0);
      //以下几个参数根据实际情况修改,目前我是参照火星科技的参数,个人感觉效果还不错
      baseLayer.brightness = options.brightness || 0.6;
      baseLayer.contrast = options.contrast || 1.8;
      baseLayer.gamma = options.gamma || 0.3;
      baseLayer.hue = options.hue || 1;
      baseLayer.saturation = options.saturation || 0;
      const baseFragShader =
        viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;
      for (let i = 0; i < baseFragShader.length; i++) {
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
    };
    // 图层里添加天地图电子地图
    const addTiandituMap = () => {
      const { viewer } = store.state;
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = true; //相机与地形的碰撞检测
      viewer.scene.globe.depthTestAgainstTerrain = true; //Cesium开启地形检测,默认为false
      imageryProvider = createTdtImageryProvider({
        layer: "vec",
        // appKey: "你的天地图AppKey",
        appKey: "edd63cb6efda66a59e9d4d6f30b0a92c",
      });
      //接下来我们就要对这个图层进行处理
      layer = viewer.imageryLayers.addImageryProvider(imageryProvider);
      //调用影响中文注记服务
      //标注
      let TDT_CIA_C =
        "http://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
        "&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
        "&style=default&format=tiles&tk=edd63cb6efda66a59e9d4d6f30b0a92c";
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url: TDT_CIA_C,
          layer: "tdtImg_c",
          style: "default",
          format: "tiles",
          tileMatrixSetID: "c",
          subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
          tilingScheme: new Cesium.GeographicTilingScheme(),
          tileMatrixLabels: [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
          ],
          maximumLevel: 50,
          show: false,
        })
      );
    };
    // 加载天地图
    const createTdtImageryProvider = (params) => {
      var tileMatrixSet = "w";
      var host = params.host || "http://t{s}.tianditu.com/";
      var subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];

      if (host[host.length - 1] == "/") {
        host = host.substr(0, host.length - 1);
      }
      var url =
        host +
        "/" +
        params.layer +
        "_" +
        tileMatrixSet +
        "/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=" +
        params.layer +
        "&tileMatrixSet=" +
        tileMatrixSet +
        "&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles";
      url += "&tk=" + params.appKey;

      let provider = new Cesium.WebMapTileServiceImageryProvider({
        url: url,
        layer: params.layer,
        style: "default",
        subdomains: subdomains,
        tileMatrixSetID: tileMatrixSet,
        maximumLevel: params.maximumLevel || 18,
        minimumLevel: params.minimumLevel,
      });

      return provider;
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      addTiandituMap();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      wllUp,
      wallCustom,
      modifyMap,
      BAIMOEdit,
      BAIMOEditWay2,
      boolInside,
      dragEntity,
      cancelDragEntity,
      addTetrahedronPrimitive,
      addPyramidGeometry,
      add3DTiles,
      add3DTilesSnow,
      BAIMOLight,
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

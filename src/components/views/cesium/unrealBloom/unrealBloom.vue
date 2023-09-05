<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-09-05 14:34:17
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="BAIMOEditWay2()">白膜变色2</el-button>
    <el-button @click="modifyMap()">添加暗色电子地图</el-button>
    <el-button @click="unrealBloom()">添加3D描边效果</el-button>
    <el-button @click="outlineView()">添加全屏红色渐变闪烁告警</el-button>
    <el-button @click="offOutlineView()">关闭全屏红色渐变闪烁告警</el-button>
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
import createEdgeStage from "./createEdgeStage.js";
export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let entities;
    let entityDrag;
    let imageryProvider;
    let redShock;
    let handler;
    let tilesetBaimo = ref < Cesium.Cesium3DTileset > null;
    let pickEntity;

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
    // 添加3D描边效果
    const unrealBloom = () => {
      const { viewer } = store.state;
      // 添加3d tiles调试面板
      // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
      // var inspectorViewModel = viewer.cesium3DTilesInspector.viewModel;
      // console.log("inspectorViewModel: ", inspectorViewModel);
      viewer.resolutionScale = devicePixelRatio;
      viewer.postProcessStages.fxaa.enabled = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      //entities
      var box = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          106.64738201924,
          26.620452464821,
          1200
        ),
        box: {
          dimensions: new Cesium.Cartesian3(100, 100, 100),
          material: Cesium.Color.GREY,
        },
      });
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          106.64748201924,
          26.621452464821,
          1200
        ),
        ellipsoid: {
          radii: new Cesium.Cartesian3(50, 50, 50),
          material: Cesium.Color.GREY,
        },
      });

      //3d tiles
      var tileset = new Cesium.Cesium3DTileset({
        // url: 'http://localhost:6060/Data/BAIMO/building/tileset.json',
        // url: BAIMO3DTILES,
        url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
      });
      viewer.scene.primitives.add(tileset);
      tileset.readyPromise.then(() => {
        viewer.flyTo(tileset);
      });

      // 抬升高度
      const height = 430;
      tilesetBaimo = new Cesium.Cesium3DTileset({
        // url: DAYANTA3DTILES,
        url: BAIMO3DTILES,
        minimumPixelSize: 128,
        // customShader: new Cesium.CustomShader({
        //   lightingModel: Cesium.LightingModel.UNLIT,
        //   fragmentShaderText: `
        //       void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        //           float _baseHeight = 0.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
        //           float _heightRange = 60.0; // 高亮的范围(_baseHeight ~ _baseHeight + _      heightRange) 默认是 0-60米
        //           float _glowRange = 300.0; // 光环的移动范围(高度)
        //           float vtxf_height = fsInput.attributes.positionMC.z-_baseHeight;
        //           float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
        //           float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
        //           material.diffuse*= vec3(vtxf_a12, vtxf_a12, vtxf_a12);
        //           float vtxf_a13 = fract(czm_frameNumber / 360.0);
        //           float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
        //           vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
        //           float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
        //           material.diffuse += material.diffuse * (1.0 - vtxf_diff);
        //       }	 	
        //       `,
        // }),
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
    //     viewer.scene.primitives.add(tilesetBaimo);
    //     tilesetBaimo.readyPromise.then(() => {
    //     viewer.flyTo(tilesetBaimo);
    //   });

      viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
        (e) => {
          viewer.flyTo(box);
          e.cancel = true;
        }
      );

    //   viewer.camera.flyTo({
    //     destination: Cesium.Cartesian3.fromDegrees(
    //       106.64748201924,
    //       26.601452464821,
    //       5200
    //     ),
    //     orientation: {
    //       heading: Cesium.Math.toRadians(0),
    //       pitch: Cesium.Math.toRadians(0),
    //       roll: 0,
    //     },
    //   });

      window.cesiumView = viewer;
      window.version = Cesium.version;
      //鼠标点击，拾取对象并高亮显示
      viewer.screenSpaceEventHandler.setInputAction((e) => {
        var mousePosition = e.position;
        var picked = viewer.scene.pick(mousePosition);

        edgeStage.selected = [];
        edgeStage.enabled = false;

        if (picked && picked.primitive) {
          let primitive = picked.primitive;
          let pickIds = primitive._pickIds;
          let pickId = picked.pickId;

          if (!pickId && !pickIds && picked.content) {
            pickIds = picked.content._model._pickIds;
          }

          if (!pickId) {
            if (picked.id) {
              pickId = pickIds.find((pickId) => {
                return pickId.object == picked;
              });
            } else if (pickIds) {
              pickId = pickIds[0];
            }
          }

          if (pickId) {
            let pickObject = {
              pickId: pickId,
            };
            edgeStage.selected = [pickObject];
            cesiumStage.selected = [pickObject];
            edgeStage.enabled = !cesiumStage.enabled;
          } else {
            $message.alert("未找到pickId");
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      //
      var edgeStage = createEdgeStage();
      // edgeStage.visibleEdgeColor = Cesium.Color.fromCssColorString("#a8a8e0");
      edgeStage.visibleEdgeColor =
        Cesium.Color.fromCssColorString("rgb(244, 4, 4)");
      edgeStage.hiddenEdgeColor = Cesium.Color.fromCssColorString("#4d4d4d");
      edgeStage.selected = [];
      edgeStage.enabled = false;
      viewer.postProcessStages.add(edgeStage);

      var cesiumStage = Cesium.PostProcessStageLibrary.createSilhouetteStage();
      cesiumStage.enabled = false;
      viewer.postProcessStages.add(cesiumStage);
    };
    // Cesium全屏红色渐变闪烁告警
    const outlineView = () => {
        const { viewer } = store.state;
        const fragmentShaderSource = /* glsl */ `
              // b.x = width
              // b.y = height
              // r.x = roundness top-right  
              // r.y = roundness boottom-right
              // r.z = roundness top-left
              // r.w = roundness bottom-left
              float sdRoundBox( in vec2 p, in vec2 b, in vec4 r ) 
              {
                  r.xy = (p.x>0.0)?r.xy : r.zw;
                  r.x  = (p.y>0.0)?r.x  : r.y;
                  vec2 q = abs(p)-b+r.x;
                  return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
              }

              uniform sampler2D colorTexture; 
              in vec2 v_textureCoordinates; 

              void main(void) 
              { 

                // gl_FragCoord.xy / czm_viewport.zw 根据视口的宽度和高度, 通过除法将窗口坐标分量缩放到[0, 1]
                // cesium是以左下角为远点, 而sdRoundBox是根据中点为原点实现的, 所以将p的范围从[0,1]更改为[-1,1]，这样它就可以在两个方向上都跨越原点。
                // 这将使p.x > 0.0和p.y > 0.0这样的判断有意义，这样你就可以在四个方向上都看到红色边缘了。
                // 1.缩放：我们将gl_FragCoord.xy除以(czm_viewport.zw / 2.0)。这样得到的结果p就在[0, 2]的范围内。这是因为gl_FragCoord.xy的最大值是czm_viewport.zw，除以czm_viewport.zw / 2.0得到的结果就是2。
                // 2.偏移：然后，我们从得到的结果中减去1，将范围从[0, 2]转化到了[-1, 1]。
                vec2 p = (gl_FragCoord.xy / (czm_viewport.zw / 2.0)) - 1.0;

                

                float d= sdRoundBox(p,vec2(0.8, 0.7),vec4(0.1));
                // vec3 col = mix(vec3(0.0), vec3(1.0, 0.0, 0.0), d > 0.0 ? 1.0 : 0.0);
                vec3 col = mix(vec3(0.0), vec3(1.0, 0.0, 0.0)* abs(sin(czm_frameNumber*9.5))* (d / 0.35), d > 0.0 ? 1.0 : 0.0);

                vec3 originalColor = texture(colorTexture, v_textureCoordinates).rgb;
                out_FragColor = mix(vec4(originalColor, 1.0)*2.0, vec4(col, 1.0), 0.5);
                // out_FragColor = vec4(col,1.0);
              }
              `;
      viewer.scene.postProcessStages.add(
        redShock = new Cesium.PostProcessStage({
          fragmentShader: fragmentShaderSource,
        })
      )
    };
    const offOutlineView = () => {
      const { viewer } = store.state;
      console.log(viewer.scene.postProcessStages);
      // viewer.scene.postProcessStages && viewer.scene.postProcessStages
      if (redShock) {
        viewer.scene.postProcessStages.remove(redShock);
      }
    };
    const handleClear = () => {
      const { viewer } = store.state;
      offOutlineView();
    };
    onMounted(() => {
        // outlineView();
      // addTiandituMap();
      // unrealBloom();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      modifyMap,
      BAIMOEditWay2,
      unrealBloom,
      outlineView,
      offOutlineView,
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

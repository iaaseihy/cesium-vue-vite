<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-14 16:57:19
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="wllUp()">添加向上泛光墙</span>
        <span @click="wallCustom()">添加向下泛光墙</span>
        <span @click="boolInside()">判断点是否在泛光墙内</span>
        <span @click="BAIMOEdit()">白膜变色</span>
        <span @click="modifyMap()">添加暗色电子地图</span>
      </li>
    </ul>
  </div>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="dragEntity()">开始拖拽</el-button>
    <el-button @click="cancelDragEntity()">取消拖拽</el-button>
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

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let entities;
    let entityDrag;
    let tilesetBaimo = ref < Cesium.Cesium3DTileset > null;
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
      viewer.entities.removeById('dragEntity');
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
								float buildMaxHeight = 100.0;//建筑群最高高度 配渐变色
								fragColor = ${color};//赋予基础底色
								fragColor *= vec4(vec3(position.y / buildMaxHeight ), 1.0);//根据楼层高度比例渲染渐变色
								float time = abs(fract(czm_frameNumber / 360.0)-0.5)*2.;//动画频率 约束在(0,1) 更改频率修改360.0
								float diffuse = step(0.005, abs(clamp(position.y / buildMaxHeight, 0.0, 1.0) - time));//根据帧数变化,光圈颜色白色,由底部朝上一丢丢(0.05)开始逐渐上移显现.
								fragColor.rgb += fragColor.rgb * (1.0 - diffuse );//单纯叠加颜色 感兴趣的可以mix混合下
							}
						`;
          }
        }
      });
      viewer.flyTo(tilesetBaimo);
    };
    /* Cesium修改地图颜色代码(暗色电子地图) */
    const modifyMap = () => {
      const { viewer } = store.state;
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
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {});
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      wllUp,
      wallCustom,
      modifyMap,
      BAIMOEdit,
      boolInside,
      dragEntity,
      cancelDragEntity,
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
  top: 500px;
  right: 100px;
  z-index: 200;
  width: 200px;
  height: 100px;
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

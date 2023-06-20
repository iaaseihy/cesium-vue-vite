<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-02 15:01:51
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div class="panel_view">
    <ul class="volume-main">
      <li class="volume-clear">
        <span @click="addEdgeStage()">添加</span>
        <span @click="handleClear()">清空</span>
      </li>
    </ul>
  </div>
</template>

<script>
import * as Cesium from "cesium";
// import {Cesium} from './Cesium/Cesium.js'
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";
import { DAYANTA3DTILES, BAIMO3DTILES } from "@/components/commonJS/config";
import { getGeojson } from "@/api/api.js";
import createEdgeStage from "./CesiumEdgeStage/createEdgeStage1.102";
import CesiumContainer from "@/views/CesiumContainer.vue";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let cesiumHeatMap = ref(null);
    let tilesetBaimo = ref();
    // const { viewer } = store.state;

    // 添加热力图
    const addEdgeStage = async () => {
      const { viewer } = store.state;
      //   viewer.animation = false;
      //   viewer.selectionIndicator = false;
      //   viewer.geocoder = false;

      viewer.resolutionScale = devicePixelRatio;
      viewer.postProcessStages.fxaa.enabled = true;
      viewer.scene.globe.depthTestAgainstTerrain = true;

      //entities
      var box = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          106.64738201924,
          26.620452464821,
          1250
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
          1250
        ),
        ellipsoid: {
          radii: new Cesium.Cartesian3(50, 50, 50),
          material: Cesium.Color.GREY,
        },
      });

      //3d tiles
        // var tileset = new Cesium.Cesium3DTileset({
        //   //   url: Cesium.IonResource.fromAssetId(40866),
        //   url: DAYANTA3DTILES,
        // //   url: BAIMO3DTILES,
        // });
        // viewer.scene.primitives.add(tileset);
        // tileset.readyPromise.then(() => {
        //   viewer.flyTo(tileset);
        // });
      BAIMOEdit();

      viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
        (e) => {
          viewer.flyTo(box);
          e.cancel = true;
        }
      );

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
      edgeStage.visibleEdgeColor = Cesium.Color.fromCssColorString("#a8a8e0");
      edgeStage.hiddenEdgeColor = Cesium.Color.fromCssColorString("#4d4d4d");
      edgeStage.selected = [];
      edgeStage.enabled = false;
      viewer.postProcessStages.add(edgeStage);

      var cesiumStage = Cesium.PostProcessStageLibrary.createSilhouetteStage();
      cesiumStage.enabled = false;
      viewer.postProcessStages.add(cesiumStage);
    };
    const BAIMOEdit = () => {
      // 非异步加载3DTitle，并设置渐变光环
      // var tilesetBaimo = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
      //   url: BAIMO3DTILES
      // }))
      const { viewer } = store.state;
      // 异步加载
      const tilesetJson = {
        url: BAIMO3DTILES,
      };
      const height = 500;
      tilesetBaimo = new Cesium.Cesium3DTileset(tilesetJson);
      viewer.scene.primitives.add(tilesetBaimo);
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

      tilesetBaimo.tileVisible.addEventListener(function (tile) {
        const content = tile.content;
        const featuresLength = content.featuresLength;
        let feature;
        for (var i = 0; i < featuresLength; i += 2) {
          feature = content.getFeature(i);

          // 有_model._sourcePrograms的方法
          //   const _model = feature.content._model;
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
          //  in vec3 positionEC;
          //  out vec4 fragColor;
          //  void main(void){
          //    vec4 position = czm_inverseModelView * vec4(positionEC,1); // 位置
          //    float glowRange = 120.78; // 光环的移动范围(高度)
          //    fragColor = vec4(0.0, 0.3, 0.8, 0.8); // 颜色

          //    // 小于20米的低楼都不再变暗
          //    if(position.y > 31.0) {
          //      fragColor *= vec4(vec3(position.y / 31.0), 0.8); // 渐变
          //    }

          //    // 动态光环
          //    float time = fract(czm_frameNumber / 360.0);
          //    time = abs(time - 0.5) * 3.0;
          //    float diff = step(0.005, abs( clamp(position.y / glowRange, 0.0, 1.0) - time));
          //    fragColor.rgb += fragColor.rgb * (1.0 - diff);
          //  }
          //  `;
          //       });
          //       _model._shouldRegenerateShaders = true;

          // 没有_model._sourcePrograms的方法
          let model = feature.content._model;
          if (model && model._pipelineResources) {
            let program = model._pipelineResources[1];
            const color = `vec4(0,127.5/255.,1.,1.)`;
            program._fragmentShaderSource.sources[0] = `
                            #version 300 es;
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
								float buildMaxHeight = 300.0;//建筑群最高高度 配渐变色
								vec4 ourColor = ${color};//赋予基础底色
								ourColor *= vec4(vec3(position.y / buildMaxHeight ), 1.0);//根据楼层高度比例渲染渐变色
								float time = abs(fract(czm_frameNumber / 360.0)-0.5)*2.;//动画频率 约束在(0,1) 更改频率修改360.0
								float diffuse = step(0.005, abs(clamp(position.y / buildMaxHeight, 0.0, 1.0) - time));//根据帧数变化,光圈颜色白色,由底部朝上一丢丢(0.05)开始逐渐上移显现.
								ourColor.rgb += ourColor.rgb * (1.0 - diffuse );//单纯叠加颜色 感兴趣的可以mix混合下
                                out_FragColor = ourColor;
                            }
						`;
          }
        }
      });
      viewer.flyTo(tilesetBaimo);
    };
    const handleClear = () => {};
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      addEdgeStage,
      BAIMOEdit,
      cesiumHeatMap,
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
  height: 300px;
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

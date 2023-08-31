<!--
 * @Descripttion: wms服务加载查询 注意：动态弹窗只有在不添加地形的时候能拖动缩放不会发生位置偏移
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-25 15:59:03
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="BAIMOEditWay2()">白膜变色2</el-button>
    <el-button @click="addTexture3D()">添加体渲染</el-button>
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
import lxs_primitive from "./lxs_volumn.js";
import { noise } from "./perlin.js";
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
    const addTexture3D = () => {
      const { viewer } = store.state;

      const geometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
        dimensions: new Cesium.Cartesian3(1, 1, 1),
      });
      const primitive_modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(124.21936679679918, 45.85136872098397)
        ),
        new Cesium.Cartesian3(0.0, 0.0, 80.0),
        new Cesium.Matrix4()
      );

      viewer.entities.add({
        name: "Yellow box outline",
        position: Cesium.Cartesian3.fromDegrees(
          124.21936679679918,
          45.85136872098397,
          80.0
        ),
        box: {
          dimensions: new Cesium.Cartesian3(1.0, 1.0, 1.0),
          fill: false,
          outline: true,
          outlineColor: Cesium.Color.YELLOW,
        },
      });
      /**
       * 生成体数据
       */
      const size = 128;
      //data在0~255之间
      const data = new Uint8Array(size * size * size);
      let dx, dy, dz;
      let i = 0;
      for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            dx = (x * 1.0) / size;
            dy = (y * 1.0) / size;
            dz = (z * 1.0) / size;
            const d = noise(dx * 6.5, dy * 6.5, dz * 6.5);
            data[i++] = d * 128 + 128;
            // data[i++]=0;
          }
        }
      }
      const dim_lxs = new Cesium.Cartesian3(1, 1, 1);
    //   var geometry = Cesium.BoxGeometry.fromDimensions({
    //     vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
    //     dimensions: dim_lxs,
    //   });
    //   const primitive_modelMatrix = Cesium.Matrix4.multiplyByTranslation(
    //     Cesium.Transforms.eastNorthUpToFixedFrame(
    //       Cesium.Cartesian3.fromDegrees(124.21936679679918, 45.85136872098397)
    //     ),
    //     new Cesium.Cartesian3(0.0, 0.0, 80.0),
    //     new Cesium.Matrix4()
    //   );
      const options = {
        modelMatrix: primitive_modelMatrix,
        geometry_lxs: geometry,
        data: data,
        dim: dim_lxs,
      };
      const lxs = viewer.scene.primitives.add(new lxs_primitive(options));
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
        new Cesium.PostProcessStage({
          fragmentShader: fragmentShaderSource,
        })
      );
    };
    const handleClear = () => {
      const { viewer } = store.state;
    };
    onMounted(() => {
      // outlineView();
      // addTiandituMap();
    });
    onUnmounted(() => {
      handleClear();
    });
    return {
      handleClear,
      addTexture3D,
      BAIMOEditWay2,
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

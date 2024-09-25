/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2024-09-25 15:47:21
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2024-09-25 15:47:39
 */
/**
 * @description: 积雪效果
 * @param {*}
 * @return {*}
 */
import * as Cesium from "cesium";

export default class SnowCoverStageEffect {
  constructor(viewer, options) {
    if (!viewer) throw new Error("no viewer object!");
    options = options || {};
    this.viewer = viewer;
    this.alpha = options.alpha || 1.0;  // 透明度控制
    this.snowCoverage = options.snowCoverage || 0.5;  // 积雪覆盖率控制
    this.init();
  }

  init() {
    this.snowcoverStage = new Cesium.PostProcessStage({
      name: "czm_snowcover",
      fragmentShader: this.snowcover(),
      uniforms: {
        alpha: () => {
          return this.alpha;
        },
        snowCoverage: () => {
          return this.snowCoverage;
        }
      },
    });
    this.viewer.scene.postProcessStages.add(this.snowcoverStage);
  }

  destroy() {
    if (!this.viewer || !this.snowcoverStage) return;
    this.viewer.scene.postProcessStages.remove(this.snowcoverStage);
    Cesium.destroyObject(this.snowcoverStage);
  }

  show(visible) {
    this.snowcoverStage.enabled = visible;
  }

  changeAlpha(value) {
    this.snowcoverStage.uniforms.alpha = value;
  }

  changeSnowCoverage(value) {
    this.snowcoverStage.uniforms.snowCoverage = value;  // 改变积雪覆盖率
  }

  snowcover() {
    return `
        uniform float alpha;
        uniform float snowCoverage;  // 积雪覆盖率
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        in vec2 v_textureCoordinates;

        vec4 toEye(in vec2 uv, in float depth){
            vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
            vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
            posInCamera = posInCamera / posInCamera.w;
            return posInCamera;
        }

        float getDepth(in vec4 depth){
            float z_window = czm_unpackDepth(depth);
            z_window = czm_reverseLogDepth(z_window);
            float n_range = czm_depthRange.near;
            float f_range = czm_depthRange.far;
            return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
        }

        void main(void) {
            vec4 white = vec4(1.0, 1.0, 1.0, 1.0);  // 雪的颜色
            vec4 color = texture(colorTexture, v_textureCoordinates);  // 原始颜色
            vec4 originDepth = texture(depthTexture, v_textureCoordinates);  // 深度纹理
            float depth = czm_unpackDepth(originDepth);

            if (depth >= 1.0) {
                out_FragColor = color;
                return;
            }

            vec4 positionEC = toEye(v_textureCoordinates, depth);
            vec4 positionWC = czm_inverseView * positionEC;

            // 计算邻近像素的深度，确定法线方向
            float padx = czm_pixelRatio / czm_viewport.z;
            float pady = czm_pixelRatio / czm_viewport.w;
            float depth2 = getDepth(texture(depthTexture, v_textureCoordinates + vec2(-padx, 0.0)));
            vec4 eyeCoordinates2 = toEye(v_textureCoordinates + vec2(-padx, 0.0), depth2);
            float depth3 = getDepth(texture(depthTexture, v_textureCoordinates + vec2(padx, 0.0)));
            vec4 eyeCoordinates3 = toEye(v_textureCoordinates + vec2(padx, 0.0), depth3);
            float depth4 = getDepth(texture(depthTexture, v_textureCoordinates + vec2(0.0, -pady)));
            vec4 eyeCoordinates4 = toEye(v_textureCoordinates + vec2(0.0, -pady), depth4);
            float depth5 = getDepth(texture(depthTexture, v_textureCoordinates + vec2(0.0, pady)));
            vec4 eyeCoordinates5 = toEye(v_textureCoordinates + vec2(0.0, pady), depth5);

            // 计算法线
            vec3 dx = eyeCoordinates3.xyz - eyeCoordinates2.xyz;
            vec3 dy = eyeCoordinates4.xyz - eyeCoordinates5.xyz;
            vec3 normalEC = normalize(cross(dy, dx));
            vec3 normalWC = czm_inverseViewRotation * normalEC;
            vec3 upWC = normalize(positionWC.xyz);

            // 计算与法线的角度，确定雪的覆盖范围
            float angle = dot(upWC, normalWC);

            // 根据积雪覆盖率和角度确定积雪量
            float snowFactor = clamp(angle * snowCoverage, 0.0, 1.0);

            // 混合积雪颜色和原始颜色
            out_FragColor = mix(color, white, snowFactor * alpha);
        }
    `;
  }
}

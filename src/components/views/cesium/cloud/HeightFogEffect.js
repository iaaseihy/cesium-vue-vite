import * as Cesium from "cesium";

export default class HeightFogEffect {
  constructor(viewer, options) {
    if (!viewer) throw new Error("no viewer object!");
    options = options || {};
    this.viewer = viewer;
    this.height = options.height || 100;
    this.alpha = options.alpha || 0.88;  // 增加对 alpha 的可调性
    this.fogColor = options.fogColor || [1.0, 1.0, 1.0];  // 增加雾的颜色
    this.init();
  }

  init() {
    this.heightFogStage = new Cesium.PostProcessStage({
      name: "czm_heightfog",
      fragmentShader: this.fog(),
      uniforms: {
        alpha: this.alpha,
        height: this.height,
        fogColor: this.fogColor,  // 雾的颜色参数
        earthRadius: () => {
          return Cesium.Cartesian3.magnitude(this.viewer.camera.positionWC) - this.viewer.camera.positionCartographic.height;
        },
      },
    });
    this.viewer.scene.postProcessStages.add(this.heightFogStage);
  }

  destroy() {
    if (!this.viewer || !this.heightFogStage) return;
    this.viewer.scene.postProcessStages.remove(this.heightFogStage);
    Cesium.destroyObject(this.heightFogStage);
  }

  show(visible) {
    this.heightFogStage.enabled = visible;
  }

  changeHeight(value) {
    this.heightFogStage.uniforms.height = value;
  }

  changeAlpha(value) {
    this.heightFogStage.uniforms.alpha = value;
  }

  changeFogColor(color) {
    this.heightFogStage.uniforms.fogColor = color;  // 改变雾的颜色
  }

  fog() {
    return `
      uniform sampler2D colorTexture;
      uniform sampler2D depthTexture;
      uniform float alpha;
      uniform float height;
      uniform float earthRadius;
      uniform vec3 fogColor;  // 雾的颜色
      in vec2 v_textureCoordinates;

      float getDepth(in vec4 depth) {
        float z_window = czm_unpackDepth(depth);
        z_window = czm_reverseLogDepth(z_window);
        float n_range = czm_depthRange.near;
        float f_range = czm_depthRange.far;
        return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
      }

      float getHeight(in vec4 currentDepth) {
        float h = 0.0;
        float depth = czm_unpackDepth(currentDepth);
        if (depth == 0.0) {
          h = czm_infinity;
        }
        vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
        vec4 positionWC = czm_inverseView * eyeCoordinate;
        vec3 car3 = positionWC.xyz / positionWC.w;
        h = length(car3.xyz) - earthRadius;
        return h;
      }

      void main() {
        vec4 color = texture(colorTexture, v_textureCoordinates);
        vec4 currentDepth = texture(depthTexture, v_textureCoordinates);
        float depth = getDepth(currentDepth);
        float pointHeight = getHeight(currentDepth);

        if (depth >= 1.0) {
          out_FragColor = color;
          return;
        }

        // 雾的强度和高度衰减
        float fogFactor = clamp(height / (pointHeight + 1.0) - 1.0, 0.0, 1.0);
        
        // 将颜色与雾的颜色进行混合
        vec3 fogMixColor = mix(color.rgb, fogColor, fogFactor * alpha);

        out_FragColor = vec4(fogMixColor, color.a);
      }
    `;
  }
}

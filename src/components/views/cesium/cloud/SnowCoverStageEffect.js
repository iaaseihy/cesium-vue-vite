/*
 * @Descripttion: 倾斜摄影积雪效果1 —— 基于 CustomShader
 * 使用 dFdx/dFdy 从位置导数计算法线，确保在3D Tiles上可靠工作
 * 支持透明度(alpha)与覆盖率(snowCoverage)调节
 */
import * as Cesium from "cesium";

export default class SnowCoverStageEffect {
  /**
   * @param {Cesium.Cesium3DTileset} tileset 倾斜摄影模型
   * @param {Object} options { alpha, snowCoverage }
   */
  constructor(tileset, options) {
    if (!tileset) throw new Error("no tileset object!");
    options = options || {};
    this.tileset = tileset;
    this.alpha = options.alpha ?? 0.8;
    this.snowCoverage = options.snowCoverage ?? 0.6;
    this._originalShader = tileset.customShader || undefined;
    this._visible = true;
    this._buildShader();
  }

  _buildShader() {
    this._customShader = new Cesium.CustomShader({
      uniforms: {
        u_alpha: {
          type: Cesium.UniformType.FLOAT,
          value: this.alpha,
        },
        u_snowCoverage: {
          type: Cesium.UniformType.FLOAT,
          value: this.snowCoverage,
        },
      },
      fragmentShaderText: `
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          vec3 positionEC = fsInput.attributes.positionEC;

          // 用位置导数计算法线（比 normalEC 属性更可靠）
          vec3 dx = dFdx(positionEC);
          vec3 dy = dFdy(positionEC);
          vec3 normalEC = normalize(cross(dx, dy));

          // 确保法线朝向相机
          if (dot(normalEC, positionEC) > 0.0) {
            normalEC = -normalEC;
          }

          vec3 normalWC = normalize(czm_inverseViewRotation * normalEC);
          vec3 positionWC = fsInput.attributes.positionWC;
          vec3 upWC = normalize(positionWC);

          // 只在朝上的面（屋顶等）覆盖积雪
          float dotVal = dot(upWC, normalWC);
          float snowFactor = smoothstep(0.5, 0.85, dotVal * u_snowCoverage + (1.0 - u_snowCoverage) * 0.3);

          // 积雪颜色：略带蓝调的白色
          vec3 snowColor = vec3(0.92, 0.95, 1.0);
          material.diffuse = mix(material.diffuse, snowColor, snowFactor * u_alpha);
          // 积雪面降低高光
          material.specular = mix(material.specular, vec3(0.0), snowFactor * u_alpha);
        }
      `,
    });
    if (this._visible) {
      this.tileset.customShader = this._customShader;
    }
  }

  destroy() {
    if (!this.tileset) return;
    this.tileset.customShader = this._originalShader;
  }

  show(visible) {
    this._visible = visible;
    if (visible) {
      this.tileset.customShader = this._customShader;
    } else {
      this.tileset.customShader = this._originalShader;
    }
  }

  changeAlpha(value) {
    this.alpha = value;
    if (this._customShader) {
      this._customShader.setUniform("u_alpha", value);
    }
  }

  changeSnowCoverage(value) {
    this.snowCoverage = value;
    if (this._customShader) {
      this._customShader.setUniform("u_snowCoverage", value);
    }
  }
}

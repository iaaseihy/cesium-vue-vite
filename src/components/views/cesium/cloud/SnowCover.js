/*
 * @Descripttion: 倾斜摄影积雪效果2 —— 基于 CustomShader
 * 使用 dFdx/dFdy 计算法线，基于坡度叠加积雪，支持强度调节
 */
import * as Cesium from "cesium";

export default class SnowCover {
  /**
   * @param {Cesium.Cesium3DTileset} tileset 倾斜摄影模型
   */
  constructor(tileset) {
    if (!tileset) throw new Error("no tileset object!");
    this.tileset = tileset;
    this.snowIntensity = 0.6;
    this._originalShader = tileset.customShader || undefined;
    this._visible = true;
    this._buildShader();
  }

  _buildShader() {
    this._customShader = new Cesium.CustomShader({
      uniforms: {
        u_snowIntensity: {
          type: Cesium.UniformType.FLOAT,
          value: this.snowIntensity,
        },
      },
      fragmentShaderText: `
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          vec3 positionEC = fsInput.attributes.positionEC;

          // 用位置导数计算法线
          vec3 dx = dFdx(positionEC);
          vec3 dy = dFdy(positionEC);
          vec3 normalEC = normalize(cross(dx, dy));
          if (dot(normalEC, positionEC) > 0.0) {
            normalEC = -normalEC;
          }

          vec3 normalWC = normalize(czm_inverseViewRotation * normalEC);
          vec3 positionWC = fsInput.attributes.positionWC;
          vec3 upWC = normalize(positionWC);

          float dotVal = dot(upWC, normalWC);
          // 只在朝上的面（坡度<~40度）堆积积雪
          float snowFactor = smoothstep(0.45, 0.8, dotVal) * u_snowIntensity;

          vec3 snowColor = vec3(0.90, 0.93, 0.98);
          material.diffuse = mix(material.diffuse, snowColor, snowFactor);
          material.specular = mix(material.specular, vec3(0.0), snowFactor);
        }
      `,
    });
    if (this._visible) {
      this.tileset.customShader = this._customShader;
    }
  }

  /** 设置积雪强度 0~1 */
  setSnowCoverValue(value) {
    this.snowIntensity = value;
    if (this._customShader) {
      this._customShader.setUniform("u_snowIntensity", value);
    }
  }

  clearSnowCover() {
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

  destroy() {
    this.clearSnowCover();
  }
}

/*
 * @Descripttion: 倾斜摄影积雪效果3 —— 基于 CustomShader
 * 使用 dFdx/dFdy 计算法线，支持自定义积雪颜色
 */
import * as Cesium from "cesium";

export default class SnowCoverEffect {
  /**
   * @param {Cesium.Cesium3DTileset} tileset 倾斜摄影模型
   * @param {Object} options { snowColor }
   */
  constructor(tileset, options = {}) {
    if (!tileset) throw new Error("no tileset object!");
    this.tileset = tileset;
    this.snowColor = options.snowColor || Cesium.Color.WHITE;
    this._originalShader = tileset.customShader || undefined;
    this._visible = true;
    this._buildShader();
  }

  _buildShader() {
    const c = this.snowColor;
    this._customShader = new Cesium.CustomShader({
      uniforms: {
        u_snowColor: {
          type: Cesium.UniformType.VEC3,
          value: new Cesium.Cartesian3(c.red, c.green, c.blue),
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
          // 高阈值：只在接近水平的面堆积积雪
          float snowFactor = smoothstep(0.55, 0.85, dotVal);

          // 不完全替换原始颜色，保留纹理细节
          material.diffuse = mix(material.diffuse, u_snowColor, snowFactor * 0.8);
          material.specular = mix(material.specular, vec3(0.0), snowFactor);
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

  changeSnowColor(color) {
    this.snowColor = color;
    if (this._customShader) {
      this._customShader.setUniform(
        "u_snowColor",
        new Cesium.Cartesian3(color.red, color.green, color.blue)
      );
    }
  }
}

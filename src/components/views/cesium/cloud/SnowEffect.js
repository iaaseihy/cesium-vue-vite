/*
 * @Descripttion: 倾斜摄影积雪效果4 —— 基于 CustomShader
 * 使用 dFdx/dFdy 计算法线 + 光照方向，支持积雪强度调节
 */
import * as Cesium from "cesium";

export default class SnowEffect {
  /**
   * @param {Cesium.Cesium3DTileset} tileset 倾斜摄影模型
   * @param {Object} options { snowIntensity }
   */
  constructor(tileset, options = {}) {
    if (!tileset) throw new Error("no tileset object!");
    this.tileset = tileset;
    this.snowIntensity = options.snowIntensity ?? 0.8;
    this._originalShader = tileset.customShader || undefined;
    this._visible = true;
    this._buildShader();
  }

  _buildShader() {
    this._customShader = new Cesium.CustomShader({
      uniforms: {
        u_snowColor: {
          type: Cesium.UniformType.VEC3,
          value: new Cesium.Cartesian3(0.92, 0.95, 1.0),
        },
        u_snowIntensity: {
          type: Cesium.UniformType.FLOAT,
          value: this.snowIntensity,
        },
        u_lightDirection: {
          type: Cesium.UniformType.VEC3,
          value: new Cesium.Cartesian3(0.5, 0.5, 0.5),
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

          // 光照影响
          float lightDot = dot(normalWC, -u_lightDirection);

          // 朝上面才积雪，高阈值
          float dotProduct = dot(upWC, normalWC);
          float snowFactor = smoothstep(0.5, 0.85, dotProduct);

          // 光线影响下的积雪颜色变化
          vec3 finalSnowColor = mix(u_snowColor, vec3(0.75, 0.78, 0.85), clamp(lightDot, 0.0, 1.0) * 0.3);

          // 混合积雪颜色与模型原始颜色，保留纹理
          material.diffuse = mix(material.diffuse, finalSnowColor, clamp(snowFactor * u_snowIntensity, 0.0, 1.0) * 0.85);
          material.specular = mix(material.specular, vec3(0.0), snowFactor * u_snowIntensity);
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

  changeSnowIntensity(value) {
    this.snowIntensity = value;
    if (this._customShader) {
      this._customShader.setUniform("u_snowIntensity", value);
    }
  }
}

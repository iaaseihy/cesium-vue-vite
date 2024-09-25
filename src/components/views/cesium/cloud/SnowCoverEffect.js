import * as Cesium from "cesium";

export default class SnowCoverEffect {
  constructor(viewer, options = {}) {
    if (!viewer) throw new Error("no viewer object!");

    this.viewer = viewer;
    this.snowColor = options.snowColor || Cesium.Color.WHITE; // 默认白色积雪
    this.createSnowEffect();
  }

  // 创建积雪效果
  createSnowEffect() {
    const fragmentShaderSource = `
      uniform sampler2D colorTexture;
      uniform sampler2D depthTexture;
      in vec2 v_textureCoordinates; 
      uniform vec3 snowColor;

      void main() {
        vec4 color = texture(colorTexture, v_textureCoordinates); 
        out_FragColor = color;
        float depth = czm_unpackDepth(texture(depthTexture, v_textureCoordinates)); 

        if (depth >= 1.0) return;

        vec4 eyeCoordinate4 = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);  
        vec4 positionEC = eyeCoordinate4 / eyeCoordinate4.w;

        vec3 dx = dFdx(positionEC.xyz);
        vec3 dy = dFdy(positionEC.xyz);
        vec3 nor = normalize(cross(dx, dy));

        vec4 positionWC = normalize(czm_inverseView * positionEC);
        vec3 normalWC = normalize(czm_inverseViewRotation * nor);

        float dotNumWC = dot(positionWC.xyz, normalWC);

        out_FragColor = mix(color, vec4(snowColor, 1.0), dotNumWC);
      }
    `;

    this.postProcessStage = new Cesium.PostProcessStage({
      name: 'czm_snowcover',
      fragmentShader: fragmentShaderSource,
      uniforms: {
        snowColor: () => Cesium.Cartesian3.fromElements(
          this.snowColor.red,
          this.snowColor.green,
          this.snowColor.blue
        ), // 使用 RGB 转换为 Cartesian3
      },
    });

    this.viewer.scene.postProcessStages.add(this.postProcessStage);
  }

  // 销毁积雪效果
  destroy() {
    if (!this.viewer || !this.postProcessStage) return;
    this.viewer.scene.postProcessStages.remove(this.postProcessStage);
    this.postProcessStage.destroy();
    this.postProcessStage = null;
  }

  // 切换积雪效果的显示
  show(visible) {
    if (this.postProcessStage) {
      this.postProcessStage.enabled = visible;
    }
  }

  // 动态改变积雪颜色
  changeSnowColor(color) {
    if (this.postProcessStage) {
      this.snowColor = color; // 更新颜色
      this.postProcessStage.uniforms.snowColor = Cesium.Cartesian3.fromElements(
        color.red,
        color.green,
        color.blue
      ); // 重新设置 RGB 颜色
    }
  }
}

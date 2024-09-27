import * as Cesium from "cesium";

export default class SnowEffect {
    constructor(viewer, options = {}) {
        if (!viewer) throw new Error("Viewer object is required!");

        this.viewer = viewer;
        this.snowIntensity = options.snowIntensity || 1.0;  // 积雪强度，默认为1.0
        this.createSnowEffect();
    }

    // 创建积雪效果
    createSnowEffect() {
        const fragmentShaderSource = `
  uniform sampler2D colorTexture;
  uniform sampler2D depthTexture;
  in vec2 v_textureCoordinates;
  uniform vec3 snowColor;
  uniform float snowIntensity;
  uniform vec3 lightDirection;

  void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates); 
    float depth = czm_unpackDepth(texture(depthTexture, v_textureCoordinates)); 

    if (depth >= 1.0) {
      out_FragColor = color;
      return;
    }

    vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
    vec4 positionEC = eyeCoordinate / eyeCoordinate.w;

    // 计算模型表面的法线
    vec3 dx = dFdx(positionEC.xyz);
    vec3 dy = dFdy(positionEC.xyz);
    vec3 normalEC = normalize(cross(dx, dy));

    // 将法线从眼空间转换到世界空间
    vec3 normalWC = normalize(czm_inverseViewRotation * normalEC);
    vec3 positionWC = normalize(czm_inverseView * positionEC).xyz;

    // 判断法线方向与光源方向的关系
    float lightDot = dot(normalWC, -lightDirection);

    // 通过 dotProduct 计算积雪的强度
    vec3 upWC = normalize(positionWC);  // 世界坐标系中的向上方向
    float dotProduct = dot(upWC, normalWC);

    float snowFactor = smoothstep(0.5, 1.0, dotProduct);  // 使用 smoothstep 实现平滑过渡

    // 模拟光线影响下的积雪颜色变化
    vec3 finalSnowColor = mix(snowColor, vec3(0.8, 0.8, 0.9), clamp(lightDot, 0.0, 1.0));

    // 混合积雪颜色与模型原始颜色
    vec3 snowAppliedColor = mix(color.rgb, finalSnowColor, clamp(snowFactor * snowIntensity, 0.0, 1.0));

    out_FragColor = vec4(snowAppliedColor, color.a);
  }
`;

        // 调用渲染
        this.postProcessStage = new Cesium.PostProcessStage({
            name: 'czm_snowEffect',
            fragmentShader: fragmentShaderSource,
            uniforms: {
                snowColor: new Cesium.Cartesian3(1.0, 1.0, 1.0), // 雪的颜色
                snowIntensity: 1.0,  // 积雪强度
                lightDirection: new Cesium.Cartesian3(0.5, 0.5, 0.5) // 光源方向，可以根据场景的实际光源进行调整
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

    // 动态改变积雪强度
    changeSnowIntensity(value) {
        this.snowIntensity = value;
    }
}

// import * as Cesium from "cesium";

// export default class SnowEffect {
//     constructor(viewer, options) {
//         if (!viewer) throw new Error("no viewer object!");
//         options = options || {};
//         this.viewer = viewer;
//         this.alpha = options.alpha || 0.5; // 积雪厚度控制，范围 0-1
//         this.snowColor = options.snowColor || [1.0, 1.0, 1.0]; // 积雪颜色
//         this.init();
//     }

//     init() {
//         this.snowCoverStage = new Cesium.PostProcessStage({
//             name: "czm_snowcover",
//             fragmentShader: this._getSnowCoverShader(),
//             uniforms: {
//                 alpha: () => {
//                     return this.alpha;
//                 },
//                 snowColor: () => {
//                     return this.snowColor;
//                 },
//                 earthRadius: () => {
//                     return Cesium.Cartesian3.magnitude(this.viewer.camera.positionWC) - this.viewer.camera.positionCartographic.height;
//                 }
//             }
//         });
//         this.viewer.scene.postProcessStages.add(this.snowCoverStage);
//     }

//     _getSnowCoverShader() {
//         return `
//         uniform sampler2D colorTexture;
//         uniform sampler2D depthTexture;
//         uniform float alpha;  // 积雪厚度
//         uniform vec3 snowColor; // 积雪颜色
//         uniform float earthRadius;

//         in vec2 v_textureCoordinates;  // WebGL2 中使用 'in' 代替 'varying'
        
//         // 此处声明输出变量
//         out vec4 fragColor;  // 替换 out_FragColor

//         float getDepth(in vec4 depth) {
//             float z_window = czm_unpackDepth(depth);
//             z_window = czm_reverseLogDepth(z_window);
//             float n_range = czm_depthRange.near;
//             float f_range = czm_depthRange.far;
//             return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
//         }

//         float getHeight(in vec4 currentDepth) {
//             float depth = czm_unpackDepth(currentDepth);
//             if (depth == 0.0) {
//                 return czm_infinity;
//             }
//             vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
//             vec4 positionWC = czm_inverseView * eyeCoordinate;
//             return length(positionWC.xyz) - earthRadius;
//         }

//         void main() {
//             vec4 color = texture(colorTexture, v_textureCoordinates);
//             vec4 currentDepth = texture(depthTexture, v_textureCoordinates);
//             float depth = getDepth(currentDepth);
//             float pointHeight = getHeight(currentDepth);

//             if (depth >= 1.0) {
//                 fragColor = color;  // 使用 fragColor 输出颜色
//                 return;
//             }

//             // 计算法向量和视角朝向的夹角
//             vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth);
//             vec4 positionWC = czm_inverseView * eyeCoordinate;
//             vec3 normalWC = normalize(positionWC.xyz);

//             // 根据积雪厚度和朝向角度渲染积雪
//             float snowFactor = smoothstep(0.0, 1.0, dot(normalWC, vec3(0.0, 0.0, 1.0)));
//             vec3 finalColor = mix(color.rgb, snowColor, snowFactor * alpha);

//             fragColor = vec4(finalColor, color.a);  // 使用 fragColor 输出最终颜色
//         }
//         `;
//     }

//     changeAlpha(value) {
//         this.snowCoverStage.uniforms.alpha = value;
//     }

//     changeSnowColor(color) {
//         this.snowCoverStage.uniforms.snowColor = color;
//     }

//     show(visible) {
//         this.snowCoverStage.enabled = visible;
//     }

//     destroy() {
//         if (!this.viewer || !this.snowCoverStage) return;
//         this.viewer.scene.postProcessStages.remove(this.snowCoverStage);
//         Cesium.destroyObject(this.snowCoverStage);
//     }
// }

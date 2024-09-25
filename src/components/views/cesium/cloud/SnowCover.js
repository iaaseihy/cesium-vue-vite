/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: tanzheng
 * @Date: 2024-1-23 15:30:42
 */
import * as Cesium from "cesium";
/**
 * 
 * 封装天气场景
 * 积雪
 */
export default class SnowCover{
 
    constructor(viewer){
        if (!viewer) throw new Error("no viewer object!");
        this.viewer = viewer;
        this.createSnowCover();
        this.setSnowCoverValue(0.5);
    }
    //创建雪
    createSnowCover(){
        this.collection = this.viewer.scene.postProcessStages;
        this._snowCover = new Cesium.PostProcessStage({
            name: 'czm_snowcover',
            fragmentShader: this.getSnowCover(),
            // uniforms: {
            //     snowIntensity: 3.0, // 积雪厚度, 0~1
            //   }
        });
        this.collection.add(this._snowCover);
        this.viewer.scene.skyAtmosphere.hueShift = -0.8;
        this.viewer.scene.skyAtmosphere.saturationShift = -0.7;
        this.viewer.scene.skyAtmosphere.brightnessShift = -0.33;
        this.viewer.scene.fog.density = 0.001;
        this.viewer.scene.fog.minimumBrightness = 0.8;
        
    }
    //获得雪的shader
    getSnowCoverForWebgl1(){
        
        var fs= `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        float snowIntensity = 2.0; // 积雪强度
 
        void main() {
          vec4 color = texture2D(colorTexture, v_textureCoordinates);
          vec3 snowColor = vec3(1.0, 1.0, 1.0); // 积雪颜色
 
          // 在片元着色器中根据亮度添加积雪纹理
          float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          vec3 snow = snowColor * snowIntensity * brightness;
          color.rgb += snow;
 
          gl_FragColor = color;
        }
      `
        return fs;
    }
    //获得雪的shader
    setSnowCoverValueForWebgl1(va){
        
        var fs= `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
 
        void main() {
          vec4 color = texture2D(colorTexture, v_textureCoordinates);
          vec3 snowColor = vec3(1.0, 1.0, 1.0); // 积雪颜色
          float snowIntensity = ${va}; // 积雪强度
 
          // 在片元着色器中根据亮度添加积雪纹理
          float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          vec3 snow = snowColor * snowIntensity * brightness;
          color.rgb += snow;
 
          gl_FragColor = color;
        }
      `
        return fs;
    }
    getSnowCover() {
        var fs = `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;  // 将 varying 改为 in
        float snowIntensity = 2.0; // 积雪强度
    
        void main() {
          vec4 color = texture(colorTexture, v_textureCoordinates);
          vec3 snowColor = vec3(1.0, 1.0, 1.0); // 积雪颜色
    
          // 在片元着色器中根据亮度添加积雪纹理
          float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          vec3 snow = snowColor * snowIntensity * brightness;
          color.rgb += snow;
    
          out_FragColor = color;  // 修改为 WebGL 2.0 的标准输出
        }
      `;
        return fs;
    }
    
    setSnowCoverValue(va) {
        var fs = `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;  // 将 varying 改为 in
    
        void main() {
          vec4 color = texture(colorTexture, v_textureCoordinates);
          vec3 snowColor = vec3(1.0, 1.0, 1.0); // 积雪颜色
          float snowIntensity = ${va}; // 积雪强度
    
          // 在片元着色器中根据亮度添加积雪纹理
          float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          vec3 snow = snowColor * snowIntensity * brightness;
          color.rgb += snow;
    
          out_FragColor = color;  // 修改为 WebGL 2.0 的标准输出
        }
      `;
        return fs;
    }
    
    //清除雪
    clearSnowCover(){
        this.viewer.scene.postProcessStages.remove(this._snowCover);
    }
    //修改积雪大小
    setSnowCover(value){
        this.clearSnowCover();
        this._snowCover = new Cesium.PostProcessStage({
            name: 'czm_snowcover',
            fragmentShader: `
            uniform sampler2D colorTexture;
            varying vec2 v_textureCoordinates;
    
            void main() {
              vec4 color = texture2D(colorTexture, v_textureCoordinates);
              vec3 snowColor = vec3(1.0, 1.0, 1.0); // 积雪颜色
              float snowIntensity = ${value}; // 积雪强度
    
              // 在片元着色器中根据亮度添加积雪纹理
              float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
              vec3 snow = snowColor * snowIntensity * brightness;
              color.rgb += snow;
    
              gl_FragColor = color;
            }
          `,
            
        });
        this.collection.add(this._snowCover);
       
    }
   
 
}
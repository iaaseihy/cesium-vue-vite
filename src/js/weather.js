/*
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-09-22 15:15:04
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-29 17:13:11
 * @FilePath: \gis_3d_gate\src\js\weather.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Cesium from "cesium";
export function CeateRainEffect(viewer,type){
    var fragmentShader =`uniform sampler2D colorTexture;varying vec2 v_textureCoordinates;uniform float tiltAngle;uniform float rainSize;uniform float rainSpeed;float hash(float x){return fract(sin(x * 133.3) * 13.13);}void main(void) {float time = czm_frameNumber / rainSpeed;vec2 resolution = czm_viewport.zw;vec2 uv = (gl_FragCoord.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);vec3 c = vec3(.6, .7, .8);float a = tiltAngle;float si = sin(a), co = cos(a);uv *= mat2(co, -si, si, co);uv *= length(uv + vec2(0, 4.9)) * rainSize + 1.;float v = 1. - sin(hash(floor(uv.x * 100.)) * 2.);float b = clamp(abs(sin(20. * time * v + uv.y * (5. / (2. + v)))) - .95, 0., 1.) * 20.;c *= v * b;gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), .5);}`;
   return CreatePostProcessStage(viewer,fragmentShader,type);
}

export function CeateSnowEffect(viewer,type){
    var fragmentShader =`uniform sampler2D colorTexture;varying vec2 v_textureCoordinates;uniform float snowSpeed;uniform float snowSize;float snow(vec2 uv,float scale){float time=czm_frameNumber/snowSpeed;float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);k=smoothstep(0.,k,sin(f.x+f.y)*snowSize);return k*w;}void main(void){vec2 resolution=czm_viewport.zw;vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);vec3 finalColor=vec3(0);float c=0.;c+=snow(uv,30.)*.0;c+=snow(uv,20.)*.0;c+=snow(uv,15.)*.0;c+=snow(uv,10.);c+=snow(uv,8.);c+=snow(uv,6.);c+=snow(uv,5.);finalColor=(vec3(c));gl_FragColor=mix(texture2D(colorTexture,v_textureCoordinates),vec4(finalColor,1),.5);}`;
   return CreatePostProcessStage(viewer,fragmentShader,type);
}
export function CeateFogEffect(viewer,type){
    var fragmentShader =`uniform sampler2D colorTexture;uniform sampler2D depthTexture;varying vec2 v_textureCoordinates;uniform float fognum;void main(void){vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);float depth = czm_readDepth(depthTexture, v_textureCoordinates);vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);float f=(depthcolor.r-0.22)/fognum;if(f<0.0) f=0.0;else if(f>1.0) f=1.0;gl_FragColor = mix(origcolor,fogcolor,f);}`;
   return CreatePostProcessStage(viewer,fragmentShader,type);
}
export function CreatePostProcessStage(viewer,fShader,type){
    var ProcessScenes = new Cesium.PostProcessStage({
        fragmentShader: fShader,
        name: type,
        uniforms: {
            rainSize: () => {
                return 0.3;
            },
            rainSpeed: () => {
                return 200;
            },
            fognum: () => {
                return 0.9;
            },
            snowSize: () => {
                return 0.02;
            },
            snowSpeed: () => {
                return 100;
            },
            height: () => {
                return viewer.camera.positionCartographic.height;
            },
            lineWidth: () => {
                return 2;
            },
            strokeType: () => {
                return new Cesium.Cartesian3(true, false, false);
            },
            clineColor: () => {
                return new Cesium.Color(1.0,0.0,0.0); //new Cesium.Color(1.0,0.0,0.0);
            },
            cameraPos: () => {
                return viewer.scene.camera.position;
            },
            tiltAngle:() =>{
                return -0.25;
            }
        }
    });

   return viewer.scene.postProcessStages.add(ProcessScenes)
}
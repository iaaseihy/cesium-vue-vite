/*
 * @Description: 多彩圆效果（参考开源代码）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-03 18:09:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-06-15 11:48:54
 */
import * as Cesium from 'cesium';



class CircleColorfulMaterialProperty {
    constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
    };

    get isConstant() {
        return false;
    }

    get definitionChanged() {
        return this._definitionChanged;
    }

    getType(time) {
        return Cesium.Material.CircleColorfulMaterialType;
    }

    getValue(time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }

        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result
    }

    equals(other) {
        return (this === other ||
            (other instanceof CircleColorfulMaterialProperty &&
                Cesium.Property.equals(this._color, other._color) &&
                Cesium.Property.equals(this._speed, other._speed))
        )
    }
}

Object.defineProperties(CircleColorfulMaterialProperty.prototype, {
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed')
})

const MyCesiumExtensions = {
    CircleColorfulMaterialProperty: null,
    Material: {
        CircleDiffuseMaterialProperty: null,
        CircleColorfulMaterialType: null,
        CircleColorfulMaterialSource: null
    }
};
MyCesiumExtensions.CircleColorfulMaterialProperty = CircleColorfulMaterialProperty;
MyCesiumExtensions.Material.CircleDiffuseMaterialProperty = 'CircleDiffuseMaterialProperty';
MyCesiumExtensions.Material.CircleColorfulMaterialType = 'CircleColorfulMaterialType';
MyCesiumExtensions.Material.CircleColorfulMaterialSource = `
uniform vec4 color;
uniform float speed;

czm_material czm_getMaterial(czm_materialInput materialInput){
czm_material material = czm_getDefaultMaterial(materialInput);
vec2 st = materialInput.st  * 2.0 - 1.0;
float time =czm_frameNumber * speed / 1000.0;
float radius = length(st);
float angle = atan(st.y/st.x);
float radius1 = sin(time * 2.0) + sin(40.0*angle+time)*0.01;
float radius2 = cos(time * 3.0);
vec3 fragColor = 0.2 + 0.5 * cos( time + color.rgb + vec3(0,2,4));
float inten1 = 1.0 - sqrt(abs(radius1 - radius));
float inten2 = 1.0 - sqrt(abs(radius2 - radius));
material.alpha = pow(inten1 + inten2 , 5.0) ;
material.diffuse = fragColor * (inten1 + inten2);
return material;
}`

// Cesium.CircleDiffuseMaterialProperty = CircleDiffuseMaterialProperty;
// Cesium.Material.CircleDiffuseMaterialProperty = 'CircleDiffuseMaterialProperty';
// Cesium.Material.CircleDiffuseMaterialType = 'CircleDiffuseMaterialType';
// Cesium.Material.CircleDiffuseMaterialSource = `
//                                             uniform vec4 color;
//                                             uniform float speed;

//                                             vec3 circlePing(float r, float innerTail,  float frontierBorder, float timeResetSeconds,  float radarPingSpeed,  float fadeDistance){
//                                             float t = fract(czm_frameNumber * speed / 1000.0);
//                                             float time = mod(t, timeResetSeconds) * radarPingSpeed;
//                                             float circle;
//                                             circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
//                                             circle *= smoothstep(fadeDistance, 0.0, r);
//                                             return vec3(circle);
//                                             }

//                                             czm_material czm_getMaterial(czm_materialInput materialInput){
//                                             czm_material material = czm_getDefaultMaterial(materialInput);
//                                             vec2 st = materialInput.st * 2.0  - 1.0 ;
//                                             vec2 center = vec2(0.);
//                                             float time = fract(czm_frameNumber * speed / 1000.0);
//                                             vec3 flagColor;
//                                             float r = length(st - center) / 4.;
//                                             flagColor += circlePing(r, 0.25, 0.025, 4.0, 0.3, 1.0) * color.rgb;
//                                             material.alpha = length(flagColor);
//                                             material.diffuse = flagColor.rgb;
//                                             return material;
//                                             }

//                                             `

Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleColorfulMaterialType, {
    fabric: {
        type: Cesium.Material.CircleColorfulMaterialType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
            speed: 10.0
        },
        source: Cesium.Material.CircleColorfulMaterialSource
    },
    translucent: function (material) {
        return true;
    }
})



export { MyCesiumExtensions };

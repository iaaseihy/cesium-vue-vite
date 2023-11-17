/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-11-03 16:18:35
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-11-03 16:56:43
 */
import * as Cesium from 'cesium';
let images;
let times;
function CloudEffectMaterialProperty(options) {
  
    this._definitionChanged = new Cesium.Event();
  
    this.speed = 200;
    this.color = options.color;
    this._image = options.image;
    images = options.image
    this.time = options.time;
    times = options.time;


    const durationDefault = 100000;
    this.duration = 100 / this.speed * durationDefault;
  
    this._time = new Date().getTime();
  
}

Object.defineProperties(CloudEffectMaterialProperty.prototype, {
    isConstant: {
        get: function() {
            return false;
        }
    },
    definitionChanged: {
        get: function() {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});
CloudEffectMaterialProperty.prototype.getType = function(time) {
    return 'CloudEffect';
};
CloudEffectMaterialProperty.prototype.getValue = function(time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(
            this._color, time, Cesium.Color.WHITE, result.color);
        result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
        return result;
};
CloudEffectMaterialProperty.prototype.equals = function(other) {
            return (this === other ||
                (other instanceof CloudEffectMaterialProperty &&
                    Cesium.Property.equals(this._color, other._color) &&
                    Cesium.Property.equals(this.speed, other.speed)));
};
let clor = new Cesium.Color(1.0, 1.0, 1.0, 1);
Cesium.Material.CloudEffectType = 'CloudEffect';
Cesium.Material.CloudEffectImage = images;
Cesium.Material.CloudEffectColor = new Cesium.Color(1.0, 1.0, 1.0, 1);
Cesium.Material.CloudEffectSource = `
czm_material czm_getMaterial(czm_materialInput materialInput)
                {
                     czm_material material = czm_getDefaultMaterial(materialInput);
                     vec2 st = materialInput.st;
                     vec4 colorImage = texture(image, vec2(fract(st.s + time),st.t));
                     material.alpha = colorImage.a * color.a  ;
                     material.diffuse = color.rgb  ;
                     return material;
}
`;


Cesium.Material._materialCache.addMaterial(Cesium.Material.CloudEffectType, {
    fabric: {
        type: Cesium.Material.CloudEffectType,
        uniforms: {
            color: Cesium.Material.CloudEffectColor,
            image: Cesium.Material.CloudEffectImage,
            time: times
        },
        source: Cesium.Material.CloudEffectSource
    },
    translucent: function(material) {
        return true;
    }
});

export default CloudEffectMaterialProperty;
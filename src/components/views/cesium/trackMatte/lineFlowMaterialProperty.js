/*
 * @Description: 飞线效果（参考开源代码）
 * @Version: 1.0
 * @Author: Julian
 * @Date: 2022-03-05 16:13:21
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-10 15:22:09
 */
import * as Cesium from 'cesium';
// 第一种
function LineFlowMaterialProperty(color, speed, percent, gradient) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._speed = undefined;
    this._percent = undefined;
    this._gradient = undefined;
    this.color = color;
    this.speed = speed;
    this.percent = percent;
    this.gradient = gradient;
}

Object.defineProperties(LineFlowMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false;
        },
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        },
    },
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed'),
    percent: Cesium.createPropertyDescriptor('percent'),
    gradient: Cesium.createPropertyDescriptor('gradient'),
});
LineFlowMaterialProperty.prototype.getType = function (time) {
    return "LineFlowMaterialType";
};
LineFlowMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }

    result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
    result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 5.0, result.speed);
    result.percent = Cesium.Property.getValueOrDefault(this._percent, time, 0.1, result.percent);
    result.gradient = Cesium.Property.getValueOrDefault(this._gradient, time, 0.01, result.gradient);
    return result
};
LineFlowMaterialProperty.prototype.equals = function (other) {
    return (this === other ||
        (other instanceof LineFlowMaterialProperty &&
            Cesium.Property.equals(this._color, other._color) &&
            Cesium.Property.equals(this._speed, other._speed) &&
            Cesium.Property.equals(this._percent, other._percent) &&
            Cesium.Property.equals(this._gradient, other._gradient))
    )
};
// Cesium.LineFlowMaterialProperty = LineFlowMaterialProperty;
// Cesium.Material.LineFlowMaterialProperty = 'LineFlowMaterialProperty';
Cesium.Material.LineFlowMaterialType = 'LineFlowMaterialType';
Cesium.Material.LineFlowMaterialSource =
    `
    uniform vec4 color;
    uniform float speed;
    uniform float percent;
    uniform float gradient;
    
    czm_material czm_getMaterial(czm_materialInput materialInput){
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      float t =fract(czm_frameNumber * speed / 1000.0);
      t *= (1.0 + percent);
      float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
      alpha += gradient;
      material.diffuse = color.rgb;
      material.alpha = alpha;
      return material;
    }
    `

Cesium.Material._materialCache.addMaterial(Cesium.Material.LineFlowMaterialType, {
    fabric: {
        type: Cesium.Material.LineFlowMaterialType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
            speed: 10.0,
            percent: 0.1,
            gradient: 0.01
        },
        source: Cesium.Material.LineFlowMaterialSource
    },
    translucent: function (material) {
        return true;
    }
})
export default LineFlowMaterialProperty;

// 第二种
// export default class PolylineTrailMaterialProperty {
//     constructor(options) {
//         var obj = Object.freeze(Cesium);
//         console.log(Object.isExtensible(obj))
//         options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

//         this._definitionChanged = new Cesium.Event();

//         this._color = undefined;

//         this._colorSubscription = undefined;

//         this.color = options.color;

//         this.duration = options.duration;

//         this.trailImage = options.trailImage;

//         this._time = performance.now();

//     }

// }

// function PolylineTrailMaterialProperty(color, duration, trailImage) {
//     this._definitionChanged = new Cesium.Event();
//     this._color = undefined;
//     this.color = color;

//     this.duration = duration;
//     this._colorSubscription = undefined;
//     this.trailImage = trailImage;

//     this._time = performance.now();
// }

// Object.defineProperties(PolylineTrailMaterialProperty.prototype, {
//     isConstant: {
//         get: function() {
//             return false;

//         }

//     },

//     definitionChanged: {
//         get: function() {
//             return this._definitionChanged;

//         }

//     },

//     color: Cesium.createPropertyDescriptor('color')

// });

// PolylineTrailMaterialProperty.prototype.getType = function(time) {
//     return 'PolylineTrail';

// }

// PolylineTrailMaterialProperty.prototype.getValue = function(time, result) {
//     if (!Cesium.defined(result)) {
//         result = {};

//     }

//     result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);

//     //result.image = Cesium.Material.PolylineTrailImage;

//     result.image = this.trailImage;

//     result.time = ((performance.now() - this._time) % this.duration) / this.duration;

//     return result;

// }

// PolylineTrailMaterialProperty.prototype.equals = function(other) {
//     return this === other ||

//         (other instanceof PolylineTrailMaterialProperty &&

//             Cesium.Property.equals(this._color, other._color))

// }

// Cesium.Material.PolylineTrailType = 'PolylineTrail';

// Cesium.Material.PolylineTrailImage = "images/colors.png";

// // Cesium.Material.PolylineTrailSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\

// //                                                       {\n\

// //                                                           czm_material material = czm_getDefaultMaterial(materialInput);\n\

// //                                                           vec2 st = materialInput.st;\n\

// //                                                           vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\

// //                                                           material.alpha = colorImage.a * color.a;\n\

// //                                                           material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\

// //                                                           return material;\n\

// //                                                       }";
// // Cesium.Material.PolylineTrailSource = `
// // uniform vec4 color;
// // uniform float speed;
// // uniform float percent;
// // uniform float gradient;

// // czm_material czm_getMaterial(czm_materialInput materialInput){
// //   czm_material material = czm_getDefaultMaterial(materialInput);
// //   vec2 st = materialInput.st;
// //   float t =fract(czm_frameNumber * speed / 1000.0);
// //   t *= (1.0 + percent);
// //   float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);
// //   alpha += gradient;
// //   material.diffuse = color.rgb;
// //   material.alpha = alpha;
// //   return material;
// // }
// // `
// Cesium.Material.PolylineTrailSource = `czm_material czm_getMaterial(czm_materialInput materialInput)
// 	                                                      {
// 	                                                           czm_material material = czm_getDefaultMaterial(materialInput);
// 	                                                           vec2 st = materialInput.st;
// 	                                                           //time = speed * czm_frameNumber * 0.001;
// 	                                                           vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));
// 	                                                           material.alpha = colorImage.a * color.a;
// 	                                                           material.diffuse = color.rgb;
// 	                                                           return material;
// 	                                                       }
// 	        `;
// Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType, {
//     fabric: {
//         type: Cesium.Material.PolylineTrailType,

//         uniforms: {
//             color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),

//             image: Cesium.Material.PolylineTrailImage,

//             time: 0

//         },

//         source: Cesium.Material.PolylineTrailSource

//     },

//     translucent: function(material) {
//         return true;

//     }

// });
// export default PolylineTrailMaterialProperty;
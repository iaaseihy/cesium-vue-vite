/*
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-11 11:46:17
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-29 17:17:55
 * @FilePath: \demo\src\js\material\tailtrackmaterial.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import * as Cesium from "cesium";
// const PolylineTrailLinkMaterialProperty = (function(){
// /*
//     流动纹理线
//     color 颜色
//     duration 持续时间 毫秒
// */
// function PolylineTrailLinkMaterialProperty(color,imgUrl, duration) {
//         this._definitionChanged = new Cesium.Event();
//         this._color = undefined;
//         this._image = undefined;
//         this._colorSubscription = undefined;
//         this.color = color;
//         this.image = imgUrl;
//         this.duration = duration;
//         this._time = (new Date()).getTime();
//     }
//     Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
//         isConstant: {
//             get: function () {
//                 return false;
//             }
//         },
//         definitionChanged: {
//             get: function () {
//                 return this._definitionChanged;
//             }
//         },
//         color: Cesium.createPropertyDescriptor('color'),
//         image: Cesium.createPropertyDescriptor('image')
//     });
//     PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
//         return 'PolylineTrailLink';
//     }
//     PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
//         if (!Cesium.defined(result)) {
//             result = {};
//         }
//         result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.RED.withAlpha(0.95), result.color);
//         result.image = Cesium.Property.getValueOrUndefined(this._image, time);//Cesium.Material.PolylineTrailLinkImage;
//         result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
//         return result;
//     }
//     PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
//         return this === other ||
//             (other instanceof PolylineTrailLinkMaterialProperty &&
//               Cesium.Property.equals(this._color, other._color)&&
//               Cesium.Property.equals(this._image, other._image))
//     }
//     Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
//     Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
//     Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
//                                                   {\n\
//                                                         czm_material material = czm_getDefaultMaterial(materialInput);\n\
//                                                         vec2 st = materialInput.st;\n\
//                                                         vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
//                                                         material.alpha = colorImage.a * color.a;\n\
//                                                         material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
//                                                         return material;\n\
//                                                     }";
//     Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
//         fabric: {
//             type: Cesium.Material.PolylineTrailLinkType,
//             uniforms: {
//                 color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
//                 image: Cesium.Material.DefaultImageId,
//                 time: -20
//             },
//             source: Cesium.Material.PolylineTrailLinkSource
//         },
//         translucent: function (material) {
//             return true;
//         }
//     });
//  })();

// export {
//   PolylineTrailLinkMaterialProperty
// }

import * as Cesium from 'cesium';
function PolylineTrailLinkMaterialProperty(color, trailImage, duration) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = color;
    this.duration = duration;
    this.trailImage  = trailImage;
    this._time = (new Date()).getTime();
}

Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
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

PolylineTrailLinkMaterialProperty.prototype.getType = function(time) {
    return 'PolylineTrailLink';
}

PolylineTrailLinkMaterialProperty.prototype.getValue = function(time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    // result.image = Cesium.Material.PolylineTrailLinkImage;
    result.image = this.trailImage;
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
}

PolylineTrailLinkMaterialProperty.prototype.equals = function(other) {
    return this === other ||
        (other instanceof PolylineTrailLinkMaterialProperty &&
            Cesium.Property.equals(this._color, other._color))

}

// Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
Cesium.Material.PolylineTrailLinkImage = '../../static/images/effects/water.png';
Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
{\n\
      czm_material material = czm_getDefaultMaterial(materialInput);\n\
      vec2 st = materialInput.st;\n\
      vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));\n\
      material.alpha = colorImage.a * color.a;\n\
      material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
      return material;\n\
  }";
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
    fabric: {
        type: Cesium.Material.PolylineTrailLinkType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
            // image: Cesium.Material.PolylineTrailLinkImage,
            image: Cesium.Material.DefaultImageId,
            time: 20
        },
        source: Cesium.Material.PolylineTrailLinkSource
    },
    translucent: function(material) {
        return true;
    }
});
export default PolylineTrailLinkMaterialProperty;
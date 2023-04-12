/*
 * @Descripttion:
 * @version: v1.0
 * @Author: caochaoqiang
 * @Date: 2023-02-06 17:12:37
 * @LastEditors: caochaoqiang
 * @LastEditTime: 2023-02-07 11:00:05
 */
import * as Cesium from 'cesium'

var Color = Cesium.Color
var defaultValue = Cesium.defaultValue
var defined = Cesium.defined
var defineProperties = Object.defineProperties
var Event = Cesium.Event
var createPropertyDescriptor = Cesium.createPropertyDescriptor
var Property = Cesium.Property
var Material = Cesium.Material
// var MaterialType = options.MaterialType || 'wallType' + parseInt(Math.random() * 1000)

export default class WallLinkCustomMaterialProperty {
  constructor(options) {
    this.options = defaultValue(options, defaultValue.EMPTY_OBJECT)
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this.color = options.color || Color.BLUE
    this._colorSubscription = undefined
    this.duration = options.duration || 3000
    this._time = new Date().getTime()
    this.MaterialType = options.MaterialType || 'wallType' + parseInt(Math.random() * 1000)
    // 动态墙
    Material._materialCache.addMaterial(this.MaterialType,
      {
        fabric: {
          type: this.MaterialType,
          uniforms: {
            color: new Color(1.0, 0.0, 0.0, 0.5),
            image: options.image,
            time: 0
          },
          source: _getDirectionWallShader({
            get: true,
            count: options.count,
            freely: options.freely,
            direction: options.direction
          })
        },
        translucent: function (material) {
          return true
        }
      }
    )
    /**
             * 带方向的墙体
             * @param {*} options
             */
    function _getDirectionWallShader(options) {
      if (options && options.get) {
        var materail =
        "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
          {\n\
          czm_material material = czm_getDefaultMaterial(materialInput);\n\
          vec2 st = materialInput.st;\n\
          \n\ "
        if (options.freely === 'vertical') { // （由下到上）
          materail += 'vec4 colorImage = texture2D(image, vec2(fract(float(' + options.count + ')*st.t ' + options.direction + ' time), fract(st.s)));\n\ '
        } else { // （逆时针）
          materail += 'vec4 colorImage = texture2D(image, vec2(fract(float(' + options.count + ')*st.s ' + options.direction + ' time), fract(st.t)));\n\ '
        }
        // 泛光
        materail += "vec4 fragColor;\n\
          fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;\n\
          fragColor = czm_gammaCorrect(fragColor);\n\ "

        materail += " material.diffuse = colorImage.rgb;\n\
          material.alpha = colorImage.a;\n\
          material.emission = fragColor.rgb;\n\
          \n\
          return material;\n\
          }\n\
          "

        return materail
      }
    };
  };
  //   options = defaultValue(options, defaultValue.EMPTY_OBJECT)
  //   this._definitionChanged = new Event()
  //   this._color = undefined
  //   this._colorSubscription = undefined
  //   this.color = options.color || Color.BLUE
  //   this.duration = options.duration || 3000
  //   this._time = new Date().getTime()
}

defineProperties(WallLinkCustomMaterialProperty.prototype, {
  isvarant: {
    get: function () {
      return false
    }
  },
  definitionChanged: {
    get: function () {
      return this._definitionChanged
    }
  },
  color: createPropertyDescriptor('color')
})
WallLinkCustomMaterialProperty.prototype.getType = function (time) {
  return this.MaterialType
}
WallLinkCustomMaterialProperty.prototype.getValue = function (time, result) {
  if (!defined(result)) {
    result = {}
  }
  result.color = Property.getValueOrClonedDefault(
    this._color,
    time,
    Color.WHITE,
    result.color
  )
  result.image = this.options.image
  result.time =
              ((new Date().getTime() - this._time) % this.duration) / this.duration
  return result
}
WallLinkCustomMaterialProperty.prototype.equals = function (other) {
  return (
    this === other ||
              (other instanceof WallLinkCustomMaterialProperty &&
                  Property.equals(this._color, other._color))
  )
}
// // 动态墙
// Material._materialCache.addMaterial(MaterialType,
//   {
//     fabric: {
//       type: MaterialType,
//       uniforms: {
//         color: new Color(1.0, 0.0, 0.0, 0.5),
//         image: options.image,
//         time: 0
//       },
//       source: this._getDirectionWallShader({
//         get: true,
//         count: options.count,
//         freely: options.freely,
//         direction: options.direction
//       })
//     },
//     translucent: function (material) {
//       return true
//     }
//   }
// )

// return new WallLinkCustomMaterialProperty(options)

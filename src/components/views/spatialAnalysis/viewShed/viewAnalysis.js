import * as Cesium from "cesium";
import { ViewShedStage } from './ViewShedStage.js'
/**
 * @param {Cesium.Viewer} viewer Cesium三维视窗。
 * @class 可视域分析
 * 参考:
 * 1.https://blog.csdn.net/fywindmoon/article/details/108415116
 */
export default class ViewAnalysis {
  constructor(viewer) {
    this._viewer = viewer
    this.c = viewer.camera
    this.s = viewer.scene
    this.handler = undefined
    this._resultTip = null
    this.viewSheds = []
    this._init()
  }

  /**
   * 绘制可视域
   * @param {Object} options 选项。
   * @param {number} options.viewDistance 观测距离（单位`米`，默认值100）。
   * @param {number} options.viewHeading 航向角（单位`度`，默认值0）。
   * @param {number} options.viewPitch 俯仰角（单位`度`，默认值0）。
   * @param {number} options.horizontalViewAngle 可视域水平夹角（单位`度`，默认值90）。
   * @param {number} options.verticalViewAngle 可视域垂直夹角（单位`度`，默认值60）。
   * @param {rgba} options.visibleAreaColor 可视区域颜色（默认值`绿色`）。
   * @param {rgba} options.invisibleAreaColor 不可视区域颜色（默认值`红色`）。
   * @param callback 返回结果
   */
  add(options = {}, callback) {
    const that = this
    const positions = []
    if (this.handler !== undefined) {
      this.handler = this.handler.destroy()
    }

    this.handler = new Cesium.ScreenSpaceEventHandler(this.s._canvas)
    // 左键单击
    this.handler.setInputAction((movement) => {
      if (!movement.position) return false
      const cartesian = that._getCartesian3FromPX(movement.position, that._viewer)
      if (!Cesium.defined(cartesian)) return

      positions.push(cartesian.clone())

      if (positions.length === 2) {
        that._showTip(that._resultTip, false)
        that.handler = that.handler.destroy()

        const viewShed = that._drawViewShedStage(positions, options)
        that.viewSheds.push(viewShed)
        callback && callback({
          viewDistance: viewShed.viewDistance,
          horizontalViewAngle: viewShed.horizontalViewAngle,
          verticalViewAngle: viewShed.verticalViewAngle
        })
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 鼠标移动
    this.handler.setInputAction(throttle(({
      endPosition
    }) => {
      const cartesian = that._getCartesian3FromPX(endPosition, that._viewer)
      if (!Cesium.defined(cartesian)) return
      let tip = ''
      if (positions.length === 0) {
        tip = '左键开始绘制!'
      } else if (positions.length === 1) {
        tip = '绘制终点！'
      }
      that._showTip(that._resultTip, true, cartesian, tip)
    }, 200), Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * 设置当前可视域对象参数
   * @param opts
   */
  setCurrentOptions(opts) {
    if (this.viewSheds.length > 0) {
      const cell = this.viewSheds[this.viewSheds.length - 1]

      cell.horizontalViewAngle = opts.horizontalViewAngle
      cell.verticalViewAngle = opts.verticalViewAngle
      cell.viewDistance = opts.viewDistance
      // cell.viewPositionEnd = undefined // 这时候需要清空对象的终止点
      cell.invisibleAreaColor = Cesium.Color.fromCssColorString(opts.invisibleAreaColor)
      cell.visibleAreaColor = Cesium.Color.fromCssColorString(opts.visibleAreaColor)
      cell.update()
    }
  }

  /**
   * 清空
   */
  clear() {
    this.viewSheds.forEach((item) => item.clear())
    this.viewSheds = []
  }

  destroy() {
    this.clear()
    this._viewer.entities.remove(this._resultTip)
    if (this.handler !== undefined) {
      this.handler = this.handler.destroy()
    }
  }

  _init() {
    this._resultTip = this._viewer.entities.add({
      id: Cesium.createGuid(),
      label: {
        fillColor: Cesium.Color.YELLOW,
        showBackground: true,
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10)
      }
    })
  }

  /**
   * 提示框---待版本更新
   * @param {*} bShow
   * @param {*} position
   * @param {*} message
   */
  _showTip(label, bShow, position, message, effectOptions) {
    label.show = bShow
    if (bShow) {
      if (position) {
        label.position = position
      }
      if (message) {
        label.label.text = message
      }
      if (effectOptions) {
        for (const key in effectOptions) {
          if (label.key) {
            label.key = effectOptions[key]
          }
        }
      }
    }
  }

  _getCartesian3FromPX(px, viewer) {
    // 先查询是否有对象
    const pickObj = viewer.scene.pick(px)
    // 直接提取模型高度
    if (viewer.scene.pickPositionSupported && Cesium.defined(pickObj)) {
      return viewer.scene.pickPosition(px)
    } else {
      // 提取地形表面高度
      const ray = viewer.scene.camera.getPickRay(px)
      return viewer.scene.globe.pick(ray, viewer.scene)
    }
  }

  _drawViewShedStage(positions, options) {
    if (options.visibleAreaColor) {
      options.visibleAreaColor = Cesium.Color.fromCssColorString(options.visibleAreaColor)
    }
    if (options.invisibleAreaColor) {
      options.invisibleAreaColor = Cesium.Color.fromCssColorString(options.invisibleAreaColor)
    }

    const opts = {
      ...options,
      ...{
        viewPosition: positions[0],
        viewPositionEnd: positions[1]
      }
    }
    return new ViewShedStage(this._viewer, opts)
  }
}

/**
 * 节流函数
 * @param func 主函数
 * @param delay 节流事件，毫秒
 * @returns {function(): void}
 */
function throttle(func, delay) {
  var timer = null
  return function () {
    var context = this
    var args = arguments
    if (!timer) {
      timer = setTimeout(function () {
        func.apply(context, args)
        timer = null
      }, delay)
    }
  }
}
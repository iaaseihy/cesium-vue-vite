/*
 * @Descripttion:
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-10-25 11:25:10
 * @LastEditors: iaaseihy 774249302@qq.com
 * @LastEditTime: 2023-02-10 15:55:55
 */
/**
 * 可视域分析
 * 超图
 */
import * as Cesium from 'cesium'
import Analyser from './analyser/analyser.js'
export default class ViewShed3D extends Analyser {
  /**
      * 初始化
      * @param {*} supers
      * @param {*} opt
      */
  constructor(supers, opt) {
    super(supers)
    // opt = Cesium.defaultValue(opt, Cesium.defaultValue.EMPTY_OBJECT);	//判断是否有值
    this.opt = opt

    this.analyser()
  }

  /**
      * 创建分析
      */
  analyser() {
    const _self = this; const viewer = _self._viewer; let viewPosition
    this._viewer.scene.viewFlag = true
    _self.viewshed3D = new Cesium.ViewShed3D(viewer)
    /* _self.viewshed3D.distance = 0.1;
         let colorStr1 = _self.viewshed3D.visibleAreaColor.toCssColorString();
         let colorStr2 = _self.viewshed3D.hiddenAreaColor.toCssColorString();
         //鼠标移动时间回调
         let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
         //移动
         handler.setInputAction(function (e) {
             //若此标记为false，则激活对可视域分析对象的操作
             if (!viewer.scene.viewFlag) {
                 //获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
                 var position = e.endPosition;
                 var last = viewer.scene.pickPosition(position);
                 //计算该点与视口位置点坐标的距离
                 var distance = Cesium.Cartesian3.distance(viewPosition, last);
                 if (distance > 0) {
                     //将鼠标当前点坐标转化成经纬度
                     var cartographic = Cesium.Cartographic.fromCartesian(last);
                     var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                     var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                     var height = cartographic.height;
                     //通过该点设置可视域分析对象的距离及方向
                     _self.viewshed3D.setDistDirByPoint([longitude, latitude, height]);
                 }
             }
         }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
         //左键
         handler.setInputAction(function (e) {
             if(!e.position){
                 return false;
             }
             //将获取的点的位置转化成经纬度
             let position = _self.mouseManager.piTerrainToModule(e.position,"1");
             viewPosition = _self.mouseManager.piTerrainToModule(e.position);
             if (viewer.scene.viewFlag) {
                 //设置视口位置
                 _self.viewshed3D.viewPosition = [position.lon, position.lat, position.height];
                 _self.viewshed3D.build();
                 //将标记置为false以激活鼠标移动回调里面的设置可视域操作
                 viewer.scene.viewFlag = false;
             }
         }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
         //右键
         handler.setInputAction(function (e) {
             //鼠标右键事件回调，不再执行鼠标移动事件中对可视域的操作
             viewer.scene.viewFlag = true;

         }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); */
  }

  remove() {
    if (this.viewshed3D != undefined) {
      this.viewshed3D.destroy()
    }
  }
}

// (function () {
//   'use strict'
//   function a(e) {
//     return e && e.__esModule ? e : {
//       default: e
//     }
//   }
//   function n(e, t) {
//     if (!(e instanceof t)) { throw new TypeError('Cannot call a class as a function') }
//   }
//   Object.defineProperty(Cesium, '__esModule', {
//     value: !0
//   }),
//   Cesium.ViewShed3D = void 0
//   var r = (function () {
//     function e(e, t) {
//       for (var i = 0; i < t.length; i++) {
//         var a = t[i]; a.enumerable = a.enumerable || !1, a.configurable = !0, 'value' in a && (a.writable = !0),
//         Object.defineProperty(e, a.key, a)
//       }
//     }
//     return function (t, i, a) {
//       return i && e(t.prototype, i), a && e(t, a), t
//     }
//   }()); var c = {
//     cameraPosition: null,
//     viewPosition: null,
//     horizontalAngle: 120,
//     verticalAngle: 90,
//     visibleAreaColor: new Cesium.Color(0, 1, 0),
//     hiddenAreaColor: new Cesium.Color(1, 0, 0),
//     alpha: 0.5,
//     distance: 100,
//     frustum: !0
//   }
//   Cesium.ViewShed3D = (function () {
//     function e(t, i) {
//       n(this, e), t && (i || (i = {}),
//       this.viewer = t,
//       this.cameraPosition = Cesium.defaultValue(i.cameraPosition, c.cameraPosition),
//       this.viewPosition = Cesium.defaultValue(i.viewPosition, c.viewPosition),
//       this._horizontalAngle = Cesium.defaultValue(i.horizontalAngle, c.horizontalAngle),
//       this._verticalAngle = Cesium.defaultValue(i.verticalAngle, c.verticalAngle),
//       this._visibleAreaColor = Cesium.defaultValue(i.visibleAreaColor, c.visibleAreaColor),
//       this._hiddenAreaColor = Cesium.defaultValue(i.hiddenAreaColor, c.hiddenAreaColor),
//       this._alpha = Cesium.defaultValue(i.alpha, c.alpha),
//       this._distance = Cesium.defaultValue(i.distance, c.distance),
//       this._frustum = Cesium.defaultValue(i.frustum, c.frustum),
//       this.calback = i.calback,
//       this.cameraPosition && this.viewPosition ? (this._addToScene(), this.calback && this.calback()) : this._bindMourseEvent())
//     }
//     return r(e, [{
//       key: '_bindMourseEvent',
//       value: function () {
//         var e = this
//         var t = this.viewer
//         var i = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
//         i.setInputAction(function (i) {
//           var a = Cesium.getCurrentMousePosition(t.scene, i.position)
//           a && (e.cameraPosition ? e.cameraPosition && !e.viewPosition && (e.viewPosition = a,
//           e._addToScene(), e._unbindMourseEvent(), e.calback && e.calback()) : e.cameraPosition = a)
//         }, Cesium.ScreenSpaceEventType.LEFT_CLICK),
//         i.setInputAction(function (i) {
//           var a = Cesium.getCurrentMousePosition(t.scene, i.endPosition)
//           if (a) {
//             var n = e.cameraPosition; n && (e.frustumQuaternion = e.getFrustumQuaternion(n, a),
//             e.distance = Number(Cesium.Cartesian3.distance(n, a).toFixed(1)))
//           }
//         }, Cesium.ScreenSpaceEventType.MOUSE_MOVE),
//         this._handler = i
//       }
//     }, {
//       key: '_unbindMourseEvent',
//       value: function () {
//         this._handler != null && (this._handler.destroy(), delete this._handler)
//       }
//     }, {
//       key: '_addToScene',
//       value: function () {
//         this.frustumQuaternion = this.getFrustumQuaternion(this.cameraPosition, this.viewPosition),
//         this._createShadowMap(this.cameraPosition, this.viewPosition),
//         this._addPostProcess(), !this.radar && this.addRadar(this.cameraPosition, this.frustumQuaternion),
//         this.viewer.scene.primitives.add(this)
//       }
//     }, {
//       key: '_createShadowMap',
//       value: function (e, t, i) {
//         var a = e
//         var n = t
//         var r = this.viewer.scene
//         var o = new Cesium.Camera(r)
//         o.position = a,
//         o.direction = Cesium.Cartesian3.subtract(n, a, new Cesium.Cartesian3(0, 0, 0)),
//         o.up = Cesium.Cartesian3.normalize(a, new Cesium.Cartesian3(0, 0, 0))
//         var l = Number(Cesium.Cartesian3.distance(n, a).toFixed(1))
//         this.distance = l,
//         o.frustum = new Cesium.PerspectiveFrustum({
//           fov: Cesium.Math.toRadians(120),
//           aspectRatio: r.canvas.clientWidth / r.canvas.clientHeight,
//           near: 0.1,
//           far: 5e3
//         })
//         this.viewShadowMap = new Cesium.ShadowMap({
//           lightCamera: o,
//           enable: !1,
//           isPointLight: !1,
//           isSpotLight: !0,
//           cascadesEnabled: !1,
//           context: r.context,
//           pointLightRadius: l
//         })
//       }
//     }, {
//       key: 'getFrustumQuaternion',
//       value: function (e, t) {
//         var i = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(t, e, new Cesium.Cartesian3()), new Cesium.Cartesian3())
//         var a = Cesium.Cartesian3.normalize(e, new Cesium.Cartesian3())
//         var n = new Cesium.Camera(this.viewer.scene)
//         n.position = e,
//         n.direction = i,
//         n.up = a,
//         i = n.directionWC,
//         a = n.upWC
//         var r = n.rightWC
//         var o = new Cesium.Cartesian3()
//         var l = new Cesium.Matrix3()
//         var u = new Cesium.Quaternion()
//         r = Cesium.Cartesian3.negate(r, o)
//         var d = l
//         return Cesium.Matrix3.setColumn(d, 0, r, d),
//         Cesium.Matrix3.setColumn(d, 1, a, d),
//         Cesium.Matrix3.setColumn(d, 2, i, d),
//         Cesium.Quaternion.fromRotationMatrix(d, u)
//       }
//     }, {
//       key: '_addPostProcess',
//       value: function () {
//         var e = this
//         var i = this
//         var a = i.viewShadowMap._isPointLight ? i.viewShadowMap._pointBias : i.viewShadowMap._primitiveBias
//         this.postProcess = this.viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
//           fragmentShader: 'uniform vec4 u_bgColor;\n\
//                                         void main()\n\
//                                         {\n\
//                                     gl_FragColor = u_bgColor;\n\
//                                     }\n\
//                                     ',
//           // document.getElementById('fragment-shader').text,
//           uniforms: {
//             czzj: function () {
//               return e.verticalAngle
//             },
//             dis: function () {
//               return e.distance
//             },
//             spzj: function () {
//               return e.horizontalAngle
//             },
//             visibleColor: function () {
//               return e.visibleAreaColor
//             },
//             disVisibleColor: function () {
//               return e.hiddenAreaColor
//             },
//             mixNum: function () {
//               return e.alpha
//             },
//             stcshadow: function () {
//               return i.viewShadowMap._shadowMapTexture
//             },
//             _shadowMap_matrix: function () {
//               return i.viewShadowMap._shadowMapMatrix
//             },
//             shadowMap_lightPositionEC: function () {
//               return i.viewShadowMap._lightPositionEC
//             },
//             shadowMap_lightDirectionEC: function () {
//               return i.viewShadowMap._lightDirectionEC
//             },
//             shadowMap_lightUp: function () {
//               return i.viewShadowMap._lightCamera.up
//             },
//             shadowMap_lightDir: function () {
//               return i.viewShadowMap._lightCamera.direction
//             },
//             shadowMap_lightRight: function () {
//               return i.viewShadowMap._lightCamera.right
//             },
//             shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
//               var e = new Cesium.Cartesian2()
//               return e.x = 1 / i.viewShadowMap._textureSize.x,
//               e.y = 1 / i.viewShadowMap._textureSize.y,
//               Cesium.Cartesian4.fromElements(e.x, e.y, a.depthBias, a.normalShadingSmooth, this.combinedUniforms1)
//             },
//             shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
//               return Cesium.Cartesian4.fromElements(a.normalOffsetScale, i.viewShadowMap._distance, i.viewShadowMap.maximumDistance,
//                 i.viewShadowMap._darkness, this.combinedUniforms2)
//             }
//           }
//         }))
//       }
//     }, {
//       key: 'removeRadar',
//       value: function () {
//         this.viewer.entities.remove(this.radar)
//       }
//     }, {
//       key: 'resetRadar',
//       value: function () {
//         this.removeRadar(), this.addRadar(this.cameraPosition, this.frustumQuaternion)
//       }
//     }, {
//       key: 'addRadar',
//       value: function (e, t) {
//         var i = e; var a = this
//         this.radar = this.viewer.entities.add({
//           position: i,
//           orientation: t,
//           rectangularSensor: new Cesium.RectangularSensorGraphics({
//             radius: a.distance,
//             xHalfAngle: Cesium.Math.toRadians(a.horizontalAngle / 2),
//             yHalfAngle: Cesium.Math.toRadians(a.verticalAngle / 2),
//             material: new Cesium.Color(0, 1, 1, 0.4),
//             lineColor: new Cesium.Color(1, 1, 1, 1),
//             slice: 8,
//             showScanPlane: !1,
//             scanPlaneColor: new Cesium.Color(0, 1, 1, 1),
//             scanPlaneMode: 'vertical',
//             scanPlaneRate: 3,
//             showThroughEllipsoid: !1,
//             showLateralSurfaces: !1,
//             showDomeSurfaces: !1
//           })
//         })
//       }
//     }, {
//       key: 'update',
//       value: function (e) {
//         this.viewShadowMap && e.shadowMaps.push(this.viewShadowMap)
//       }
//     }, {
//       key: 'destroy',
//       value: function () {
//         this._unbindMourseEvent(),
//         this.viewer.scene.postProcessStages.remove(this.postProcess),
//         this.viewer.entities.remove(this.radar),
//         delete this.radar,
//         delete this.postProcess,
//         delete this.viewShadowMap,
//         delete this.verticalAngle,
//         delete this.viewer,
//         delete this.horizontalAngle,
//         delete this.visibleAreaColor,
//         delete this.hiddenAreaColor,
//         delete this.distance,
//         delete this.frustumQuaternion,
//         delete this.cameraPosition,
//         delete this.viewPosition,
//         delete this.alpha
//       }
//     }, {
//       key: 'horizontalAngle',
//       get: function () {
//         return this._horizontalAngle
//       },
//       set: function (e) {
//         this._horizontalAngle = e,
//         this.resetRadar()
//       }
//     }, {
//       key: 'verticalAngle',
//       get: function () {
//         return this._verticalAngle
//       },
//       set: function (e) {
//         this._verticalAngle = e,
//         this.resetRadar()
//       }
//     }, {
//       key: 'distance',
//       get: function () {
//         return this._distance
//       },
//       set: function (e) {
//         this._distance = e, this.resetRadar()
//       }
//     }, {
//       key: 'visibleAreaColor',
//       get: function () {
//         return this._visibleAreaColor
//       },
//       set: function (e) {
//         this._visibleAreaColor = e
//       }
//     }, {
//       key: 'hiddenAreaColor',
//       get: function () {
//         return this._hiddenAreaColor
//       },
//       set: function (e) { this._hiddenAreaColor = e }
//     }, {
//       key: 'alpha',
//       get: function () {
//         return this._alpha
//       },
//       set: function (e) {
//         this._alpha = e
//       }
//     }]), e
//   }())
// })()

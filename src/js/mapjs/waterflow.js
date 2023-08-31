/*
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-09-19 16:50:03
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-09-19 17:15:57
 * @FilePath: \gis_3d_gate\src\js\mapjs\waterflow.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Cesium from "cesium";
export function createWaterFlowPartical(smokepng,element,applyGravity){
  var waterPartical=  new Cesium.ParticleSystem({
        image: smokepng,
        mass: 1,
        startColor: Cesium.Color.WHITE.withAlpha(0.7),
        endColor: Cesium.Color.WHITE.withAlpha(0.0),

        startScale: element.startscale,
        endScale: element.endscale,

        minimumParticleLife: element.minlife,
        maximumParticleLife: element.maxlife,

        minimumSpeed: element.minspeed,
        maximumSpeed: element.maxspeed,

        imageSize: new Cesium.Cartesian2(element.size, element.size),

        emissionRate: element.emissionRate,

        bursts: [
          // these burst will occasionally sync to create a multicolored effect
          // new Cesium.ParticleBurst({
          //   time: 5.0,
          //   minimum: 10,
          //   maximum: 100,
          // }),
          // new Cesium.ParticleBurst({
          //   time: 10.0,
          //   minimum: 50,
          //   maximum: 100,
          // }),
          // new Cesium.ParticleBurst({
          //   time: 15.0,
          //   minimum: 200,
          //   maximum: 300,
          // }),
        ],

        lifetime: 5.0,

        emitter: new Cesium.CircleEmitter(10),

        emitterModelMatrix:function(){},

        updateCallback: applyGravity,

        sizeInMeters: true
      })

      waterPartical.modelMatrix = computeModelMatrix({ lon: element.lon, lat: element.lat, alt: element.alt });
      waterPartical.emitterModelMatrix = computeEmitterModelMatrix();
      return waterPartical;
}

function computeModelMatrix(position) {
    const center = Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.alt);
    const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    return matrix;
  }
  
  // 改变粒子系统的位置
function computeEmitterModelMatrix() {
    var emitterModelMatrix = new Cesium.Matrix4();
    var translation = new Cesium.Cartesian3();
    var rotation = new Cesium.Quaternion();
    var hpr = new Cesium.HeadingPitchRoll();
    var trs = new Cesium.TranslationRotationScale();
    hpr = Cesium.HeadingPitchRoll.fromDegrees(-95.0, 0.0, 90.0, hpr);
    trs.translation = Cesium.Cartesian3.fromElements(-4.0, 0.0, 1.4, translation);
    trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);
    return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
  }

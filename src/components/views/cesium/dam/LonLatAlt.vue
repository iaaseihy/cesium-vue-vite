
<template>
  <div class="lonlatalt">
    经度：{{info.lonLetter}} {{info.lonString}}纬度：{{info.latLetter}} {{info.latString}}海拔：{{info.altUint}} {{info.altString}}
  </div>
</template>
 
<script setup>
import * as Cesium from "cesium";
import { reactive, defineExpose } from 'vue';
let info = reactive({
  lonLetter: 'E',
  lonString: '000°00′00″',
  latLetter: 'N',
  latString: '000°00′00″',
  altUint: 'M',
  altString: '1000',
  _viewer: null,
  _Cesium: null
});

defineExpose({
  sonInit
});
function sonInit(viewer) {
  info._viewer = viewer;
  info._Cesium = Cesium;
  console.log('sonInit');
  setEvent(viewer, Cesium);
}
function ToDegrees(val) {
  if (typeof val == 'undefined' || val == '') {
    return '';
  }
  var i = val.indexOf('.');
  var strDu = i < 0 ? val : val.substring(0, i); //获取度
  var strFen = 0;
  var strMiao = 0;
  if (i > 0) {
    var strFen = '0' + val.substring(i);
    strFen = strFen * 60 + '';
    i = strFen.indexOf('.');
    if (i > 0) {
      strMiao = '0' + strFen.substring(i);
      strFen = strFen.substring(0, i); //获取分
      strMiao = strMiao * 60 + '';
      i = strMiao.indexOf('.');
      strMiao = strMiao.substring(0, i + 4); //取到小数点后面三位
      strMiao = parseFloat(strMiao).toFixed(2); //精确小数点后面两位
    }
  }
  return strDu + '°' + strFen + '′' + strMiao + '″';
}

function setEvent(viewer) {
  let that = this;
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function(evt) {
    var scene = info._viewer.scene;

    if (scene.mode !== Cesium.SceneMode.MORPHING) {
      let cartesian3 = viewer.scene.pickPosition(evt.position);
      if (cartesian3) {
    
        // 下面两个都行
        // let cartographic3 = Cesium.Cartographic.fromCartesian(cartesian3)
        let cartographic3 =  viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
        var lng = Cesium.Math.toDegrees(cartographic3.longitude);
        var lat = Cesium.Math.toDegrees(cartographic3.latitude);
        var height = cartographic3.height;
            info.lonString=lng.toFixed(6).toString()+"°" //ToDegrees(lng.toString());
            info.latString=lat.toFixed(6).toString()+"°"//ToDegrees(lat.toString());
            info.altString =height.toFixed(2).toString()
       // this.tempPointIds.push(cMapUtil.addTempPoint(tempCartesian3_3, 'tempCartesian3_3', '#2b4592'));
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
</script>
   
<style  scoped>
.lonlatalt {
  width: 100%;
  height: 100%;
  color: white;
}
</style>
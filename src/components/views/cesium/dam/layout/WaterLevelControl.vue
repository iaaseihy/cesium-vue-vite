<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-04 11:53:57
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-09-29 17:54:02
 * @FilePath: \demo\src\components\layout\waterLevel.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="waterlevelcontroldiv">
    <ul>
      <li  @click="xiehong">泄洪</li>
      <li  @click="huifu">恢复</li>
    </ul>
  </div>
</template>

<script setup>
import { defineExpose, defineEmits, onBeforeUnmount, reactive } from 'vue';

let waterlevelInfo = reactive({
  _downWater: null,
  _upWater: null,
  _invertimer: null,
  _upWaterBaseLevel: 0,
  _upWaterSpeedDelte: 20,
  _downWaterBaseLevel: 0,
  _downWaterSpeedDelte: 20,
  _isStarted: false,
  _timer:null,
});


let emits = defineEmits(['updateDuanMianData',"operaFlow"]);
defineExpose({
  waterleveldataInit,
  MonitorEvent,
  stopUpdate,
  goonUpdata
});

function waterleveldataInit(param) {
  waterlevelInfo._downWater = param.downWater;
  waterlevelInfo._upWater = param.upWater;

  waterlevelInfo._downWaterBaseLevel = waterlevelInfo._downWater.baseLevel;
  waterlevelInfo._downWaterLevel = waterlevelInfo._downWater.baseLevel;
  waterlevelInfo._upWaterLevel = waterlevelInfo._upWater.baseLevel;
  waterlevelInfo._upWaterBaseLevel=waterlevelInfo._upWater.baseLevel;
}

function xiehong() {
  if (waterlevelInfo._isStarted) return;
   emits('operaFlow',{code:"START"})
  waterlevelInfo._invertimer = window.setInterval(() => {
    updataLevel();
  }, 1000);
}
function huifu() {
  //停止定时器
  window.clearInterval(waterlevelInfo._invertimer);
  waterlevelInfo._isStarted = false;
  waterlevelInfo._invertimer = null;
  //恢复数据
  waterlevelInfo._upWaterLevel = waterlevelInfo._upWaterBaseLevel;
  waterlevelInfo._downWaterLevel = waterlevelInfo._downWaterBaseLevel;
  (waterlevelInfo._upWaterSpeedDelte = 5),
    (waterlevelInfo._downWaterSpeedDelte = 5),
    //向父级发送数据
    emits('updateDuanMianData', {
      upWaterLevel: {
        _currentLevel: waterlevelInfo._upWaterLevel,
        _currenSpeed: 0
      },
      downWaterLevel: {
        _currentLevel: waterlevelInfo._downWaterLevel,
        _currenSpeed: 0
      }
    });

    emits('operaFlow',{code:"END"})
}
function MonitorEvent(param){
  if (!waterlevelInfo._invertimer) {
    waterlevelInfo._invertimer = window.setInterval(() => {
      updataLevel();
  }, 1000);
  }
}
function setWaterLevel(WaterLevelobject, deltaheight) {
  console.log(WaterLevelobject);
  const translation = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(0, 0, 50));
  //创建平移矩阵方法一

  //创建平移矩阵方法二
  const translation1 = Cesium.Cartesian3.fromArray([0, 0, 1]);
  const mat4 = Cesium.Matrix4.fromTranslation(translation1);
  console.log(WaterLevelobject.enentity, deltaheight);
  // WaterLevelobject.enentity.geometry.extrudedHeight=new Cesium.CallbackProperty(() => 500, false);
  //  Cesium.Matrix4.multiply(WaterLevelobject.enentity.modelMatrix, mat4, WaterLevelobject.enentity.modelMatrix);
  // console.log(translation1);
  // Cesium.Matrix4.multiply(base, translation, WaterLevel.enentity.modelMatrix);
  // console.log((WaterLevelobject.waterLevel + deltaheight),WaterLevelobject.baseMatrix,WaterLevelobject.enentity.modelMatrix);
}

function updataLevel(){
  if (waterlevelInfo._downWaterLevel >= waterlevelInfo._upWaterLevel) {
      return;
    }
    waterlevelInfo._downWaterLevel += 0.3;
    waterlevelInfo._upWaterLevel -= 0.3;

    waterlevelInfo._downWaterSpeedDelte -= 0.05;
    waterlevelInfo._upWaterSpeedDelte -= 0.05;
     waterlevelInfo._downWater.entity.extrudedHeight=waterlevelInfo._downWaterLevel;
     waterlevelInfo._upWater.entity.extrudedHeight=waterlevelInfo._upWaterLevel;
    //向父级发出数据更新信号
    emits('updateDuanMianData', {
      upWaterLevel: {
        _currentLevel: waterlevelInfo._upWaterLevel,
        _currenSpeed: waterlevelInfo._upWaterSpeedDelte
      },
      downWaterLevel: {
        _currentLevel: waterlevelInfo._downWaterLevel,
        _currenSpeed: waterlevelInfo._upWaterSpeedDelte
      }
    });
}

function stopUpdate(){
  if(!waterlevelInfo._invertimer)return;
  else {
    waterlevelInfo._isStarted = false;
    window.clearInterval(waterlevelInfo._invertimer);
    waterlevelInfo._invertimer=null;
  }
}

function goonUpdata(){
  if(waterlevelInfo._invertimer)return;
  else waterlevelInfo._invertimer = window.setInterval(() => {
      updataLevel();
  }, 1000)
}
onBeforeUnmount(() => {
  window.clearInterval(waterlevelInfo._invertimer);
  waterlevelInfo._invertimer = null;
});
</script>

<style scoped lang="less">

ul,li{
  list-style: none
}

.waterlevelcontroldiv {
 min-width: 190px;
  height: 40px;
  border-left: 1px solid #333333;
  border-bottom: 1px solid #333333;
  border-right: 1px solid #333333;
  pointer-events: all;
  ul{
    display: flex;
    width:100%;
    justify-content: space-evenly;
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 0;
  }

  li{
    color: #ffffff;
    margin-top: 5px;
    margin-bottom: 5px;
    line-height: 30px;
    width: 60px;
    text-align: center;
    background-color: rgba(255,255,255,0.2);;
    border-radius: 5px;
  }
  li:hover{
    background-color: aqua;
  }
}
div button {
  margin-left: 10px;
  padding: 0;
  width: 40px;
  height: 30px;
  font-size: 15px;
}
</style>
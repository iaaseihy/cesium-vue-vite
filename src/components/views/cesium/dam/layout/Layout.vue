<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-07-26 10:50:53
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-31 14:11:56
 * @FilePath: \demo\src\components\layout\Layout.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="layoutdiv">
    <SenceVue @GatesLoaded="gatesLoaded" @waterLevelLoaded="waterLevelLoaded" ref="senceRef"></SenceVue>

    <div class="maxvideodiv">
      <MaxVideopanelVue ref="maxvideopanelref"></MaxVideopanelVue>
    </div>
    <!-- <div class="weathercontroldiv"><weathercontrolVue></weathercontrolVue></div> -->
    <div class="letfcomponent">
      <div id="letfcomponentpanel" class="left">
        <div class="title" style="min-width:70px">闸门({{panelInfo._gateCount}})</div>
        <GateControlVue ref="gateControlRef" @updategate="UpdateGate" @shutdwon="gatesShutDwon"></GateControlVue>
        <waterLevelVue @updateDuanMianData="updateWaterLevelData" @operaFlow="operaFlowCommand"
          ref="waterLevelRef"></waterLevelVue>
        <!-- <VidoPanelVue ref="VidoPanelDataInit"></VidoPanelVue> -->
        <VidoPanelVue @OperaCommand="videoPanelCommand"></VidoPanelVue>
        <WeatherButtonVue @click="WatherControlCommnad"></WeatherButtonVue>
        <WaterFlowControlVue @click="OperaWaterFlowCommand"></WaterFlowControlVue>
        <div class="footer"></div>
      </div>
      <div class="right">
        <div v-if="panelInfo._isShow" @click="setPanelVisible(!panelInfo._isShow)" class="iconfont  hidepanel">&#xe74d;
        </div>
        <div v-if="!panelInfo._isShow" @click="setPanelVisible(!panelInfo._isShow)" class="iconfont  showpanel">&#xe74c;
        </div>
      </div>

    </div>
    <div v-show="panelInfo._rightPanelisShow" class="rightcomponent">
      <div class="title" style="min-width:70px">
        <span class="iconfont cameraicon" >&#xe615;<strong>视频(2)</strong></span>
        <!-- <div class="close">
          <CloseBtn @closeCommand="closerightpanel"></CloseBtn>
        </div> -->
      </div>
      <div class="body">
        <div>
          <vidoepanelVue @PanelOpera="PanelOpera" ref="videpanelopera"></vidoepanelVue>
        </div>
      </div>
    </div>

    <div class="header">
      <span class="systemname">数字孪生闸坝监控系统</span>
    </div>
  </div>

</template>

<script setup >
import SenceVue from '../dam.vue';
import getaicon from '../../../../../../public/static/texture/gateicon.png'
import vidoepanelVue from '../digitaltwins/vidoepanel.vue';
import GateControlVue from './GateControl.vue';
import waterLevelVue from './WaterLevelControl.vue';
import VidoPanelVue from './VidoPanel.vue';
import MaxVideopanelVue from '../digitaltwins/MaxVideopanel.vue';
import WeatherButtonVue from '../digitaltwins/WeatherButton.vue';
import WaterFlowControlVue from '../digitaltwins/WaterFlowControl.vue';
import { reactive, ref, defineExpose } from 'vue';

const gateControlRef = ref(null);
const waterLevelRef = ref(null);
const senceRef = ref(null);
const VidoPanelDataInit = ref(null);
const videpanelopera = ref(null)
const maxvideopanelref = ref(null)
let panelInfo = reactive({
  _isShow: true,
  _rightPanelisShow: false,
  _gateCount:8,
});
//发送给闸门控制组件
function gatesLoaded(param) {
  gateControlRef.value.dataInit(param);
}
//发给水位控制组件数据
function waterLevelLoaded(param) {
  waterLevelRef.value.waterleveldataInit(param);
}

//接受水面更新数据

function updateWaterLevelData(param) {
  senceRef.value.updateDuanmian(param);
}
//接受闸门更新数据

function UpdateGate(param){
  senceRef.value.updateFlow(param);
  waterLevelRef.value.MonitorEvent();

}
//接收泄洪命令
function operaFlowCommand(param) {
  senceRef.value.waterFlowOpera(param);
  console.log(param);
  if(param.code=="START"){
    gateControlRef.value.xiehong();
  }else if(param.code=="END"){
    gateControlRef.value.guanbi();
  }

}
//接收控制水流的命令 是否显示
function OperaWaterFlowCommand(param){
  senceRef.value.waterFlowOpera(param);
}

function videoPanelCommand(param) {
  console.log(param);
  if (param.Code == "SHOW") {
    panelInfo._rightPanelisShow = true;
    videpanelopera.value.showallvideo();
  }else if(param.Code == "HIDE"){
    panelInfo._rightPanelisShow = false;
    // videpanelopera.value.showallvideo();
  }
}

function PanelOpera(param) {
  maxvideopanelref.value.updataURL(param)
}
function closerightpanel(param) {
  panelInfo._rightPanelisShow = false;
}

function setPanelVisible(visible) {
  panelInfo._isShow = visible;
  var element = document.getElementById('letfcomponentpanel');
  console.log(panelInfo._isShow);
  if (element) {
    if (panelInfo._isShow) {
      element.style.width = '200px';
      console.log(element.style.width);
    } else {
      element.style.width = 0;
    }
  }
}

function gatesShutDwon(param){
  console.log(param);
  waterLevelRef.value.stopUpdate();
  //senceRef.value.waterFlowOpera(param);
}

function WatherControlCommnad(param){
  senceRef.value.WatherControlCommnad(param)
}
</script>

<style scoped lang="less">

.layoutdiv {
  padding: 0;
  margin: 0;
  position: absolute;
  width: 100%;
  height: 100%;
.header{
  .systemname{
    display: inline-block;
    height: 54px;
    line-height: 54px;
    font-size: 28px;
    width: 100%;
    text-align: center;
    vertical-align: middle;
  }
}
  .letfcomponent {
    position: absolute;
    top: 100px;
    left: 20px;
    display: flex;
    height: 550px;
    width: 200px;
    border-radius: 10px;
   
    .left {
      width: 200px;
      height: 100%;
      background-color:rgba(7, 11, 20, 0.8);
      border-radius: 10px;
      pointer-events: all;
      overflow: hidden;
      transition: all 1s;
      backdrop-filter: blur(12px);
      .title {
        color: white;
        background-color: rgba(7, 11, 20, 0.8);
        border-radius: 10px 10px 0 0;
        height: 40px;
        line-height: 40px;
        padding-left: 15px;
      }
      .title::before{
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 26px;
        height: 26px;
        background-image:  url('/src/assets/images/gateicon.png');
      }
      .footer {
        background-color: #000000;
        border-radius: 0 0 10px 10px;
        height: 40px;
        line-height: 40px;
        padding-left: 15px;
      }
    }

    .right {
      position: relative;
      height: 100%;
      width: 10px;
      pointer-events: all;

      .hidepanel {
        position: absolute;
        left: 0px;
        top: 50%;
        width: 10px;
        height: 50px;
        font-size: 10px;
        color: #ffffff;
        border-radius: 0 5px 5px 0;
        line-height: 50px;
        background-color: rgba(255,255,255,0.2);;
      }

      .showpanel {
        position: absolute;
        color: #ffffff;
        font-size: 10px;
        width: 10px;
        height: 50px;
        border-radius: 0 5px 5px 0;
        top: 50%;
        background-color: rgba(255,255,255,0.2);;
        line-height: 50px;
      }

      .showpanel {
        left: 0px;
      }

      .showpanel:hover {
        background-color: #00e8ee;
      }

      .hidepanel:hover {
        background-color: #00e8ee;
      }
    }
  }

  .rightcomponent {
    position: absolute;
    right: 20px;
    top: 100px;
    width: 400px;
    background-color: #000000;
    border-radius: 10px;

    .title {
      position: relative;
      color: white;
      background-color: #000000;
      border-radius: 10px 10px 0 0;
      height: 40px;
      line-height: 40px;
      padding-left: 15px;
      .cameraicon{
        font-size: 30px;
        display: inline-block;
        vertical-align: middle;
        color: #ffffff;
        strong{
          font-weight: 400;
          font-size: 16px;
          margin-left: 10px;
          display: inline-block;
          line-height: 40px;
          height: 40px;
          vertical-align: text-bottom;
        }
      }
      .close {
        position: absolute;
        top: 0;
        right: 0px;
        width: 40px;
        height: 40px;
      }

    }

    .footer {
      background: #000000;
      border-radius: 0 0 10px 10px;
      width: 100%;
      height: 40px;
    }

  }

  .maxvideodiv {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);

  }

  .weathercontroldiv{
    position: absolute;
    top: 100px;
    left: 220px;
    width: 400px;
    height: 100px;
    background-color: #000000bb;
    pointer-events: all;
  }

  .header{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 54px;
    color: white;
    background-color: #000000bb;
  }
}
</style>
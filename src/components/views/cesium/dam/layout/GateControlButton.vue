<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-02 11:57:35
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-09-21 15:31:54
 * @FilePath: \demo\src\components\layout\GateControlButton.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="gate-element">
    <i>{{propos.gatename}}</i>
    <span @click="btnclick" id="gatecontrol_up"
      :class="info._upSelected?'iconfont selectedbtn':'iconfont'">&#xe743;</span>
    <span @click="btnclick" id="gatecontrol_down"
      :class="info._downSelected?'iconfont selectedbtn':'iconfont'">&#xe7b2;</span>
    <span @click="btnclick" id="gatecontrol_suspend"
      :class="info._suspend?'iconfont selectedbtnpus':'iconfont'">&#xe751;</span>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, reactive, defineExpose } from 'vue';

let info = reactive({
  _upSelected: false,
  _downSelected: false,
  _suspend: true,
});
let emits = defineEmits(['created', "controlEvent"]);

defineExpose({ GateOperaCommand })
let propos = defineProps({
  gatename: {
    type: String,
    default: '未知闸'
  },
  gateid: {
    type: String,
    defualt: ''
  }
});

onMounted(() => {
  //如果没有传入UUID，则自动生成一个
  emits('created', { UUID: propos.gateid, gatename: propos.gatename });//向组件发送信号
});

function btnclick(e) {
  if (e.target.id == 'gatecontrol_up') {
    //控制样式
    info._upSelected = true;
    info._downSelected = false;
    info._suspend = false;
    emits('controlEvent', { UUID: propos.gateid, gatename: propos.gatename, command: "UP" });//向组件发送信号
  }
  if (e.target.id == 'gatecontrol_down') {
    info._upSelected = false;
    info._downSelected = true;
    info._suspend = false;
    emits('controlEvent', { UUID: propos.gateid, gatename: propos.gatename, command: "DOWN" });//向组件发送信号
  }
  if (e.target.id == 'gatecontrol_suspend') {
    info._upSelected = false;
    info._downSelected = false;
    info._suspend = true;
    emits('controlEvent', { UUID: propos.gateid, gatename: propos.gatename, command: "SUSPEND" });//向组件发送信号
  }
}

function GateOperaCommand(OperaCommand) {
  console.log(OperaCommand);

  if (OperaCommand.Command == "UPDATE") {
    if (OperaCommand.name == propos.gatename) {
      info._upSelected = false;
      info._downSelected = false;
      info._suspend = true;
    }
  } else {
    info._upSelected = false;
    info._downSelected = false;
    info._suspend = true;
  }
}
</script>

<style scoped lang="less" >
.gate-element {
  color: white;
  font-family: "PingFang SC-Regular";
  height: 30px;
  display: flex;
  justify-content: space-evenly;
  max-width: 250px;
  min-width: 180px;
}

div i {
  display: inline-block;
  height: 28px;
  width: 60px;
  font-size: 14px;
  text-align: center;
  font-style: normal;
}

div span {
  display: inline-block;
  min-width: 28px;
  width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 14px;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  vertical-align: middle;
  background: rgba(255, 255, 255, 0.2);
}

div span:hover {
  background-color: #00e8ee;
  font-size: 24px;
  cursor: pointer;
}

div .selectedbtn {
  background-color: #00e8ee;
  font-size: 24px;
}

div #gatecontrol_suspend:hover {
  background-color: #EB5757;
  font-size: 24px;
}

div .selectedbtnpus {
  background-color: #EB5757
}
</style>
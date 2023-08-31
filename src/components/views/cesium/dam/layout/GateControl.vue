<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-02 11:45:56
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-09-21 15:27:52
 * @FilePath: \demo\src\components\layout\GateControl.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="gatecontroldiv">
    <div :class="'element'+index" v-for="(item ,index) in  gatesInfo._status">
      <GateControlButtonVue ref="ControlBtnsRef" @created="elementCreated" @controlEvent="controlEvent"
        :gateid=createUUID() :gatename="item.name" :key="index"></GateControlButtonVue>
    </div>
  </div>
</template>

<script setup>
import GateControlButtonVue from "./GateControlButton.vue";
import { defineExpose, ref, reactive, onMounted } from "vue";
import { UUID } from "/src/js/common.js";
const ControlBtnsRef = ref(null);
defineExpose({
  dataInit,
  xiehong,
  guanbi
});
let emits = defineEmits(["updategate", "shutdwon"]);
let gatesInfo = reactive({
  _maps: null,
  _interval: null,
  _UUIDprimitivemaps: {},
  _status: [
    {
      name: "1号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -8,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    },
    {
      name: "2号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -8,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    },
    {
      name: "3号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -8,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    },
    {
      name: "4号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -8,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    },
    {
      name: "5号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -13,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    },
    {
      name: "6号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -13,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    },
    {
      name: "7号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -13,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    },
    {
      name: "8号闸门",
      movedelta: 0,
      moveSpeed: 0.3,
      moveMax: -13,
      moveMin: 0,
      UUID: "",
      state: "SUSPEND"
    }
  ],
  _moveSpeed: 0.3,
  _suspendcount: 0 //记录有几个的闸门
});

onMounted(() => { });

function dataInit(param) {
  gatesInfo._maps = param.primitivesmap;
}
function xiehong() {
  ControlBtnsRef.value.forEach(item => {
    item.GateOperaCommand({ Command: "XIEHONG" });
  });
  if (!gatesInfo._interval) {
    gatesInfo._interval = window.setInterval(gateMove, 1000);
  }
  //所有闸门打开
  gatesInfo._status.forEach(element => {
    var model = gatesInfo._UUIDprimitivemaps[element.UUID];
    const translation = Cesium.Matrix4.fromTranslation(
      new Cesium.Cartesian3(0, 0, element.moveMax - element.movedelta)
    );
    Cesium.Matrix4.multiply(model.modelMatrix, translation, model.modelMatrix);
    element.movedelta = element.moveMax;
    element.state = "SUSPEND";
  });
}
//关闭所有闸门
function guanbi() {
  console.log(ControlBtnsRef.value);
  ControlBtnsRef.value.forEach(item => {
    item.GateOperaCommand({ Command: "GUANBI" });
  });
  if (gatesInfo._interval) {
    window.clearInterval(gatesInfo._interval);
    gatesInfo._interval = null;
  }
  gatesInfo._status.forEach(element => {
    var model = gatesInfo._UUIDprimitivemaps[element.UUID];
    element.state = "SUSPEND";
    const translation = Cesium.Matrix4.fromTranslation(
      new Cesium.Cartesian3(0, 0, -element.movedelta)
    );
    Cesium.Matrix4.multiply(model.modelMatrix, translation, model.modelMatrix);
    element.movedelta = 0;
  });
}
//接受组件创建后的回调函数
function elementCreated(param) {
  var element = gatesInfo._status.find((element, index) => {
    return element.name == param.gatename;
  });
  if (element) {
    element.UUID = param.UUID;
  }
  switch (param.gatename) {
    case "1号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-top1"];
      return;
    case "2号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-top2"];
      return;
    case "3号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-top3"];
      return;
    case "4号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-top4"];
      return;
    case "5号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-bottom1"];
      return;
    case "6号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-bottom2"];
      return;
    case "7号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-bottom3"];
      return;
    case "8号闸门":
      gatesInfo._UUIDprimitivemaps[param.UUID] =
        gatesInfo._maps["sluicegate-bottom4"];
      return;
  }
}
//接受按钮的点击事件
function controlEvent(param) {
  if (!gatesInfo._interval) {
    gatesInfo._interval = window.setInterval(gateMove, 1000);
  }
  var state = gatesInfo._status.find(element => {
    return element.UUID == param.UUID;
  });
  if (state) {
    state.state = param.command;
  }
}

function gateMove() {
  gatesInfo._suspendcount = 0;
  gatesInfo._status.forEach(element => {
    if (element.state != "SUSPEND") {
      var model = gatesInfo._UUIDprimitivemaps[element.UUID];
      if (element.state == "UP") {
        if (element.movedelta < element.moveMin) {
          element.movedelta += gatesInfo._moveSpeed;
          element.moveSpeed = gatesInfo._moveSpeed;
          const translation = Cesium.Matrix4.fromTranslation(
            new Cesium.Cartesian3(0, 0, gatesInfo._moveSpeed)
          );
          Cesium.Matrix4.multiply(
            model.modelMatrix,
            translation,
            model.modelMatrix
          );
          emits("updategate", { param: element }); //向组件发送信号
        } else {
          element.state = "SUSPEND";
          ControlBtnsRef.value.forEach(item => {
            item.GateOperaCommand({
              Command: "UPDATE",
              name: element.name,
              target: "SUSPEND"
            });
          });
          gatesInfo._suspendcount++; //关闭
        }
      } else if (element.state == "DOWN") {
        if (element.movedelta > element.moveMax) {
          element.movedelta -= gatesInfo._moveSpeed;
          element.moveSpeed = -gatesInfo._moveSpeed;
          const translation = Cesium.Matrix4.fromTranslation(
            new Cesium.Cartesian3(0, 0, gatesInfo._moveSpeed * -1)
          );
          Cesium.Matrix4.multiply(
            model.modelMatrix,
            translation,
            model.modelMatrix
          );
          emits("updategate", { param: element }); //向组件发送信号
        } else {
          //闸门开到最大 则停止
          element.state = "SUSPEND";
          ControlBtnsRef.value.forEach(item => {
            item.GateOperaCommand({
              Command: "UPDATE",
              name: element.name,
              target: "SUSPEND"
            });
          });
        }
      }
    } else {
      //判断是关闭还是开到最大
      if (Math.abs(element.movedelta) < 0.001) {
        //如果移动距离位0则是关闭
        gatesInfo._suspendcount++;
      }
    }
  });
  if (gatesInfo._suspendcount == 8) {
    emits("shutdwon", { Command: "SHUTDWON" });
  }
}
//创建UUID
function createUUID() {
  return UUID();
}
</script>

<style scoped lang="less">
.gatecontroldiv {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 330px;
  color: #ffffff;

  .title {
    margin-left: 15px;
    margin-top: 15px;
  }

  >div {
    padding: 5px;
    border-left: 1px solid #333333;
    border-right: 1px solid #333333;
    border-bottom: 1px solid #333333;
  }

  .element0 {
    border: 1px solid #333333;
  }
}
</style>
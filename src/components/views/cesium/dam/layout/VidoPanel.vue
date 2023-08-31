<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-08 17:36:48
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-09-21 15:41:31
 * @FilePath: \demo\src\components\layout\VidoPanel.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div class="videocontrol">
        <span
            class="videoControlbtn"
            @click="showCommand"
        >显示监控</span>
        <span
            class="videoControlbtn"
            @click="hideCommand"
        >隐藏监控</span>
    </div>
</template>

<script setup >
import { defineExpose, reactive, onMounted, defineEmits } from 'vue';
import $ from 'jquery';
import flvjs from 'flv.js';
defineExpose({
  VidoPanelDataInit
});
let emits=defineEmits(['OperaCommand'])
let vidoPanelInfo = reactive({
  _viewer: null,
  _Cesium: null,
  _panelClassName: 'vido-panel',
  _panel1IDname: 'vido-panel1',
  _panel2ClassName: 'vido-panel2',
  _panel1IDName: 'vido-panel1',
  _entityobjarr: []
});

function VidoPanelDataInit(param) {
  vidoPanelInfo._viewer = param.viewer;
  vidoPanelInfo._Cesium = param.Cesium;
  vidoPanelInfo._entityobjarr = param.entitis;
  //创建两个div
  vidoPanelInfo._entityobjarr.forEach(element => {
    var MarkStr =
      '<div id="' +
      element.id +
      '" class="vido-panel" style="top: 0px; width:400px; height:225px;  pointer-events: none; position: absolute; background-color:red; left: 0px;"></div>';
    var id = vidoPanelInfo._viewer._container.id;
    //在cesiumContainer中添加div

    $('#' + id).append(MarkStr);
    var videostr =
      '<video muted style="width: 100%;height: 100%;overflow: hidden;" id="' + element.id + 'video' + '"></video>';
    $('#' + element.id).append(videostr);
    $('#' + element.id).hide();
    getFlvUrl(element.id);
    //设置style
  });

  var handler = new Cesium.ScreenSpaceEventHandler(param.viewer.scene.canvas);
  handler.setInputAction(function(movement) {
    var pick = param.viewer.scene.pick(movement.position);
    if (param.Cesium.defined(pick)) {
      var ellipsoid = param.viewer.scene.globe.ellipsoid;
      var cartographic = param.Cesium.Cartographic.fromCartesian(pick.primitive.position, ellipsoid);
      var alt = cartographic.height;
      //弹窗 参数
      var paramObj = {
        id: pick.primitive.id.id,
        Offset: {
          x: 0,
          y: -5
        }
      };
      //固定弹窗 位置
      PopupCoordinatePositioning(paramObj);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

var PopupCoordinatePositioning = function(paramObj) {
  // $("#" + paramObj.id).style.display = "absolute"; //移除
  var position;
  var obj = vidoPanelInfo._entityobjarr.find(element => {
    return (element.id == paramObj.id);
  });
  if (obj) {
    position = obj.position.pos;
  }
  $('#' + paramObj.id).show();
  //每一帧都要更新div标签坐标
  vidoPanelInfo._viewer.scene.postRender.addEventListener(function() {
    // 每一帧都去计算气泡的正确位置
    console.log(vidoPanelInfo._entityobjarr);
    vidoPanelInfo._entityobjarr.forEach(element => {
      var infoboxContainer = document.getElementById(element.id);
      if (infoboxContainer) {
        var windowPosition = new Cesium.Cartesian2();
        var worldcoodinate = vidoPanelInfo._Cesium.Cartesian3.fromDegrees(
          element.position.pos.lon,
          element.position.pos.lat,
          element.position.pos.alt
        );
        vidoPanelInfo._Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          vidoPanelInfo._viewer.scene,
          worldcoodinate,
          windowPosition
        );
        infoboxContainer.style.top = windowPosition.y - 230 + paramObj.Offset.y + 'px';
        infoboxContainer.style.left = windowPosition.x - 200 + paramObj.Offset.x + 'px';
      }
    });
  });
};

function showCommand() {
  // vidoPanelInfo._entityobjarr.forEach(element => {
  //   var infoboxContainer = $('#' + element.id);
  //   if (infoboxContainer) {
  //     infoboxContainer.hide();
  //   }
  // });
  emits("OperaCommand",{Code:"SHOW"})
}

function hideCommand() {
  // vidoPanelInfo._entityobjarr.forEach(element => {
  //   var infoboxContainer = $('#' + element.id);
  //   if (infoboxContainer) {
  //     infoboxContainer.hide();
  //   }
  // });
  emits("OperaCommand",{Code:"HIDE"})
}
function getFlvUrl(id) {
  $.ajax({
    url: 'http://221.1.218.130:8099/video/v1/play/video_play',
    type: 'get',
    dataType: 'json',
    timeout: 20000,
    data: {
      guid: 585
    },
    success: function(data) {
      if (data.status == 1) {
        if (flvjs.isSupported()) {
          var videoElement = document.getElementById(id + 'video');
          var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            isLive: true,
            hasAudio: false,
            url: data.data.flvUrl
          });

          flvPlayer.attachMediaElement(videoElement);
          flvPlayer.load();
          flvPlayer.play();
        }
      } else {
        alert(data.message);
      }
    }
  });
}
</script>
    
<style scoped>
.videocontrol {
   min-width: 200px;
  pointer-events: all;
  display: flex;
  width: 100%;
  height: 40px;
  border-left: 1px solid #333333;
  border-right: 1px solid #333333;
  border-bottom: 1px solid #333333;
  box-sizing: border-box;
}

.videoControlbtn {
  margin-top: 5px;
  margin-left: 10px;
  display: inline-block;
  line-height: 30px;
  height: 30px;
  width: 80px;
  text-align: center;
  font-size: 16px;
  color: #ffffff;
  background-color:rgba(255,255,255,0.2);;
  border-radius: 5px;

  user-select: none;
}
.videoControlbtn:hover{
    background-color: aqua;
}
</style>
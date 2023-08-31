<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-16 13:24:58
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-08-16 17:57:58
 * @FilePath: \demo\src\components\digitaltwins\MaxVideopanel.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div v-show="info._isShow" class="maxvideopanel">
        <div class="btnpanel">{{ info._videoname }}
            <div class="btns">
                <!-- <MinBtnVue @MinCommand="mincommand"></MinBtnVue> -->
                <CloseBtnVue @CloseCommand="closecommand"></CloseBtnVue>
            </div>
        </div>
        <video id="maxvideo" muted style="width: 100%;height: 100%;overflow: hidden;"></video>
    </div>
</template>

<script setup>
import { reactive, defineExpose } from 'vue';
import CloseBtnVue from '../common/CloseBtn.vue';
import MinBtnVue from '../common/MinBtn.vue';
import $ from 'jquery';
import flvjs from 'flv.js';
let info = reactive({
    _videoURL: '',
    _flvPlayer: null,
    _isShow: false,
    _videoname: ""
})

defineExpose({
    updataURL
})

function updataURL(param) {
    console.log(param);
    flvDestory();
    getFlvUrl(param.URL, "maxvideo")
    info._isShow = true;
    info._videoname = param.name;
}

function getFlvUrl(URL, id) {

    if (flvjs.isSupported()) {
        var videoElement = document.getElementById(id);
         info._flvPlayer = flvjs.createPlayer({
            type: 'flv',
            // isLive: true,
            // hasAudio: false,
            url: URL
        });

         info._flvPlayer.attachMediaElement(videoElement);
         info._flvPlayer.load();
         info._flvPlayer.play();
    }
    // $.ajax({
    //     url: URL,
    //     type: 'get',
    //     dataType: 'json',
    //     timeout: 20000,
    //     data: {
    //         guid: 585
    //     },
    //     success: function (data) {
    //         if (data.status == 1) {
    //             if (flvjs.isSupported()) {
    //                 var videoElement = document.getElementById(id);
    //                 var flvPlayer = flvjs.createPlayer({
    //                     type: 'flv',
    //                     // isLive: true,
    //                     // hasAudio: false,
    //                     url: URL
    //                 });

    //                 flvPlayer.attachMediaElement(videoElement);
    //                 flvPlayer.load();
    //                 flvPlayer.play();
    //             }
    //         } else {
    //             alert(data.message);
    //         }
    //     }
    // });
}
function closecommand(param) {
    info._isShow = false;
    flvDestory();
}
function flvDestory() {
    if (info._flvPlayer) {
        info._flvPlayer.pause();
        info._flvPlayer.unload();
        info._flvPlayer.detachMediaElement();
        info._flvPlayer.destroy();
        info._flvPlayer = null;
    }

}
</script>
  
<style lang='less' scoped>
.maxvideopanel {
    position: relative;
    transform: translateX(100);
    width: 1000px;
    height: 565px;
    background-color: #00000088;

    .btnpanel {
        display: flex;
        width: 100%;
        height: 40px;
        min-width: 50px;
        color: white;
        font-size: 18px;
        vertical-align: middle;
        line-height: 40px;
        padding-left: 10px;
        box-sizing: border-box;
        user-select: none;
        background-color: #00000088;

        .btns {
            position: absolute;
            right: 0;
        }
    }
}
</style>
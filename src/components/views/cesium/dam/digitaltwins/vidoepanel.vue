
<template>
    <div class="videopanel">
        <div class="firstvideo">
            <div class="videotitle">
                <videopaneltileVue @opera-command="firstvideopanelCommand" name="1号监控"></videopaneltileVue>
            </div>
            <div v-show="info._firstshow" id="firstvideobody" class="body">
               
                <video muted style="width: 100%;height: 100%;overflow: hidden;" id="firstvideo"></video>
                 <div class="maxbtn"><MaxBtnVue @max-command="firstmax"></MaxBtnVue></div>
            </div>
        </div>
        <div class="secondvideo" id="secondvideoidiv">
            <div class="videotitle">
                <videopaneltileVue @opera-command="secondvideopanelCommand" name="2号监控"></videopaneltileVue>
            </div>
            <div v-show="info._secondshow" id="secondvideobody" class="body">
                <video muted style="width: 100%;height: 100%;overflow: hidden;" id="secondvideo"></video> 
                <div class="maxbtn"><MaxBtnVue @max-command="secondemax"></MaxBtnVue></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, defineExpose, defineEmits } from 'vue';
import videopaneltileVue from './videopaneltile.vue';
import MaxBtnVue from '../common/MaxBtn.vue';
import $ from 'jquery';
import flvjs from 'flv.js';
import functions from 'buffer';

let info = reactive({
    _firstshow: true,
    // _fristvideURL: 'http://101.200.187.211:8099/live/41050100001110000001@41050100001310000001.flv',
    _fristvideURL: '/api/flv/1654487197578.flv',
    _secondshow: true,
    // _secondvideURL: 'http://101.200.187.211:8099/live/34021000001320000012@34021000001320003003.flv',
    _secondvideURL: '/api/flv/1670745033203.flv',
});
defineExpose({
    showallvideo
})

let emits = defineEmits(["PanelOpera"])
onMounted(() => {
    getFlvUrl(info._fristvideURL, 'firstvideo');
    getFlvUrl(info._secondvideURL, 'secondvideo');
    console.log("onMounted");
});

function firstvideopanelCommand(param) {
    if (param.command == 'HIDE') {
         document.getElementById("firstvideobody").style.height="0px";
    } else if (param.command == "MAX") {
      
    }else if(param.command == 'SHOW'){
       document.getElementById("firstvideobody").style.height="225px";
    }
}
function secondvideopanelCommand(param) {
    
    if (param.command == 'HIDE') {
       document.getElementById("secondvideobody").style.height="0px";
    } else if (param.command == "MAX") {
       
    }
    else if(param.command == 'SHOW'){
        document.getElementById("secondvideobody").style.height="225px";
    }
}

function firstmax(param){
     emits("PanelOpera", { command: param.command, URL: info._fristvideURL, name: '1号监控' })
}
function secondemax(param){
   emits("PanelOpera", { command: param.command, URL: info._secondvideURL, name: "2号监控" })
}
function showallvideo() {
    info._firstshow = true;
    info._secondshow = true;
}
function getFlvUrl(url, id) {
    if (flvjs.isSupported()) {

        // var videoElement = document.getElementById(id);
        // var flvPlayer = flvjs.createPlayer({
        //     type: 'flv',
        //     url: url,
        // });
        // flvPlayer.attachMediaElement(videoElement);
        // flvPlayer.load();
        // flvPlayer.play();
    }
    // $.ajax({
    //     url: url,
    //     type: 'get',
    //     dataType: 'json',
    //     timeout: 20000,
    //     data: {
    //         guid: 585
    //     },
    //     success: function (data) {
    //         console.log(data);
    //         if (data.status == 1) {
    //             if (flvjs.isSupported()) {
    //                 console.log("flvjs.isSupported()");
    //                 var videoElement = document.getElementById(id);
    //                 var flvPlayer = flvjs.createPlayer({
    //                     type: 'flv',
    //                     isLive: true,
    //                     hasAudio: true,
    //                     url: data.data.flvUrl
    //                     // url:"http://101.200.187.211:8099/live/34021000001320000012@34021000001320003003.flv"
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
</script>

<style lang='less' scoped>
.videopanel {
   
    .videotitle {
        height: 40px;
        background-color:rgba(255,255,255,0.2);
    }

    .body {
        position: relative;
        width: 400px;
        height: 225px;
        background-color:#000000;
        transition: all 1s;
        overflow: hidden;
       .maxbtn{
        position:absolute;
        width: 40px;
        height: 40px;
        bottom: 10px;
        right: 10px;
       }
    }
}
</style>
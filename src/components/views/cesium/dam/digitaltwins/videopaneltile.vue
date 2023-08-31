<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-15 16:37:53
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-08-24 18:38:58
 * @FilePath: \demo\src\components\digitaltwins\videopaneltile.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div class="videopaneltile">
        <span class="videoname">{{ pups.name }}</span>
        <div class="btnpanel">
            <!-- <MinBtnVue @MinCommand="mincommand"></MinBtnVue> -->
            <showBtnVue v-show="!info._isShow" @show-command="showcommand"></showBtnVue>
            <hideBtnVue  v-show="info._isShow" @hide-command="hidecommand"></hideBtnVue>
        </div>
    </div>
</template>
  
<script setup>

import showBtnVue from '../common/showBtn.vue';
import hideBtnVue from '../common/hideBtn.vue';
import { defineProps, defineEmits, reactive } from 'vue';
let pups = defineProps({
    name: String
})

let info = reactive({
    _isShow:true,
})

let emits = defineEmits(['OperaCommand'])

function showcommand() {
    info._isShow=!info._isShow;
    emits('OperaCommand', { command: "SHOW" })
    
}
// function mincommand() {
//     emits('OperaCommand', { command: "MIN" })
// }

function hidecommand() {
      info._isShow=!info._isShow;  
    emits('OperaCommand', { command: "HIDE"})
}
</script>

<style lang='less' scoped>
.videopaneltile {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    .videoname{
        position: absolute;
        left: 10px;
        list-style: none;
        display: inline-block;
        vertical-align:middle;
        text-align: center;
        height: 100%;
        line-height: 40px;
        font-size: 20px;
        color: white;

        
    }
    .btnpanel {
        position: absolute;
        right: 0px;
        display: flex;
        width: 90px;
        height: 40px;
        min-width: 90px;
    }
}
</style>
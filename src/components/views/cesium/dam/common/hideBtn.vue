<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-24 16:55:51
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-08-24 18:03:31
 * @FilePath: \demo\src\components\common\hideBtn.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <div @click.stop="clickevent" class="iconfont bntdiv">&#xe743;</div>
</template>

<script setup>
import { defineEmits } from 'vue'
let emits = defineEmits(['HideCommand']);

function clickevent(e) {
    emits("HideCommand", { Command: "HIDE" })
}
</script>

<style lang='less' scoped>
.bntdiv {
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    color: white;
    text-align: center;
    vertical-align: middle;
    user-select: none;
     font-size: 20px;
    cursor: pointer;
}

.bntdiv:hover {
    color: aqua;
}
</style>

<template>
    <div @click.stop="clickevent" class="iconfont bntdiv">&#xe7b2;</div>
</template>

<script setup>
import { defineEmits } from 'vue'
let emits = defineEmits(['ShowCommand']);

function clickevent(e) {
    emits("ShowCommand", { Command: "SHOW" })
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
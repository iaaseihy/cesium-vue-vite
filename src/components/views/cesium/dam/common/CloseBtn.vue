
<template>
    <!-- <div  @click.stop="clickevent" class="iconfont  closebtnpanel"><span @click.stop="clickevent" class="iconfont">&#xe685;</span></div> -->
    <div  @click.stop="clickevent" class="iconfont bntdiv">&#xe685;</div>
</template>

<script setup>
 import {defineEmits} from 'vue'
 let emits = defineEmits(['CloseCommand']);

 function clickevent(e){
    emits("CloseCommand",{Command:"CLOSE"})
 }
</script>

<style lang="less" scoped>
 .bntdiv{
    display: inline-block;
    width:40px;
    height: 40px;
    line-height: 40px;
    color: white;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    cursor: pointer;
  }
   .bntdiv:hover{
    color: aqua;
  }
</style>
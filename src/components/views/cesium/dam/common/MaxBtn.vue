<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-15 11:57:46
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-08-15 17:15:45
 * @FilePath: \demo\src\components\common\CloseBtn.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
    <!-- <div  @click.stop="clickevent" class="iconfont  closebtnpanel"><span @click.stop="clickevent" class="iconfont">&#xe685;</span></div> -->
    <div @click.stop="clickevent" class="iconfont bntdiv">&#xe61f;</div>
</template>

<script setup>
 import {defineEmits} from 'vue'
 let emits = defineEmits(['maxCommand']);

 function clickevent(e){
    emits("MaxCommand",{Command:"MAX"})
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
<!--
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-09-22 17:32:02
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-09-23 14:15:27
 * @FilePath: \gis_3d_gate\src\components\digitaltwins\weathercontrol.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="ddddd">
    <vueSlider :value-fun="Val" :min="0" :max="100"></vueSlider>
  </div>
  
</template>

<script setup>
import vueSlider from '../common/vue-slider.vue'
function Val(eee){
  console.log(eee);
}
</script>

<style lang='less' scoped>
  .ddddd{
    padding: 20px;
    border-color: aqua
  }
</style>

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
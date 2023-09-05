
<template>
  <div class="weatherbtndiv">
    
    <span @click="clickEvent" value="weather_rain" :class="info._israin?'selected':''">雨天</span>
    <span @click="clickEvent" value="weather_snow"  :class="info._isSnow?'selected':''">雪天</span>
    <span @click="clickEvent" value="weather_fog"  :class="info._isFog?'selected':''">雾天</span>
    <span @click="clickEvent" value="shutdown" :class="info._isShut?'selected':''">关闭</span>
  </div>
</template>

<script setup>
import { defineEmits,reactive } from 'vue'

let emits = defineEmits(["click"]);
let info = reactive({
  _israin: false,
  _isSnow: false,
  _isFog: false,
  _isShut:true,

})

function clickEvent(e) {
  switch( e.target.getAttribute('value') ){
    case "weather_rain":
      {
        info._isFog=false;
        info._isSnow=false;
        info._israin=true;
        info._isShut=false;
        break;
      }
      case "weather_snow":
      {
        info._isFog=false;
        info._isSnow=true;
        info._israin=false;
        info._isShut=false;
        break;
      }
      case "weather_fog":
      {
        info._isFog=true;
        info._isSnow=false;
        info._israin=false;
        info._isShut=false;
        break;
      }
      case "shutdown":{
        info._isFog=false;
        info._isSnow=false;
        info._israin=false;
        info._isShut=true;
        break;
      }
      
  }
  emits("click", { type: e.target.getAttribute('value'),keys:["weather_rain","weather_snow","weather_fog"]})
}
</script>

<style lang='less' scoped>
.weatherbtndiv {
  min-width: 200px;
  pointer-events: all;
  display: flex;
  width: 100%;
  height: 40px;
  border-left: 1px solid #333333;
  border-right: 1px solid #333333;
  border-bottom: 1px solid #333333;
  box-sizing: border-box;

  span {
    margin-top: 5px;
    margin-left: 1px;
    display: inline-block;
    line-height: 30px;
    height: 30px;
    width: 45px;
    text-align: center;
    font-size: 16px;
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.2);
    ;
    border-radius: 5px;
    user-select: none;
  }

  span:hover {
    background-color: aqua;
  }
  .selected{
    background-color: aqua;
  }
}
</style>
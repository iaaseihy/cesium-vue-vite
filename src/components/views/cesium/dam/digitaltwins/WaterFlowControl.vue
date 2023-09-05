
<template>
 <div class="waterflowbtndiv">
    
    <span @click="clickEvent" value="flow_show">开始水流</span>
    <span @click="clickEvent" value="flow_shutdown" >关闭水流</span>
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
      emits("click", { type: e.target.getAttribute('value')})
    }
    </script>
    
    <style lang='less' scoped>
    .waterflowbtndiv {
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
        margin-left: 10px;
        display: inline-block;
        line-height: 30px;
        height: 30px;
        width: 80px;
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
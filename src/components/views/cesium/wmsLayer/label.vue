<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-08 16:05:16
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-09 10:41:48
-->
<template>
  <div :id="id" class="divlabel-container" v-if="show">
    <div class="content">
      <div class="close1" @click="closeClick">X</div>
      <div class="animate-maker-border">
        <div class="data-li">
          <span class="animate-marker__text">{{ title }}</span>
          <!-- <span class="animate-marker__text">{{ state }}</span>
        <span class="animate-marker__text">{{ id }}</span> -->
        </div>
        <div class="data-li">
          <div class="data-label textColor">图层描述：</div>
          <div class="data-value">
            <span class="label-num yellowColor">{{ state }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DynamicLabel",
  data() {
    return {
      show: true,
    };
  },
  props: {
    title: {
      type: String,
      default: "标题",
    },
    state: {
      type: String,
      default: "开启",
    },
    id: {
      type: String,
      default: "001",
    },
  },
  methods: {
    closeClick() {
      if (this.closeEvent) {
        this.closeEvent();
      }
    },
  },
};
</script>

<style lang="scss">
.divlabel-container,
.divlabel-container::before,
.divlabel-container::after {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 60px;
  //   pointer-events: auto;
  cursor: pointer;
}
.animate-maker-border,
.animate-maker-border::before,
.animate-maker-border::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.animate-maker-border {
  width: 215px;
  height: 120px;
  margin: 0;
  color: #69ca62;
  box-shadow: inset 0 0 0 1px rgba(105, 202, 98, 0.5);
  //   outline:2px solid red;
  //   outline-offset:5px;
}
.animate-maker-border::before,
.animate-maker-border::after {
  content: "";
  z-index: 10;
  margin: -5%;
  box-shadow: inset 0 0 0 2px;
  animation: clipMe 8s linear infinite;
}
.animate-maker-border::before {
  animation-delay: -4s;
}
@keyframes clipMe {
  0%,
  100% {
    clip: rect(0px, 170px, 2px, 0px);
  }
  25% {
    clip: rect(0px, 2px, 47px, 0px);
  }
  50% {
    clip: rect(45px, 170px, 47px, 0px);
  }
  75% {
    clip: rect(0px, 170px, 47px, 45px);
  }
}
.animate-marker__text {
  color: #fff;
  font-size: 14px;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-weight: bolder;
  user-select: none;
  cursor: pointer;
  background: rgba(0, 173, 181, 0.32);
}
.box-wrap {
  position: absolute;
  left: 21%;
  top: 0;
  width: 100%;
  height: 163px;
  border-radius: 50px 0px 50px 0px;
  border: 1px solid #38e1ff;
  background-color: #38e1ff4a;
  box-shadow: 0 0 10px 2px #29baf1;
  animation: slide 2s;
}
.box-wrap .area {
  position: absolute;
  top: 20px;
  right: 0;
  width: 95%;
  height: 30px;
  background-image: linear-gradient(to left, #4cdef9, #4cdef96b);
  border-radius: 30px 0px 0px 0px;
  animation: area 1s;
}
.close1 {
  position: absolute;
  color: #fff;
  top: 1px;
  left: 220px;
  text-shadow: 2px 2px 2px #022122;
  cursor: pointer;
  animation: fontColor 1s;
}
.area .area-title {
  text-align: center;
  line-height: 30px;
}
@keyframes area {
  0% {
    width: 0%;
  }
  25% {
    width: 0%;
  }

  100% {
    width: 95%;
  }
}
.pine {
  position: absolute;
  // left: 0;
  // bottom: -83px;
  width: 100px;
  height: 100px;
  box-sizing: border-box;
  line-height: 120px;
  text-indent: 5px;
}

.pine::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: -83px;
  width: 40%;
  height: 60px;
  box-sizing: border-box;
  border-bottom: 1px solid #38e1ff;
  transform-origin: bottom center;
  transform: rotateZ(135deg) scale(1.5);
  animation: slash 0.5s;
  filter: drop-shadow(1px 0px 2px #03abb4);
  /* transition: slash 2s; */
}
.content {
  padding: 55px 10px 10px 10px;
}
.content .data-li {
  display: flex;
  height: 40px;
}
</style>

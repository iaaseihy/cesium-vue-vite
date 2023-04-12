<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:35:28
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 16:45:07
-->
<template>
  <!-- <div id="nav">
    <router-link to="/">Login</router-link> |
    <router-link to="/home">Home</router-link>
  </div> -->
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'App',
  components: {
  }
})
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>

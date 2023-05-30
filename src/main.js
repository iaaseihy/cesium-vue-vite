/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:35:28
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-05-30 14:38:17
 */
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from "vue-router";
// import './style.css'
import App from './App.vue'
import routes from './router/index.js'
// import store from './store/index'
import store from "@/store/store.js";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// import * as h337 from 'heatmap.js'
//引入turf.js
import * as turf from '@turf/turf'

// import * as Three from '@types/three';
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
  });

const app = createApp(App)

// 将store、router挂载到全局变量上，方便使用
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
app.config.globalProperties.$store = useStore()
app.config.globalProperties.$router = useRoute()

app.use(router)
app.use(store)
app.use(ElementPlus,{locale:zhCn})
app.use(turf)
// app.use(h337)
// app.use(Three)
app.mount('#app')
// createApp(App).mount('#app')

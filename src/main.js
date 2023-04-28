/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:35:28
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-19 17:28:15
 */
import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router/index.js'
import store from './store/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
//引入turf.js
import * as turf from '@turf/turf'

// import * as Three from '@types/three';

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
// app.use(Three)
app.mount('#app')
// createApp(App).mount('#app')

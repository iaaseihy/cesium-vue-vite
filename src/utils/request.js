/*
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:49:25
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 15:05:11
 */
import axios from 'axios'
import router from '../router/index'
// import { Notification } from 'element-ui'
import store from '../store/index'
import { getToken } from '../utils/auth'
// import Config from '../setting'
import Cookies from 'js-cookie'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  // timeout: Config.timeout // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (getToken()) {
      config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    const code = response.status
    if (code < 200 || code > 300) {
      this.$notify.error({
        title: response.message
      })
      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    let code = 0
    try {
      code = error.response.data.status
    } catch (e) {
      if (error.toString().indexOf('Error: timeout') !== -1) {
        this.$notify.error({
          title: '网络请求超时',
          duration: 5000
        })
        return Promise.reject(error)
      }
    }
    if (code) {
      if (code === 401) {
        store.dispatch('logout').then(() => {
          // 用户登录界面提示
          Cookies.set('point', 401)
          location.reload()
        })
      } else if (code === 403) {
        router.push({ path: '/401' })
      } else {
        const errorMsg = error.response.data.message
        if (errorMsg !== undefined) {
          this.$notify.error({
            title: errorMsg,
            duration: 5000
          })
        }
      }
    } else {
      this.$notify.error({
        title: '接口请求失败',
        duration: 5000
      })
    }
    return Promise.reject(error)
  }
)
export default service

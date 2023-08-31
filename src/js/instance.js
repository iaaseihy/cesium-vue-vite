import Axios from 'axios'
import { runningConf, website } from '@/common/ProjConfig.js'
import { ElMessage } from 'element-plus'
import { Base64 } from 'js-base64'
import { getToken } from '@/utils/auth'

const instance = Axios.create({
  headers: {},
  baseURL: runningConf.baseUrl,
  timeout: 15000,
  withCredentials: true,
})

//整理数据
instance.defaults.transformRequest = function (data) {
  // data = JSON.stringify(data);
  return data
}

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做某事，比如说 设置token
    config.headers.common['Authorization'] = `Basic ${Base64.encode(
      `${website.clientId}:${website.clientSecret}`
    )}`
    if (getToken()) {
      config.headers.common[website.tokenHeader] = getToken()
    }
    return config
  },
  (error) => {
    // 请求错误时做些事
    return Promise.reject(error)
  }
)

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做些事
    let { status, data } = response
    let message = (data && data.msg) || '未知错误'
    if (status === 200) {
      return data
    } else {
      // 跳转到登录页面或其他处理
      ElMessage({
        type: 'error',
        message: message,
      })
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    // 返回接口返回的错误信息
    return Promise.reject(error)
  }
)

export default instance

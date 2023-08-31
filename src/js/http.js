import { ElMessage } from 'element-plus'
import qs from 'query-string'
import axiosInstance from './instance'

const responseHandler = function (xhr, resolve, reject) {
  const text = xhr.responseText
  if (xhr.status === 200) {
    resolve((text && JSON.parse(text)) || text)
  } else {
    let error = new Error(text)
    error.response = xhr
    reject(error)
  }
}

// 针对responseHandler返回进一步处理
const doResponseSuccess = function (res) {
  if (typeof res === 'object') {
    if (res.code === 200) {
      return res.data
    }
    ElMessage.error(res.msg || '操作失败')
    return null
  }
  // 暂未定义的返回结构处理
  return res
}
const doResponseFailure = function (err) {
  ElMessage.error('请求出现异常')
  return null
}

const Http = {
  formatParams: function (params) {
    let paramsStr = ''
    let val = ''
    for (const key in params) {
      if (Object.hasOwnProperty.call(params, key)) {
        val = params[key]
        paramsStr += `&${key}=${val !== undefined ? val : ''}`
      }
    }
    return paramsStr.startsWith('&') ? '?' + paramsStr.slice(1) : paramsStr
  },
  get: function (url) {
    return new Promise((resolve, reject) => {
      axiosInstance
        .get(url)
        .then((response) => {
          let res = response || {}
          if (res.code === 200) {
            return resolve(res.data)
          } else {
            return resolve(res)
          }
        })
        .catch((err) => {
          return reject(err)
        })
    })
  },
  post: function (url, params, isJson = false, toHeader = {}) {
    return new Promise((resolve, reject) => {
      axiosInstance.defaults.headers['Content-Type'] = isJson
        ? 'application/json'
        : 'application/x-www-form-urlencoded'
      // 其他头部设置
      this.setHeader(toHeader, false)
      // 请求
      axiosInstance
        .post(url, isJson ? JSON.stringify(params) : qs.stringify(params))
        .then((response) => {
          let res = response || {}
          if (res.code === 200) {
            return resolve(res.data)
          } else {
            return resolve(res)
          }
        })
        .catch((err) => {
          return reject(err)
        })
    })
  },
  setHeader(obj, isCommon = true) {
    let theHeader = axiosInstance.defaults.headers
    let toHeader = isCommon ? theHeader.common : theHeader
    for (let key in obj) {
      if (key && obj[key] !== undefined) {
        toHeader[key] = obj[key]
      }
    }
  },
  // 跨域
  getJson(url, isByForm = false, crossOrigin = false, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.setRequestHeader(
        'Content-Type',
        isByForm
          ? 'application/x-www-form-urlencoded;charset=UTF-8'
          : 'application/json'
      )
      // 设置运行跨域操作
      xhr.withCredentials = crossOrigin
      xhr.timeout = timeout
      xhr.send()
      xhr.onload = () => {
        responseHandler(xhr, resolve, reject)
      }
      xhr.onerror = () => {
        let error = new Error('error-getJson')
        error.response = xhr
        reject(error)
      }
      xhr.ontimeout = () => {
        let error = new Error('timeout-getJson')
        error.response = xhr
        reject(error)
      }
    })
  },
  downfile(url, crossOrigin = false) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      // 设置运行跨域操作
      xhr.withCredentials = crossOrigin
      xhr.responseType = 'blob'
      xhr.send()
      xhr.onload = () => {
        if (xhr.status === 200) {
          let headerStr = xhr.getAllResponseHeaders() || ''
          let headers = (headerStr && headerStr.split('\n')) || []
          resolve({ headers, resp: xhr.response })
        } else {
          let error = new Error('response status is not equal to 200')
          error.response = xhr
          reject(error)
        }
      }
      xhr.onerror = () => {
        let error = new Error('unexcepted response status')
        error.response = xhr
        reject(error)
      }
    })
  },
  postJson(
    url,
    params,
    isByForm = false,
    crossOrigin = false,
    timeout = 10000
  ) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      xhr.setRequestHeader(
        'Content-Type',
        isByForm
          ? 'application/x-www-form-urlencoded;charset=UTF-8'
          : 'application/json'
      )
      // 设置运行跨域操作
      xhr.withCredentials = crossOrigin
      xhr.timeout = timeout
      xhr.send(isByForm ? qs.stringify(params) : JSON.stringify(params))
      xhr.onload = () => {
        responseHandler(xhr, resolve, reject)
      }
      xhr.onerror = () => {
        let error = new Error('error-postJson')
        error.response = xhr
        reject(error)
      }
      xhr.ontimeout = () => {
        let error = new Error('timeout-postJson')
        error.response = xhr
        reject(error)
      }
    })
  },
  // doGet - 进一步封装上面的getJson
  doGet(url, isByForm = false, crossOrigin = false) {
    return this.getJson(url, isByForm, crossOrigin)
      .then((res) => doResponseSuccess(res))
      .catch((err) => doResponseFailure(err))
  },
  // doPost - 进一步封装上面的postJson
  doPost(url, params, isByForm = false, crossOrigin = false) {
    return this.postJson(url, params, isByForm, crossOrigin)
      .then((res) => doResponseSuccess(res))
      .catch((err) => doResponseFailure(err))
  },
  // json - get
  jsonGet(url, params) {
    return axiosInstance({
      url: url,
      method: 'get',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      // data: params,
      params: params,
    })
  },
}

export default Http

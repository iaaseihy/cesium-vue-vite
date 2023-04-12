/*
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-07 14:49:22
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-07 16:28:52
 */
import request from '../utils/request'

export function getEmailCode(email) {
  return request({
    url: '/api/auth/getEmailCode?email=' + email,
    method: 'post'
  })
}

export function register(data) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

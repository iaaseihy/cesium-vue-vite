/*
 * @Descripttion:
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-29 15:53:08
 * @LastEditors: iaaseihy 774249302@qq.com
 * @LastEditTime: 2023-02-10 11:41:16
 */

export default class Errors {
  constructor(error) {
    this.errorBox(error)
  }

  errorBox(error) {
    alert(error)
  }
}

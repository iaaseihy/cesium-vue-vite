/*
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-07-26 13:35:17
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-07-26 13:46:02
 * @FilePath: \demo\src\js\httpProxy.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import axios from 'axios';

const Http = {
    get: function (url) {
        return new Promise((resolve, reject) => {
            axios.get(url).then((response) => {
                let res = response || {}
                if (res.code === 200) {
                    return resolve(res.data)
                } else {
                    return resolve(res)
                }
            }).catch((err) => {
                return reject(err)
            })
        })
    }
}
export default Http


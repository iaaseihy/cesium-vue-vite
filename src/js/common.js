/*
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-02 13:40:12
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-09-19 16:36:45
 * @FilePath: \demo\src\js\common.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export function UUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function removeObjItem(arr, prop,value) {
    let targetIndex = arr.findIndex((itemTemp) => itemTemp[prop] === value);
    if (targetIndex !== -1) {
      arr.splice(targetIndex, 1);
    }
  }
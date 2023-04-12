/*
 * @Descripttion:
 * @version:
 * @Author: sueRimn
 * @Date: 2019-09-19 09:10:57
 * @LastEditors: iaaseihy 774249302@qq.com
 * @LastEditTime: 2023-02-10 17:15:23
 */
export default class csm {
  constructor(earth) {
    /**
         * csm.viewer
         * @type obj
         */
    this.viewer = earth
    /**
         * csm.scenc
         * @type obj
         */
    this.scenc = earth.scene
    /**
         * csm.camera
         * @type obj
         */
    this.camera = earth.camera
  }

  toJSON() {
    return jQuery.toJSON(this)
  }
}

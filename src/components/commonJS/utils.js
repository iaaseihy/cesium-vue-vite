/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-10 15:01:30
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 14:43:25
 */
/**
 * 通用的方法
 */
import { Cesium3DTileset, ClassificationType } from 'cesium'
import { DEFAULT_CLASSIF_MODEL_STYLE } from './config'
import $ from "jquery"
export function isLoad3DtilesData(viewer, url) {
    let isLoadData = false
    var primitives = viewer.scene.primitives
    for (var i = 0; i < primitives.length; i++) {
        if (url === primitives._primitives[i]._url) {
            isLoadData = true
            break
        }
    }
    return isLoadData
}
export function addClassification3Dtiles(viewer, url) {
    var tileset = new Cesium3DTileset({
        url: url,
        classificationType: ClassificationType.CESIUM_3D_TILE
    })
    tileset.style = DEFAULT_CLASSIF_MODEL_STYLE
    viewer.scene.primitives.add(tileset)
    //tileset.readyPromise.then(function () { })
}
export function remove3DTilesetData(viewer, url) {
    var primitives = viewer.scene.primitives
    for (var i = 0; i < primitives.length; i++) {
        if (primitives._primitives[i]._url === url) {
            viewer.scene.primitives.remove(primitives._primitives[i])
        }
    }
}
/**
 * 传入的参数均为id
 * @param {*} container 
 * @param {*} target 
 */
export function  moveDiv(container, target) {
    if (!$('#' + container)) {
      throw new Error('请指定要操作的元素')
    }
    if (!target) {
      target = container
    }
    $('#' + target).mousedown(function (
      e //e鼠标事件
    ) {
      $('#' + target).css('cursor', 'move') //改变鼠标指针的形状
      // let offset = $("#" + container).offset(); //DIV在页面的位置
      let offset = $('#' + container).position() //DIV在页面的位置
      let x = e.pageX - offset.left //获得鼠标指针离DIV元素左边界的距离
      let y = e.pageY - offset.top //获得鼠标指针离DIV元素上边界的距离
      $(document).bind('mousemove', function (
        ev //绑定鼠标的移动事件，因为光标在DIV元素外面也要有效果，所以要用doucment的事件，而不用DIV元素的事件
      ) {
        $('#' + target).css('cursor', 'move')
        $('#' + container).stop() //加上这个之后
        let _x = ev.pageX - x //获得X轴方向移动的值
        let _y = ev.pageY - y //获得Y轴方向移动的值
        $('#' + container).animate({ left: _x + 'px', top: _y + 'px' }, 10)
      })
    })
    $(document).mouseup(function () {
      $('#' + target).css('cursor', 'default')
      $(this).unbind('mousemove')
    })
  }

/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-14 11:03:23
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-14 11:14:26
 */
import * as Cesium from 'cesium';
export default class DragTool {
    constructor({ viewer }) {
        this.viewer = viewer
        this.leftDownFlag = false
        this.pick = null;//储存实体
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    }
    // 开始拖拽
    startDrag() {
        this.leftDownAction()
        this.mouseMoveAction()
        this.leftUpAction()
    }
    leftDownAction() {
        this.handler.setInputAction(e => {
            let pick = this.viewer.scene.pick(e.position);
            if (Cesium.defined(pick) && (pick.id.id)) {
                this.pick = pick
                this.leftDownFlag = true;
                this.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }
 
    mouseMoveAction() {
        this.handler.setInputAction(e => {
            if (this.leftDownFlag === true && this.pick != null) {
                let ray = this.viewer.camera.getPickRay(e.endPosition);
                let cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
 
                this.pick.id.position = cartesian;
                // this.pick.id.position = new Cesium.CallbackProperty(function () {
                //     return cartesian;
                // }, false);//感觉拖拽有点卡顿
 
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    leftUpAction() {
        this.handler.setInputAction(e => {
            if (this.leftDownFlag === true && this.pick != null) {
                this.leftDownFlag = false;
                this.pointDraged = null;
                this.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
            }
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
    //清除鼠标事件
    cancelDrag() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
}
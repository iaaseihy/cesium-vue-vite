/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-08 16:02:31
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-09 10:46:03
 */
/**
 * @descripion:
 * @param {Viewer} viewer
 * @param {Cartesian2} position
 * @param {String} title
 * @param {String} id
 * @return {*}
 */

//  import Vue from "vue";
 import { createApp, defineComponent } from 'vue';
 import Label from "./label.vue";
//  import Label from './index.vue';
//  let WindowVm = Vue.extend(Label);
 const WindowVm = defineComponent(Label);
 export default class DivLabel{
     
     constructor(val) {
         this.viewer = val.viewer;
         this.height = val.height;
         this.position = Cesium.Cartesian3.fromDegrees(
           val.position[0],
           val.position[1],
           val.height
         );
         let title = val.title;
         let state = val.state;
         let id = val.id;
         this.createEntity = val.valAll;
         const app = createApp(WindowVm, {
            title,
            state,
            id
          });
          this.vmInstance = app.mount(document.createElement('div'));
          this.vmInstance.closeEvent = (e) => {
            this.windowClose();
            if (this.createEntity) {
              this.viewer.entities.remove(this.createEntity)
            }
          };
        //  this.vmInstance = new WindowVm({
        //    propsData: {
        //      title,
        //      id
        //    }
        //  }).$mount(); //根据模板创建一个面板
         val.viewer.cesiumWidget.container.appendChild(this.vmInstance.$el); //将字符串模板生成的内容添加到DOM上
         this.addPostRender();
     }
     
   //添加场景事件
   addPostRender() {
     this.viewer.scene.postRender.addEventListener(this.postRender, this);
   }
 
   //场景渲染事件 实时更新窗口的位置 使其与笛卡尔坐标一致
   postRender() {
     if (!this.vmInstance || !this.vmInstance.$el || !this.vmInstance.$el.style) return;
     const canvasHeight = this.viewer.scene.canvas.height;
     const windowPosition = new Cesium.Cartesian2();
     Cesium.SceneTransforms.wgs84ToWindowCoordinates(
       this.viewer.scene,
       this.position,
       windowPosition
     );
     this.vmInstance.$el.style.bottom =
       canvasHeight - windowPosition.y + this.height + "px";
     const elWidth = this.vmInstance.$el.offsetWidth;
     this.vmInstance.$el.style.left = windowPosition.x - elWidth / 2 + "px";
 
     const camerPosition = this.viewer.camera.position;
     let height = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(camerPosition).height;
     height += this.viewer.scene.globe.ellipsoid.maximumRadius;
     if((!(Cesium.Cartesian3.distance(camerPosition,this.position) > height))&&this.viewer.camera.positionCartographic.height<50000000){
         this.vmInstance.$el.style.display = "block";
     }else{
       this.vmInstance.$el.style.display = "none";
     }
   }
   //关闭 
  windowClose() {
       this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
       if(this.vmInstance){
        this.vmInstance.$el.remove();
        this.vmInstance = null;
}
   }
 }
 

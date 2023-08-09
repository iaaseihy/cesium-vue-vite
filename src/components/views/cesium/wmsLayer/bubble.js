/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-03 16:04:12
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-09 10:56:04
 */
/**
 * @descripion:
 * @param {Viewer} viewer
 * @param {Cartesian2} position
 * @param {String} title
 * @param {String} id
 * @return {*}
 */
import { createApp, defineComponent } from 'vue';
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';
import Label from './index.vue';
const WindowVm = defineComponent(Label);
export default class Bubble {
  constructor(val) {
    console.log(val.monitoItems.data.name);
    this.createEntity = val;
    this.viewer = val.viewer;
    // this.height = val.height;
    // this.position = val.position._value;
    this.position = {
      "x": -1715292.9056561724,
      "y": 4993151.845991413,
      "z": 3566665.4807493156
  }
    // let title = val.monitoItems.data.name;
    // let state = val.monitoItems.data.state;
    let title = val.monitoItems.data.geometry_name;
    let state = val.monitoItems.data.properties.miaoshu;
    let id = val.id;

    // let title = 'the_geom'
    // let state = "澶ч��濉�����";
    // let id = "dayanta.1";
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
  
      val.viewer.cesiumWidget.container.appendChild(this.vmInstance.$el);
    this.addPostRender();
  }
  //添加场景事件
  addPostRender() {
    this.viewer.scene.postRender.addEventListener(this.postRender, this);
    // this.viewer.scene.postRender.addEventListener(this.updateRender, this);
  }

  updateRender() {
    if (!this.vmInstance || !this.vmInstance.$el || !this.vmInstance.$el.style) return;
    let coord = [108.95908736, 34.22015112];

    var canvasPosition = this.viewer.scene.cartesianToCanvasCoordinates (this.position, new Cesium.Cartesian2());
// if(Cesium. defined(canvasPosition)) {
//   document.getElementById('box')[0].top = canvasPosition.y - document.getElementById('box')[0].offsetHeight - 50 + 'px';
//   document.getElementById('box')[0].left = canvasPosition.x - (document.getElementById('box')[0].offsethidth / 2) + 'px';
// };

    let windowCoord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      this.viewer.scene,
      // Cesium.Cartesian3.fromDegrees(...coord, 0)
      this.position
    );
    //设置弹出框位置
    var winpos = this.viewer.scene.cartesianToCanvasCoordinates(
      this.position
    );
    let div = document.getElementsByClassName('box');

    // let x = winpos.x ;
    // let y = winpos.y - this.vmInstance.$el.offsetHeight - 180;

    let x = windowCoord.x - this.vmInstance.$el.offsetWidth / 2 + 120;
    let y = windowCoord.y - this.vmInstance.$el.offsetHeight - 180;
    
    // x = x + 120;
    // y = y - 180;
    // let x = windowCoord.x - div[0].offsetWidth / 8;
    // let y = windowCoord.y + 2 * div[0].offsetHeight;;
    if (this.vmInstance.$el.style.top = '') {
      // div[0].style.top = 0 + 'px';
      // div[0].style.left = 0 + "px";
      div[0].style.cssText = `
        position:absolute;
        left:0;
        top:0;
        height:100px;
        width:100px;
        background:rgba(0,0,0,0.7);
        color:white;
        transform:translate3d(${Math.round(x)}px,${Math.round(y)}px, 0);
    `;
    } else {
      this.vmInstance.$el.style.top = y + 'px';
      this.vmInstance.$el.style.left = x + "px";
      this.vmInstance.$el.style.display = 'block';
      // div[0].style.top = windowCoord.y - div[0].clientHeight + 'px';
      // div[0].style.left = windowCoord.x - div[0].clientWidth / 2 + 'px';
      this.vmInstance.$el.style.transform = null
    }
    const camerPosition = this.viewer.camera.position;
    let height = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(camerPosition).height;
    height += this.viewer.scene.globe.ellipsoid.maximumRadius;
    if((!(Cesium.Cartesian3.distance(camerPosition,this.position) > height))&&this.viewer.camera.positionCartographic.height<50000000){
        this.vmInstance.$el.style.display = "block";
    }else{
      this.vmInstance.$el.style.display = "none";
    }
  //   div[0].style.cssText = `
  //     position:absolute;
  //     width:200px;
  //     color:white;
  // `;


  // const div = document.createElement("div");
  //   div.innerHTML = "弹窗里需要填充点内容，支持html字符串";
  //   this.viewer.container.append(div);

  //   this.viewer.scene.postRender.addEventListener(() => {
  //     let windowCoord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
  //       this.viewer.scene,
  //       // Cesium.Cartesian3.fromDegrees(...coord, 0)
  //       this.position
  //     );
  //     let x = windowCoord.x - div.offsetWidth / 2;
  //     let y = windowCoord.y - div.offsetHeight;
  //     div.style.cssText = `
  //       position:absolute;
  //       left:0;
  //       top:0;
  //       height:100px;
  //       width:100px;
  //       background:rgba(0,0,0,0.7);
  //       color:white;
  //       transform:translate3d(${Math.round(x)}px,${Math.round(y)}px, 0);
  //   `;
  //   });
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
      canvasHeight - windowPosition.y  +200+ "px";
    const elWidth = this.vmInstance.$el.offsetWidth;
    this.vmInstance.$el.style.left = windowPosition.x - elWidth / 2 +140 + "px";

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
  
    //this.vmInstance.$el.style.display = "none"; //删除dom
       this.viewer.scene.postRender.removeEventListener(this.postRender, this); //移除事件监听
      //  this.viewer.scene.postRender.removeEventListener(this.updateRender, this); //移除事件监听
       if(this.vmInstance){
        this.vmInstance.$el.remove();
     //    this.vmInstance.$destroy();
        this.vmInstance = null;
}
   }
}
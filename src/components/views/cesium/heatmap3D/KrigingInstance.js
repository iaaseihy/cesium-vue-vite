// index.js
 
/*
 * @Date: 2023-04-28 09:46:00
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-09-07 11:10:43
 * @Description: 克里金实现雨量插值
 */
import * as Cesium from 'cesium'
import { kriging } from './kriging.js'
import axios from 'axios';
class KrigingInstance {
  constructor(viewer, values, colors, jsonUrl, type) {
    this.viewer = viewer
    this.values = values
    this.colors = colors
    this.jsonUrl = jsonUrl
    this.type = type
    this.handelObj = this._handelValues(values)
    this.lngs = this.handelObj.lngs
    this.lats = this.handelObj.lats
    this.siteValue = this.handelObj.siteValue
    this.ex = []
    this.minx = 0
    this.miny = 0
    this.maxx = 0
    this.maxy = 0
    this._canvas = this._creatCanvas()
    this._entyInstance = null
    this.dataReady = this._getJsonData()
  }
  _coords = []
  updateViewer(values) {
    this.handelObj = this._handelValues(values)
    this.lngs = this.handelObj.lngs
    this.lats = this.handelObj.lats
    this.siteValue = this.handelObj.siteValue
    console.log('start', new Date().getMinutes() + ',' + new Date().getSeconds())
    this.changeCanvas()
    console.log('end', new Date().getMinutes() + ',' + new Date().getSeconds())
    this._entyInstance.polygon.material = new Cesium.ImageMaterialProperty({
      image: this._canvas//使用贴图的方式将结果贴到面上
    })
  }
  addViewer() {
    this.dataReady.then(res => {
      this.changeCanvas()
      if (this._canvas != null) {
        this._entyInstance = this.viewer.entities.add({
          id: "KrigingRain" + this.type,
          polygon: {
            show: true,
            clampToGround: true,
            hierarchy: {
              positions: Cesium.Cartesian3.fromDegreesArray(this._coords)
            },
            material: new Cesium.ImageMaterialProperty({
              image: this._canvas//使用贴图的方式将结果贴到面上
            })
          }
        });
      }
    })
  }
  changeCanvas() {
    //1.用克里金训练一个variogram对象
    let variogram = kriging.train(this.siteValue, this.lngs, this.lats, 'exponential', 0, 100);
    //2.使用刚才的variogram对象使polygons描述的地理位置内的格网元素具备不一样的预测值；
    let grid = kriging.grid(this.ex, variogram, (this.maxy - this.miny) / 1000);
    //3.将得到的格网预测值渲染到canvas画布上
    kriging.plot(this._canvas, grid, [this.minx, this.maxx], [this.miny, this.maxy], this.colors);
  }
  _creatCanvas() {
    let canvas = null;//画布
    canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    canvas.style.display = 'block';
    canvas.getContext('2d').globalAlpha = 1;//设置透明度
    return canvas
  }
  // 根据url 获取数据
  async _getJsonData() {
    let coords = []
    // const { data } = await axios.get(this.jsonUrl)
    const data = this.jsonUrl
    let ex = data.features[0].geometry.coordinates // 流域边界面
    this.ex = ex
    for (let item of ex[0]) {
      coords.push(...item)
    }
    this._coords = coords
    const polygonHierarchy = new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray(this._coords)
    )
    // const polygon = new Cesium.PolygonGeometry({
    //   polygonHierarchy: polygonHierarchy
    // });
    //范围（弧度）
    let extent = Cesium.PolygonGeometry.computeRectangle({
      polygonHierarchy: polygonHierarchy
    });
    this.minx = Cesium.Math.toDegrees(extent.west);//转换为经纬度
    this.miny = Cesium.Math.toDegrees(extent.south);
    this.maxx = Cesium.Math.toDegrees(extent.east);
    this.maxy = Cesium.Math.toDegrees(extent.north);
  }
  // 处理接口返回的数据               
  _handelValues(values) {
    let lngs = []
    let lats = []
    let siteValue = []
    values.map(item => {
      lngs.push(item[0]);
      lats.push(item[1]);
      siteValue.push(item[2])
    })
    return {
      lngs: lngs,
      lats: lats,
      siteValue: siteValue
    }
  }
  // 删除当前实例
  _remove() {
    if (this._entyInstance) this.viewer.entities.remove(this._entyInstance);
    this._entyInstance = null
  }
}
export {
  KrigingInstance
}
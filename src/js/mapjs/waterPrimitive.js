/*
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-08-05 17:41:49
 * @LastEditors: 王建博 wangjianbo@automic.com.cn
 * @LastEditTime: 2022-08-22 15:42:30
 * @FilePath: \demo\src\js\mapjs\waterPrimitive.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Cesium from "cesium";
export function WaterPrimitive(options) {
    this._positions =options.positions;
    this._height =options.height;
    this._extrudedHeight= options.extrudedHeight
    /*
      此处为属性赋值代码
    */
    Object.defineProperty(this, "extrudedHeight", {
        get() {
            return this._extrudedHeight;
        },
        set(newVal) {
            if (Object.prototype.toString.call(newVal) !== "[object Number]") return;
            if (this._primitive) {
                this._primitive._state = 3; // 关键
                this._primitive._appearance = undefined; // 关键
                this._primitive.geometryInstances.geometry = this.getGeometry();
                this._extrudedHeight = newVal;
            }
        }
    });
    this.init(); // 调用init函数
}

WaterPrimitive.prototype.update = function (frameState) {
    if (this._primitive) {
        // console.log(this._primitive);
        let primitive = this._primitive;
        primitive.update(frameState);
    }
};

WaterPrimitive.prototype.init = function () {
    let geometry = this.getGeometry();
    if (!geometry) return;
    this._primitive = new Cesium.Primitive({
        releaseGeometryInstances: false,
        geometryInstances: new Cesium.GeometryInstance({
            geometry
        }),
        asynchronous: false,
        appearance: {} // 参照动态纹理一文
    });
};

WaterPrimitive.prototype.getGeometry = function (positions,height) {
    /*在getGeometry方法中使用多边形图形*/
    return new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(this._positions)), // 多边形坐标
        height: this._height, // 底部高度
        extrudedHeight: this._extrudedHeight, // 水面高度
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    })

}
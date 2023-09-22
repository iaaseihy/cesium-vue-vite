/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-08-31 14:20:57
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-09-13 13:52:21
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
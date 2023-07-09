/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-07-03 10:30:25
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-07-03 10:30:33
 */
/**
 * 经纬网实现
 */
import {
    Color,
    Cartographic,
    Cartesian3,
    PolylineCollection,
    PolylineDashMaterialProperty
} from "cesium";
export class Graticules {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.lines = this.viewer.scene.primitives.add(new PolylineCollection());
        this.color = Color.fromCssColorString("#ffffff").withAlpha(0.5);
        this.width = options?.width ?? 1;
        this.viewer.scene.globe.enableLighting = false; // 禁用灯光照射

        // 隐藏默认的经纬网格
        this.viewer.scene.globe.showGroundAtmosphere = false;
        this.viewer.scene.globe.showWaterEffect = false;

        // 移除 attribution 标志
        this.viewer._cesiumWidget._creditContainer.style.display = "none";
        // this.render();
    }
    // 绘制经线
    drawLongLines() {
        for (let lon = -180; lon <= 180; lon += 10) {
            const positions = [];
            for (let lat = -90; lat <= 90; lat += 1) {
                const cartographic = Cartographic.fromDegrees(lon, lat);
                const position =
                    this.viewer.scene.globe.ellipsoid.cartographicToCartesian(
                        cartographic
                    );
                positions.push(position);
            }
            this.lines.add({
                positions: positions,
                width: this.width
                // material: PolylineDashMaterialProperty({
                //   color: Cesium.Color.WHITE.withAlpha(0.5)
                // })
                // material: this.color  // 加上材质报错
            });
        }
    }
    // 绘制纬线
    drawLatLines() {
        // 计算纬度线的位置
        for (let lat = -90; lat <= 90; lat += 10) {
            const positions = [];
            for (let lon = -180; lon <= 180; lon += 1) {
                const cartographic = Cartographic.fromDegrees(lon, lat);
                const position =
                    this.viewer.scene.globe.ellipsoid.cartographicToCartesian(
                        cartographic
                    );
                positions.push(position);
            }
            this.lines.add({
                positions: positions,
                width: this.width
                // material: PolylineDashMaterialProperty({
                //   color: Cesium.Color.WHITE.withAlpha(0.5)
                // })
                // material: this.color
            });
        }
    }

    render() {
        console.log("执行");
        this.drawLongLines();
        this.drawLatLines();
        return this.lines;
    }

    clear() {
        this.lines.removeAll();
    }

    destroy() {
        this.lines.destroy();
    }
}
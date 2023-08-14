// 抛物飞线效果
// parabolaFlowInit(this.viewer, 3);
// import LineFlowMaterialProperty from './lineFlowMaterialProperty.js'
import PolylineTrailMaterialProperty from './lineFlowMaterialProperty.js'
import img from '../../../../../public/static/texture/color3.png'
import * as Cesium from 'cesium';
/**
* @description: 抛物飞线效果初始化
* @param {*} _viewer
* @param {*} _num :每条线上的飞线数量
* @return {*}
*/
export function parabolaFlowInit(_viewer, outlineWidth, _num) {
    let _center = [119.486506, 32.983991];
    let _positions = [
        [118.408205,
            34.435512],
        [117.777919,
            33.722513],
        [119.045731,
            32.892455],
        [120.802898,
            31.005388],
        [121.025659,
            31.140751],
        [121.403775,
            32.530583],
        [118.86585,
            31.518972],
        [119.120378,
            35.058024]
    ];
    _positions.forEach(item => {
        let _siglePositions = parabola(_center, item, 5000);
        // 创建飞线
        for (let i = 0; i < _num; i++) {
            _viewer.entities.add({
                polyline: {
                    positions: _siglePositions,
                    width: outlineWidth,
                    // 对应 第二种material
                    // material: new PolylineTrailMaterialProperty(
                    //     new Cesium.Color(1.0, 1.0, 0.0, 0.8),
                    //     3000,
                    //     img
                    // )
                    // 对应第一种material
                       material: new PolylineTrailMaterialProperty(
                        new Cesium.Color(1.0, 1.0, 0.0, 0.8),
                        5 * Math.random(),
                        0.1,
                        0.01
                    )
                },
            });
        }
        // 创建轨迹线
        _viewer.entities.add({
            polyline: {
                positions: _siglePositions,
                material: new Cesium.Color(1.0, 1.0, 0.0, 0.2),
            }
        })
    });

    /**
     * @description: 抛物线构造函数（参考开源代码）
     * @param {*} 
     * @return {*}
     */
    function parabola(
        startPosition,
        endPosition,
        height = 0,
        count = 50
    ) {
        //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
        let result = []
        height = Math.max(+height, 100)
        count = Math.max(+count, 50)
        let diffLon = Math.abs(startPosition[0] - endPosition[0])
        let diffLat = Math.abs(startPosition[1] - endPosition[1])
        let L = Math.max(diffLon, diffLat)
        let dlt = L / count
        if (diffLon > diffLat) {
            //base on lon
            let delLat = (endPosition[1] - startPosition[1]) / count
            if (startPosition[0] - endPosition[0] > 0) {
                dlt = -dlt
            }
            for (let i = 0; i < count; i++) {
                let h =
                    height -
                    (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) /
                    Math.pow(L, 2)
                let lon = startPosition[0] + dlt * i
                let lat = startPosition[1] + delLat * i
                let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
                result.push(point);
            }
        } else {
            //base on lat
            let delLon = (endPosition[0] - startPosition[0]) / count
            if (startPosition[1] - endPosition[1] > 0) {
                dlt = -dlt
            }
            for (let i = 0; i < count; i++) {
                let h =
                    height -
                    (Math.pow(-0.5 * L + Math.abs(dlt) * i, 2) * 4 * height) /
                    Math.pow(L, 2)
                let lon = startPosition[0] + delLon * i
                let lat = startPosition[1] + dlt * i
                let point = new Cesium.Cartesian3.fromDegrees(lon, lat, h);
                result.push(point);
            }
        }
        return result
    }
}

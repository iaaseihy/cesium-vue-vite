/*
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-04-13 16:17:28
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-13 17:44:12
 */
import * as Cesium from "cesium";
import * as turf from '@turf/turf'

export default class CutAndFillResultClass {
    constructor(viewer, positions) {
        this.baseHeight = 30,
            this.viewer = viewer,
            this.computeCutAndFillVolumeVoronoi(positions)
    }
    computeCutAndFillVolumeVoronoi(positions) {
        const result = new CutAndFillResult();
        //声明屏幕坐标数组
        const windowPositions = [];
        //先遍历一下多边形节点，获取最低高程点，作为基准高程
        //同时将Cartesian3转为屏幕坐标，存放在数组中
        positions.forEach(element => {
            const cartographic = Cesium.Cartographic.fromCartesian(element);
            this.baseHeight = Math.min(cartographic.height, this.baseHeight);
            windowPositions.push(Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, element));
        })
        //构建泰森多边形的过程
        const bounds = this.getBounds(windowPositions);
        const points = turf.randomPoint(50, { bbox: [bounds[0], bounds[1], bounds[2], bounds[3]] });
        const mainPoly = this.Cartesian2turfPolygon(windowPositions);
        const voronoiPolygons = turf.voronoi(points, { bbox: [bounds[0], bounds[1], bounds[2], bounds[3]] });

        //遍历泰森多边形
        voronoiPolygons.features.forEach(element => {
            const intersectPoints = this.intersect(mainPoly, element.geometry);
            if (intersectPoints.length > 0) {
                //计算每个多边形的面积和高度
                const cubeInfo = this.computeCubeInfo(intersectPoints);
                //低于基准面，填方
                if (this.baseHeight > cubeInfo.avgHeight) {
                    result.fillVolume += (this.baseHeight - cubeInfo.avgHeight) * result.baseArea;
                } else { //高于基准面，挖方
                    result.cutVolume += (cubeInfo.avgHeight - this.baseHeight) * result.baseArea;
                }
                result.maxHeight = Math.max(result.maxHeight, cubeInfo.maxHeight);
                result.minHeight = Math.min(result.minHeight, cubeInfo.minHeight);
                result.baseArea += cubeInfo.baseArea;
                result.baseHeight = this.baseHeight;
            }
        });
        console.log(result);
        return result;
    }
    getBounds(points) {
        let bounds = [];
        let left = Number.MAX_VALUE;
        let right = Number.MIN_VALUE;
        let top = Number.MAX_VALUE;
        let bottom = Number.MIN_VALUE;
        points.forEach(element => {
            left = Math.min(left, element.x);
            right = Math.max(right, element.x);
            top = Math.min(top, element.y);
            bottom = Math.max(bottom, element.y);
        });
        bounds.push(left);
        bounds.push(top);
        bounds.push(right);
        bounds.push(bottom);
        return bounds;
    }
    Cartesian2turfPolygon(positions) {
        var coordinates = [[]];
        positions.forEach(element => {
            coordinates[0].push([element.x, element.y]);
        });
        coordinates[0].push([positions[0].x, positions[0].y]);
        const polygon = turf.polygon(coordinates);
        return polygon.geometry;
    }
    computeCubeInfo(positions) {
        let worldPositions = [];
        let minHeight = Number.MAX_VALUE;
        let maxHeight = Number.MIN_VALUE;
        let sumHeight = 0.0;
        positions.forEach(element => {
            const worldPostion = this.pickCartesian(this.viewer, element).cartesian;
            const cartographic = Cesium.Cartographic.fromCartesian(worldPostion);
            worldPositions.push(cartographic);
            minHeight = Math.min(minHeight, cartographic.height);
            maxHeight = Math.max(maxHeight, cartographic.height);
            sumHeight += cartographic.height;
        });
        const avgHeight = sumHeight / positions.length;
        const result = new CubeInfo();
        result.minHeight = minHeight;
        result.maxHeight = maxHeight;
        result.avgHeight = avgHeight;
        result.baseArea = this.getAreaFromCartograohics(worldPositions);
        return result;
    }
    intersect(poly1, poly2) {
        var intersection = turf.intersect(poly1, poly2);
        if (intersection?.geometry !== undefined) {
            return this.turfPloygon2CartesianArr(intersection?.geometry);
        } else {
            return [];
        }
    }
    turfPloygon2CartesianArr(geometry) {
        const positionArr = [];
        geometry.coordinates.forEach((pointArr) => {
            pointArr.forEach(point => {
                positionArr.push(new Cesium.Cartesian2(point[0], point[1]));
            });
        });
        positionArr.push(new Cesium.Cartesian2(geometry.coordinates[0][0][0], geometry.coordinates[0][0][1]));
        return positionArr;
    }
    getAreaFromCartograohics(positions) {
        const x = [0];
        const y = [0];
        const geodesic = new Cesium.EllipsoidGeodesic();
        const radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
        //数组x,y分别按顺序存储各点的横、纵坐标值
        for (let i = 0; i < positions.length - 1; i++) {
            const p1 = positions[i];
            const p2 = positions[i + 1];
            geodesic.setEndPoints(p1, p2);
            //   const s = Math.sqrt(Math.pow(geodesic.surfaceDistance, 2) +
            //     Math.pow(p2.height - p1.height, 2));
            const s = Math.sqrt(Math.pow(geodesic.surfaceDistance, 2));
            // console.log(s, p2.y - p1.y, p2.x - p1.x)
            const lat1 = p2.latitude * radiansPerDegree;
            const lon1 = p2.longitude * radiansPerDegree;
            const lat2 = p1.latitude * radiansPerDegree;
            const lon2 = p1.longitude * radiansPerDegree;
            let angle = -Math.atan2(
                Math.sin(lon1 - lon2) * Math.cos(lat2),
                Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
            );
            if (angle < 0) {
                angle += Math.PI * 2.0;
            }
            console.log('角度：' + (angle * 180) / Math.PI);

            y.push(Math.sin(angle) * s + y[i]);
            x.push(Math.cos(angle) * s + x[i]);
        }

        let sum = 0;
        for (let i = 0; i < x.length - 1; i++) {
            sum += x[i] * y[i + 1] - x[i + 1] * y[i];
        }
        // console.log(x, y)

        return Math.abs(sum + x[x.length - 1] * y[0] - x[0] * y[y.length - 1]) / 2;
    }
    pickCartesian(viewer, windowPosition) {
        //根据窗口坐标，从场景的深度缓冲区中拾取相应的位置，返回笛卡尔坐标。
        const cartesianModel = viewer.scene.pickPosition(windowPosition);
        //场景相机向指定的鼠标位置（屏幕坐标）发射射线
        const ray = viewer.camera.getPickRay(windowPosition);
        //获取射线与三维球相交的点（即该鼠标位置对应的三维球坐标点，因为模型不属于球面的物体，所以无法捕捉模型表面）
        const cartesianTerrain = viewer.scene.globe.pick(ray, viewer.scene);

        const result = new PickResult();
        if (typeof (cartesianModel) !== 'undefined' && typeof (cartesianTerrain) !== 'undefined') {
            result.cartesian = cartesianModel || cartesianTerrain;
            result.CartesianModel = cartesianModel;
            result.cartesianTerrain = cartesianTerrain;
            result.windowCoordinates = windowPosition.clone();
            //坐标不一致，证明是模型，采用绝对高度。否则是地形，用贴地模式。
            result.altitudeMode = cartesianModel.z.toFixed(0) !== cartesianTerrain.z.toFixed(0) ? Cesium.HeightReference.NONE : Cesium.HeightReference.CLAMP_TO_GROUND;
        }
        return result;

    }
}

export class CutAndFillResult {
    minHeight = Number.MAX_VALUE;
    maxHeight = Number.MIN_VALUE;
    cutVolume = 0.0;
    fillVolume = 0.0;
    baseArea = 0.0;
    baseHeight = null;
}

export class CubeInfo {
    minHeight = Number.MAX_VALUE;
    maxHeight = Number.MIN_VALUE;
    avgHeight = 0.0;
    baseArea = 0.0;
}

export class PickResult {
    cartesian = null;
    CartesianModel = null;
    cartesianTerrain = null;
    windowCoordinates = null;
    altitudeMode = true;
}
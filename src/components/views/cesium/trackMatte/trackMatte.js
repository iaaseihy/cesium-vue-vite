/**
 * 
 * @param {Viewer} viewer
 * @param {Cartesian3} position 经纬度
 * @param {String} id 
 * @param {number} shortwaveRange 半径
 * @return {*}
 * 
*/
import * as Cesium from 'cesium';
export default class TrackMatte {
    constructor(val) {
        this.viewer = val.viewer;
        this.id = val.id;
        this.entity;
        this.shortwaveRange = val.shortwaveRange;
        this.longitude = val.position[0],
        this.latitude = val.position[1],
        this.position = Cesium.Cartesian3.fromDegrees(
          val.position[0],
          val.position[1],
        );
        this.heading = 0;
        this.positionArr = this.calcPoints(
            val.position[0],
            val.position[1],
            val.shortwaveRange,
            0
        ) //储存脏数据
        this.addEntities()
    }
    addEntities(){
        this.entity = this.viewer.entities.add({
            id: this.id,
            position: this.position,
            wall: {
              positions: new Cesium.CallbackProperty(() => {
                return Cesium.Cartesian3.fromDegreesArrayHeights(this.positionArr);
              }, false),
              material: new Cesium.Color.fromCssColorString("#00dcff82"),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0.0,
                10.5e6
              ),
            },
            ellipsoid: {
              radii: new Cesium.Cartesian3(
                this.shortwaveRange,
                this.shortwaveRange,
                this.shortwaveRange
              ),
              maximumCone: Cesium.Math.toRadians(90),
              material: new Cesium.Color.fromCssColorString("#00dcff82"),
              outline: true,
              outlineColor: new Cesium.Color.fromCssColorString("#00dcff82"),
              outlineWidth: 1,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
                0.0,
                10.5e6
              ),
            },
        });
        this.addPostRender()
    }
    addPostRender(){
        this.viewer.clock.onTick.addEventListener(() => {
            this.heading += 10.0;//可调节转动速度
            this.positionArr = this.calcPoints(
              this.longitude,
              this.latitude,
              this.shortwaveRange,
              this.heading
            );
        });
    }
    calcPoints(x1, y1, radius, heading) {
        var m = Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(x1, y1)
        );
        var rx = radius * Math.cos((heading * Math.PI) / 180.0);
        var ry = radius * Math.sin((heading * Math.PI) / 180.0);
        var translation = Cesium.Cartesian3.fromElements(rx, ry, 0);
        var d = Cesium.Matrix4.multiplyByPoint(
          m,
          translation,
          new Cesium.Cartesian3()
        );
        var c = Cesium.Cartographic.fromCartesian(d);
        var x2 = Cesium.Math.toDegrees(c.longitude);
        var y2 = Cesium.Math.toDegrees(c.latitude);
        return this.computeCirclularFlight(x1, y1, x2, y2, 0, 90);
    }
    computeCirclularFlight(x1, y1, x2, y2, fx, angle) {
        let positionArr = [];
        positionArr.push(x1);
        positionArr.push(y1);
        positionArr.push(0);
        var radius = Cesium.Cartesian3.distance(
          Cesium.Cartesian3.fromDegrees(x1, y1),
          Cesium.Cartesian3.fromDegrees(x2, y2)
        );
        for (let i = fx; i <= fx + angle; i++) {
          let h = radius * Math.sin((i * Math.PI) / 180.0);
          let r = Math.cos((i * Math.PI) / 180.0);
          let x = (x2 - x1) * r + x1;
          let y = (y2 - y1) * r + y1;
          positionArr.push(x);
          positionArr.push(y);
          positionArr.push(h);
        }
        return positionArr;
    }
    clearEntities() {
        if (this.entity) {
            this.viewer.entities.remove(this.entity)
        }
    }

}

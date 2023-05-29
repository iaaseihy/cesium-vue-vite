import * as Cesium from 'cesium'
// import * as Cesium from "mars3d-cesium";
import * as mars3d from 'mars3d'
/**
 * @Description:风场
 * @author MrKuang
 * @date 2023/1/13 0013
 */
 
 export default class CanvasWindy3D {
    constructor(json, params) {
        this._windData = json;
        this._viewer = params.viewer;
        this._canvas = params.canvas;
        //可配置的参数
        this._canvasContext = params.canvas.getContext('2d')// canvas上下文
        this._canvasWidth = params.canvasWidth;//画布宽度
        this._canvasHeight = params.canvasHeight;//画布高度
        this._speedRate = params.speedRate || 50;
        this._particlesNumber = params.particlesNumber || 5000;//粒子数
        this._maxAge = params.maxAge || 120; //粒子生命周期
        this._frameTime = 1000/(params.frameRate || 10) ;// 每秒刷新次数
        this._color = params.color || '#ffffff';
        this._lineWidth = params.lineWidth || 1// 线宽度
        // 内置参数
        this._grid = [];
        this._initExtent = []// 风场初始范围
        this._calc_speedRate = [0, 0]// 根据speedRate参数计算经纬度步进长度
        this._windField = null
        this._particles = []
        this._animateFrame = null// requestAnimationFrame事件句柄，用来清除操作
        this.isdistory = false// 是否销毁，进行删除操作
        this._zspeed = 0;
        this._init();
    }
 
    _init() {
        //创建棋盘格子
        this._createWindField();
        this._calcStep();
        // 创建风场粒子
        for (var i = 0; i < this._particlesNumber; i++) {
            this._particles.push(this._randomParticle(new CanvasParticle()));
        }
        this._canvasContext.fillStyle = 'rgba(0, 0, 0, 0.97)'
        this._canvasContext.globalAlpha = 0.6
        this._animate();
 
        var then = Date.now();
        let that = this;
        (function frame() {
            if (!that.isdistory) {
                that._animateFrame = requestAnimationFrame(frame)
                var now = Date.now();
                var delta = now - then;
                if (delta> that._frameTime) {
                    then = now - delta % that._frameTime;
                    that._animate()
                }
            } else {
                that.removeLines()
            }
        })()
    }
 
    _animate() {
        var nextLng = null
        var nextLat = null
        var uvw = null;
        this._graphicData = [];
        this._particles.forEach((particle) => {
            if (particle.age <= 0) {
                this._randomParticle(particle);
            }
            if (particle.age > 0) {
                var tlng = particle.tlng
                var tlat = particle.tlat
                let height = particle.theight;
                var gridpos = this._togrid(tlng, tlat)
                var tx = gridpos[0]
                var ty = gridpos[1]
                if (!this._isInExtent(tlng, tlat)) {
                    particle.age = 0
                } else {
                    uvw = this._getIn(tx, ty)
                    nextLng = tlng + this._calc_speedRate[0] * uvw[0]
                    nextLat = tlat + this._calc_speedRate[1] * uvw[1]
                    particle.lng = tlng
                    particle.lat = tlat
                    particle.x = tx
                    particle.y = ty
                    particle.tlng = nextLng
                    particle.tlat = nextLat
                    particle.height = height;
                    //计算空间距离
                    let d = mars3d.MeasureUtil.getDistance([new mars3d.LngLatPoint(particle.lng, particle.lat, 0), new mars3d.LngLatPoint(particle.tlng, particle.tlat, 0)])
                    // let particle2;
                    // particle2.lng = nextLng;
                    // particle2.lat = nextLat;
                    // particle2.alt = 0;
                    // let d = mars3d.MeasureUtil.getDistance([this.transformWGS84ToCartesian(viewer, particle), this.transformWGS84ToCartesian(viewer, particle2)])
                    let t = d / uvw[3];
                    particle.theight = particle.height + t * uvw[2];
                    particle.age--
                }
            }
        })
        if (this._particles.length <= 0) this.removeLines()
 
        this._drawLines()
    }
 
    _drawLines() {
        var particles = this._particles
        this._canvasContext.lineWidth = this._lineWidth
        // 后绘制的图形和前绘制的图形如果发生遮挡的话，只显示后绘制的图形跟前一个绘制的图形重合的前绘制的图形部分，示例：https://www.w3school.com.cn/tiy/t.asp?f=html5_canvas_globalcompop_all
        this._canvasContext.globalCompositeOperation = 'destination-in'
        this._canvasContext.fillRect(0, 0, this._canvasWidth, this._canvasHeight)
        this._canvasContext.globalCompositeOperation = 'lighter'// 重叠部分的颜色会被重新计算
        this._canvasContext.globalAlpha = 0.9
        this._canvasContext.beginPath()
        this._canvasContext.strokeStyle = this._color
        particles.forEach((particle) => {
            var movetopos = this._tomap(particle.lng, particle.lat, particle)
            var linetopos = this._tomap1(particle.tlng, particle.tlat, particle)
            if (movetopos != null && linetopos != null) {
                this._canvasContext.moveTo(movetopos[0], movetopos[1])
                this._canvasContext.lineTo(linetopos[0], linetopos[1])
            }
        })
        this._canvasContext.stroke()
    }
 
    // 根据粒子当前所处的位置(棋盘网格位置)，计算经纬度，在根据经纬度返回屏幕坐标
    _tomap(lng, lat, particle) {
        if (!lng || !lat) {
            return null
        }
        var ct3 = Cesium.Cartesian3.fromDegrees(lng, lat, particle.height)
        // 判断当前点是否在地球可见端
        var isVisible = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, this._viewer.camera.position).isPointVisible(ct3)
        var pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this._viewer.scene, ct3)
        if (!isVisible) {
            particle.age = 0
        }
        return pos ? [pos.x, pos.y] : null
    }
 
    _tomap1(lng, lat, particle) {
        if (!lng || !lat) {
            return null
        }
        var ct3 = Cesium.Cartesian3.fromDegrees(lng, lat, particle.theight)
        // 判断当前点是否在地球可见端
        var isVisible = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, this._viewer.camera.position).isPointVisible(ct3)
        var pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this._viewer.scene, ct3)
        if (!isVisible) {
            particle.age = 0
        }
        return pos ? [pos.x, pos.y] : null
    }
 
    // 粒子是否在地图范围内
    _isInExtent(lng, lat) {
        if ((lng >= this._windData.xmin && lng <= this._windData.xmax) && (lat >= this._windData.ymin && lat <= this._windData.ymax)) return true
        return false
    }
 
    //创建棋盘格子
    // _createWindField() {
    //     var k = 0
    //     var rows = null
    //     var uvw = null
    //     for (var j = 0; j < this._windData.rows; j++) {
    //         rows = []
    //         for (var i = 0; i < this._windData.cols; i++, k++) {
    //             uvw = this._calcUVW(this._windData.udata[k], this._windData.vdata[k], this._windData.wdata[k])
    //             rows.push(uvw)
    //         }
    //         this._grid.push(rows)
    //     }
    //     console.log(this._grid)
 
    // }
    _createWindField() {
        // var k = 0
        // var rows = null
        // var uvw = null
        // for (var j = 0; j < this._windData.rows; j++) {
        //     rows = []
        //     for (var i = 0; i < this._windData.cols; i++, k++) {
        //         uvw = this._calcUVW(this._windData.udata[k], this._windData.vdata[k], this._windData.wdata[k])
        //         rows.push(uvw)
        //     }
        //     this._grid.push(rows)
        // }
        // console.log(this._grid)

        this._grid = this._parseWindJson();
        console.log(this._grid)
    }
 
    _parseWindJson() {
        let uComponent = null,
            vComponent = null,
            header = null;
        this._windData.forEach(function (record) {
            var type = record.header.parameterCategory + "," + record.header.parameterNumber;
            switch (type) {
                case "2,2":
                    uComponent = record['data'];
                    header = record['header'];
                    break;
                case "2,3":
                    vComponent = record['data'];
                    break;
                default:
                    break;
            }
        });
        return {
            header: header,
            uComponent: uComponent,
            vComponent: vComponent
        };
    }
    //计算风场向量
    _calcUVW(u, v, w) {
        return [+u, +v, +w, Math.sqrt(u * u + v * v)]
    }
 
    // 计算经纬度步进长度
    _calcStep() {
        var calcSpeed = this._speedRate;
        this._calc_speedRate = [(this._windData.xmax - this._windData.xmin) / calcSpeed, (this._windData.ymax - this._windData.ymin) / calcSpeed]
    }
 
    //根据风场范围随机生成粒子
    _randomParticle(particle) {
        let safe = 30;
        let x = -1;
        let y = -1;
        let lng = null;
        let lat = null;
        do {
            try {
                lng = this._fRandomByfloat(this._windData.xmin, this._windData.xmax)
                lat = this._fRandomByfloat(this._windData.ymin, this._windData.ymax)
            } catch (e) {
                // console.log(e)
            }
            if (lng) {
                //找到随机生成的粒子的经纬度在棋盘的位置 x y
                var gridpos = this._togrid(lng, lat);
                x = gridpos[0];
                y = gridpos[1];
            }
        } while (this._getIn(x, y)[2] <= 0 && safe++ < 30)
        let uvw = this._getIn(x, y);
        var nextLng = lng + this._calc_speedRate[0] * uvw[0]
        var nextLat = lat + this._calc_speedRate[1] * uvw[1]
        particle.lng = lng
        particle.lat = lat
        //计算随机点的高程
        particle.height = mars3d.PointUtil.getHeight(this._viewer.scene, new mars3d.LngLatPoint(particle.lng, particle.lat, 0));
        particle.x = x
        particle.y = y
        particle.tlng = nextLng
        particle.tlat = nextLat
        particle.speed = uvw[3]
        particle.age = Math.round(Math.random() * this._maxAge)// 每一次生成都不一样
        //计算空间距离
        let d = mars3d.MeasureUtil.getDistance([new mars3d.LngLatPoint(particle.lng, particle.lat, 0), new mars3d.LngLatPoint(particle.tlng, particle.tlat, 0)])
        let t = d / uvw[3];
        // console.log("距离"+d)
        // console.log("时间"+t)
        // console.log("速度"+particle.speed)
        particle.theight = particle.height + t * uvw[2];
        // console.log("垂直风速"+uvw[2])
        // console.log("一开始垂直高度"+particle.height)
        // console.log("垂直高度"+particle.theight)
        return particle;
    }
 
    _getIn(x, y) {
        //  局部风场使用
        if (x < 0 || x >= this._windData.cols || y >= this._windData.rows || y <= 0) {
            return [0, 0, 0]
        }
        var x0 = Math.floor(x)//向下取整
        var y0 = Math.floor(y)
        var x1;
        var y1
        if (x0 === x && y0 === y) return this._grid[y][x]
 
        x1 = x0 + 1
        y1 = y0 + 1
 
        var g00 = this._getIn(x0, y0)
        var g10 = this._getIn(x1, y0)
        var g01 = this._getIn(x0, y1)
        var g11 = this._getIn(x1, y1)
        var result = null
        // console.log(x - x0, y - y0, g00, g10, g01, g11)
        try {
            result = this._bilinearInterpolation(x - x0, y - y0, g00, g10, g01, g11)
            // console.log(result)
        } catch (e) {
            console.log(x, y)
        }
        return result
    }
 
    // 根据现有参数重新生成风场
    redraw() {
        window.cancelAnimationFrame(this._animateFrame)
        this._particles = [];
        this._grid = [];
        this._init()
    }
 
    // 二分差值算法计算给定节点的速度
    _bilinearInterpolation(x, y, g00, g10, g01, g11) {
        var rx = (1 - x)
        var ry = (1 - y)
        var a = rx * ry;
        var b = x * ry;
        var c = rx * y;
        var d = x * y
        var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d
        var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d
        var w = g00[2] * a + g10[2] * b + g01[2] * c + g11[2] * d
        return this._calcUVW(u, v, w)
    }
 
    // 随机数生成器（小数）
    _fRandomByfloat(under, over) {
        return under + Math.random() * (over - under)
    }
 
    // 根据经纬度，算出棋盘格位置
    _togrid(lng, lat) {
        var x = (lng - this._windData.xmin) / (this._windData.xmax - this._windData.xmin) * (this._windData.cols - 1)
        var y = (this._windData.ymax - lat) / (this._windData.ymax - this._windData.ymin) * (this._windData.rows - 1)
        return [x, y]
    }
 
    // 坐标转换 84转笛卡尔
    transformWGS84ToCartesian(viewer, position, alt = 0) {
        if (viewer) {
          return position
            ? Cesium.Cartesian3.fromDegrees(
                position.lng || position.lon,
                position.lat,
                (position.alt = alt || position.alt),
                Cesium.Ellipsoid.WGS84
              )
            : Cesium.Cartesian3.ZERO;
        }
      }

    _resize(width, height) {
        this.canvasWidth = width
        this.canvasHeight = height
    }
 
    removeLines() {
        window.cancelAnimationFrame(this._animateFrame)
        this.isdistory = true
        this._canvas.width = 1
        document.getElementById('box').removeChild(this._canvas)
    }
}
 
function CanvasParticle() {
    this.lng = null// 粒子初始经度
    this.lat = null// 粒子初始纬度
    this.x = null// 粒子初始x位置(相对于棋盘网格，比如x方向有360个格，x取值就是0-360，这个是初始化时随机生成的)
    this.y = null// 粒子初始y位置(同上)
    this.tlng = null// 粒子下一步将要移动的经度，这个需要计算得来
    this.tlat = null// 粒子下一步将要移动的y纬度，这个需要计算得来
    this.age = null// 粒子生命周期计时器，每次-1
    this.speed = null// 粒子移动速度，可以根据速度渲染不同颜色
}
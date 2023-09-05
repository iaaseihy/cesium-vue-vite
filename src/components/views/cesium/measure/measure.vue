<template>
    <div id="app">
      <div id="cesiumContainer"></div>
      <div class="btnContainer">
        <button @click="draw('Point')">添加标点</button>
        <button @click="draw('Polyline')">标点测距</button>
        <button @click="draw('Polygon')">标点测面</button>
        <button @click="clearAllDrawn()">清空数据</button>
        <div class="tip">
          <p>点击按钮后，在场景内单击左键标点，单击右键结束测量。</p>
          <p>点击“标点测距”按钮后在场景内单击鼠标左键加点，在两点间显示距离，单击右键结束测量。</p>
          <p>点击“标点测面”按钮后在场景内单击鼠标左键加点，单击右键在勾出的范围中显示面积。</p>
          <p>点击“清空数据”按钮删除所有数据。</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import * as Cesium from 'cesium';
  
  export default {
    name: 'App',
    data () {
      return {
        viewer: undefined,
        tempEntities: [],
        pointNum: 0,
        floatingPoint: undefined,
        activeShape: undefined
      }
    },
    mounted () {
      this.Init()
    },
    methods: {
      /* 初始化 */
      Init () {
        // 引入个人token
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYmJkNWQ3Mi0zOGVkLTQ5N2YtYTBmMy0wMDAyODZiMDMyZWYiLCJpZCI6ODQ2NzQsImlhdCI6MTY0NjQ0NTYxNX0.XkHX3rdysM4uUe5VTKDVEV3W2An33zyh4qAkFUac2fk'
        // 设置取景器
        this.viewer = new Cesium.Viewer('cesiumContainer', {
          terrainProvider: Cesium.createWorldTerrain(),
          selectionIndicator: false, // 不显示指示器小部件
          infoBox: false, //  不显示信息框
          sceneModePicker: false, // 不显示模式切换选项
          baseLayerPicker: false,
          navigationHelpButton: false,
          animation: false,
          shouldAnimate: false,
          timeline: false,
          geocoder: false,
          homeButton: false,
          // 添加ArcGIS在线影像底图
          imageryProvider: new Cesium.UrlTemplateImageryProvider({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            subdomains: ['0', '1', '2', '3'],
            tilingScheme: new Cesium.WebMercatorTilingScheme()
          })
        })
        // 若浏览器不支持pickPosition，显示报错信息
        if (!this.viewer.scene.pickPositionSupported) {
          window.alert('This browser does not support pickPosition.')
        }
        // 载入OSM建筑物
        const osmBuildings = this.viewer.scene.primitives.add(Cesium.createOsmBuildings()) // eslint-disable-line no-unused-vars
        // 初始化镜头
        this.viewer.camera.lookAt(
          Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0),
          new Cesium.Cartesian3(5000.0, 5000.0, 5000.0)
        )
        this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
      },
      /* 空间两点距离计算函数 */
      getLength (start, end) {
        // 将起点与终点位置信息从笛卡尔坐标形式转换为Cartographic形式
        let startCartographic = Cesium.Cartographic.fromCartesian(start)
        let endCartographic = Cesium.Cartographic.fromCartesian(end)
        // 初始化测地线
        let geodesic = new Cesium.EllipsoidGeodesic()
        // 设置测地线起点和终点，EllipsoidGeodesic中setEndPoints常与surfaceDistance搭配使用
        geodesic.setEndPoints(startCartographic, endCartographic)
        // 获取起点和终点之间的表面距离，单位为km，规定四舍五入保留两位小数
        // surfaceDistance返回number 单位为m，带小数
        // console.log((geodesic.surfaceDistance / 1000).toFixed(2))
        return (geodesic.surfaceDistance / 1000).toFixed(2)
      },
      /* 空间两点计算中点函数 */
      getMidpoint (start, end) {
        let startPoint = Cesium.Cartographic.fromCartesian(start)
        let endPoint = Cesium.Cartographic.fromCartesian(end)
        let geodesic = new Cesium.EllipsoidGeodesic()
        geodesic.setEndPoints(startPoint, endPoint)
        let geoPoint = geodesic.interpolateUsingFraction(0.5)
        console.log(Cesium.Ellipsoid.WGS84.cartographicToCartesian(geoPoint))
        return Cesium.Ellipsoid.WGS84.cartographicToCartesian(geoPoint)
      },
      addLabel (midPoint, labelLength) {
        let viewer = this.viewer
        return viewer.entities.add({
          name: '中点',
          position: midPoint,
          label: {
            text: labelLength + 'km',
            font: '20px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            backgroundColor: Cesium.Color.BLACK,
            showBackground: true,
            style: Cesium.LabelStyle.FILL,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
      },
      /* 测量空间面积 */
      // 方向
      Bearing (from, to) {
        let fromCartographic = Cesium.Cartographic.fromCartesian(from)
        let toCartographic = Cesium.Cartographic.fromCartesian(to)
        let lat1 = fromCartographic.latitude
        let lon1 = fromCartographic.longitude
        let lat2 = toCartographic.latitude
        let lon2 = toCartographic.longitude
        let angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2))
        if (angle < 0) {
          angle += Math.PI * 2.0
        }
        return angle
      },
      // 角度
      pointAngle (point1, point2, point3) {
        let bearing21 = this.Bearing(point2, point1)
        let bearing23 = this.Bearing(point2, point3)
        let angle = bearing21 - bearing23
        if (angle < 0) {
          angle += Math.PI * 2.0
        }
        return angle
      },
      getArea (positions) {
        let res = 0
        for (let i = 0; i < positions.length - 2; i++) {
          let j = (i + 1) % positions.length
          let k = (i + 2) % positions.length
          let totalAngle = this.pointAngle(positions[i], positions[j], positions[k])
          let tempLength1 = this.getLength(positions[j], positions[0])
          let tempLength2 = this.getLength(positions[k], positions[0])
          res += tempLength1 * tempLength2 * Math.sin(totalAngle) / 2
        }
        res = res.toFixed(2)
        // console.log(res)
        res = parseFloat(res)
        // console.log(Math.abs(res))
        return Math.abs(res)
      },
      addArea (area, positions) {
        let viewer = this.viewer
        return viewer.entities.add({
          name: '多边形面积',
          position: positions[positions.length - 1],
          label: {
            text: area + '平方公里',
            font: '20px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            backgroundColor: Cesium.Color.BLACK,
            showBackground: true,
            style: Cesium.LabelStyle.FILL,
            pixelOffset: new Cesium.Cartesian2(60, -60),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
      },
      /* 绘制函数 */
      drawPointLabel (position, pointNum) {
        let viewer = this.viewer
        // 本质上就是添加一个点的实体
        return viewer.entities.add({
          name: '点几何对象',
          position: position,
          point: {
            color: Cesium.Color.WHEAT,
            pixelSize: 5,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY, //
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND // 规定贴地
          },
          label: {
            text: pointNum,
            font: '30px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            backgroundColor: Cesium.Color.BLACK,
            showBackground: true,
            style: Cesium.LabelStyle.FILL,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER
          }
        })
      },
      drawPoint (position) {
        let viewer = this.viewer
        // 本质上就是添加一个点的实体
        return viewer.entities.add({
          position: position,
          point: {
            color: Cesium.Color.WHEAT,
            pixelSize: 5,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND // 规定贴地
          }
        })
      },
      drawPolyline (positions) {
        let viewer = this.viewer
        if (positions.length < 1) return
        return viewer.entities.add({
          name: '线几何对象',
          polyline: {
            positions: positions,
            width: 5.0,
            material: new Cesium.PolylineGlowMaterialProperty({
              // eslint-disable-next-line new-cap
              color: Cesium.Color.WHEAT
            }),
            depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
              // eslint-disable-next-line new-cap
              color: Cesium.Color.WHEAT
            }),
            clampToGround: true
          }
        })
      },
      drawPolygon (positions) {
        let viewer = this.viewer
        if (positions.length < 2) return
        return viewer.entities.add({
          name: '面几何对象',
          polygon: {
            hierarchy: positions,
            // eslint-disable-next-line new-cap
            material: new Cesium.ColorMaterialProperty(
              Cesium.Color.WHEAT.withAlpha(0.4)
            )
          }
        })
      },
      /* 清除实体 */
      clearAllDrawn () {
        let viewer = this.viewer
        this.tempEntities = []
        this.pointNum = 0
        viewer.entities.removeAll()
      },
      created () {
      },
      /* 根据类型绘制对象
      * @param type point polyline polygon */
      draw (type) {
        let that = this
        let viewer = this.viewer
        // let pointNum = this.pointNum
        // console.log(pointNum)
        let tempEntities = this.tempEntities
        let floatingPoint = this.floatingPoint
        let activeShape = this.activeShape
        let position = []
        let tempPoints = []
        let activeShapePoints = []
        // 开启深度检测
        viewer.scene.globe.depthTestAgainstTerrain = true
        // 创建场景的HTML canvas元素
        let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        switch (type) {
            // 绘制线
          case 'Point':
            // 取消鼠标双击事件
            viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

            // 左键单击开始标点
            handler.setInputAction(function (click) {
              let earthPosition = viewer.scene.pickPosition(click.position)
              if (Cesium.defined(earthPosition)) {
                floatingPoint = that.drawPoint(earthPosition)
                let point = that.drawPointLabel(earthPosition, JSON.stringify(1))
              }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            // 右键单击结束画线
            handler.setInputAction(function (click) {
              console.log(that.pointNum)
              activeShapePoints.pop()
              viewer.entities.remove(activeShapePoints)
              viewer.entities.remove(floatingPoint)
              tempPoints = [] // 清空点位记录
              handler.destroy()
              handler = null
              floatingPoint = undefined
              activeShape = undefined
              activeShapePoints = []
              console.log(that.pointNum)
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            break
          // 绘制线
          case 'Polyline':
            // 取消鼠标双击事件
            viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
            // 监听鼠标移动
            handler.setInputAction(function (movement) {
              if (Cesium.defined(floatingPoint)) {
                let newPosition = viewer.scene.pickPosition(movement.endPosition)
                if (Cesium.defined(newPosition)) {
                  floatingPoint.position.setValue(newPosition)
                  activeShapePoints.pop()
                  activeShapePoints.push(newPosition)
                }
              }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
            // 左键单击开始画线
            handler.setInputAction(function (click) {
              let earthPosition = viewer.scene.pickPosition(click.position)
              if (Cesium.defined(earthPosition)) {
                floatingPoint = that.drawPoint(earthPosition)
              }
              // 获取位置信息
              // 从相机位置创建一条射线，这条射线通过世界中movement.position像素所在的坐标,返回Cartesian3坐标
              let ray = viewer.camera.getPickRay(click.position)
              // 找到射线与渲染的地球表面之间的交点。射线必须以世界坐标给出。返回Cartesian3坐标
              position = viewer.scene.globe.pick(ray, viewer.scene)
              tempPoints.push(position) // 记录点位
              that.pointNum += 1
              let tempLength = tempPoints.length // 记录点数
              // 调用绘制点的接口
              let point = that.drawPointLabel(tempPoints[tempPoints.length - 1], JSON.stringify(that.pointNum))
              tempEntities.push(point)
              // 存在超过一个点时
              if (tempLength > 1) {
                // 绘制线
                let pointLength = that.getLength(tempPoints[tempPoints.length - 2], tempPoints[tempPoints.length - 1])
                let midPosition = that.getMidpoint(tempPoints[tempPoints.length - 2], tempPoints[tempPoints.length - 1])
                let pointline = that.drawPolyline([tempPoints[tempPoints.length - 2], tempPoints[tempPoints.length - 1]])
                let pointLabel = that.addLabel(midPosition, pointLength)
                tempEntities.push(pointline) // 保存记录
                tempEntities.push(pointLabel)
              }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            // 右键单击结束画线
            handler.setInputAction(function (click) {
              console.log(that.pointNum)
              activeShapePoints.pop()
              viewer.entities.remove(activeShapePoints)
              viewer.entities.remove(floatingPoint)
              tempPoints = [] // 清空点位记录
              handler.destroy()
              handler = null
              floatingPoint = undefined
              activeShape = undefined
              activeShapePoints = []
              console.log(that.pointNum)
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            break
          // 绘制面
          case 'Polygon':
            // 取消鼠标双击事件
            viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
            // 监听鼠标移动
            handler.setInputAction(function (movement) {
              if (Cesium.defined(floatingPoint)) {
                let newPosition = viewer.scene.pickPosition(movement.endPosition)
                if (Cesium.defined(newPosition)) {
                  floatingPoint.position.setValue(newPosition)
                  activeShapePoints.pop()
                  activeShapePoints.push(newPosition)
                }
              }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
            // 左键单击开始画线
            handler.setInputAction(function (click) {
              let earthPosition = viewer.scene.pickPosition(click.position)
              if (Cesium.defined(earthPosition)) {
                if (activeShapePoints.length === 0) {
                  floatingPoint = that.drawPoint(earthPosition)
                  activeShapePoints.push(earthPosition)
                  const dynamicPositions = new Cesium.CallbackProperty(function () {
                    return new Cesium.PolygonHierarchy(activeShapePoints)
                  }, false)
                  activeShape = that.drawPolygon(dynamicPositions)
                }
                activeShapePoints.push(earthPosition)
              }
              // 获取位置信息
              let ray = viewer.camera.getPickRay(click.position)
              position = viewer.scene.globe.pick(ray, viewer.scene)
              tempPoints.push(position) // 记录点位
              let tempLength = tempPoints.length // 记录点数
              that.pointNum += 1
              // 调用绘制点的接口
              let point = that.drawPointLabel(tempPoints[tempPoints.length - 1], JSON.stringify(that.pointNum))
              tempEntities.push(point)
              // 存在超过一个点时
              if (tempLength > 1) {
                // 绘制线
                let pointline = that.drawPolyline([tempPoints[tempPoints.length - 2], tempPoints[tempPoints.length - 1]])
                tempEntities.push(pointline) // 保存记录
              }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
            // 右键单击结束画面
            handler.setInputAction(function (click) {
              // 选择一个椭球或地图
              let cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid)
              if (cartesian) {
                let tempLength = tempPoints.length
                if (tempLength < 3) {
                  alert('闭合操作需要至少3个点嗷')
                } else {
                  // 闭合最后一条线
                  let pointline = that.drawPolyline([tempPoints[0], tempPoints[tempPoints.length - 1]])
                  tempEntities.push(pointline)
                  that.drawPolygon(tempPoints)
                  let pointArea = that.getArea(tempPoints)
                  that.addArea(JSON.stringify(pointArea), tempPoints)
                  tempEntities.push(tempPoints)
                  handler.destroy()
                  handler = null
                }
              }
              activeShapePoints.pop()
              viewer.entities.remove(activeShapePoints)
              viewer.entities.remove(floatingPoint)
              floatingPoint = undefined
              activeShapePoints = []
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
            break
        }
      }
    }
  }
  </script>
  
  <style>
  html,
  body {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }
  #app,#cesiumContainer {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .btnContainer {
    position: absolute;
    left: 15px;
    top: 80px;
    padding: 10px 15px;
    /*添加圆角边框*/
    border-radius: 5px;
    border: 1px solid rgba(128,128,128, 0.5);
    color: #ffffff;
    background: rgba(0, 0, 0,0.4);
    box-shadow: 0 4px 8px rgb(128 128 128 / 50%);
    max-width: 300px;
  }
  button {
    background: transparent;
    border: 1px solid #00d0ffb8;
    color: white;
    padding: 7px 9px;
    border-radius: 3px;
    cursor: pointer;
  }
  .tip p{
    margin: 2px 0px;
    padding: 5px 1px;
  }
  </style>
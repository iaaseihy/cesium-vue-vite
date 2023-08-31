// var viewer=ysc.createNormalCesium("cesiumContainer",{
//   //添加cesium中的基础属性
//   infoBox:true
//   ,globalImagery:"谷歌"
//   ,navigationHelpButton:true
//   ,showGroundAtmosphere:false//关闭大气 默认开启,true;
// });

// viewer.terrainProvider=new Cesium.CesiumTerrainProvider({ //地形
//   url : Cesium.IonResource.fromAssetId(3956),
//   requestVertexNormals : true
// });

import * as Cesium from "cesium";

export default function measureAreaSpace(viewer, handler, maxH,interval,speed){
  var waterEntity;
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // 鼠标事件
  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
  var positions = [];
  var tempPoints = [];
  var polygon = null;
  // var tooltip = document.getElementById("toolTip");
  var cartesian = null;
  var floatingPoint;//浮动点
  // tooltip.style.display = "block";

  handler.setInputAction(function(movement){
      // tooltip.style.left = movement.endPosition.x + 3 + "px";
      // tooltip.style.top = movement.endPosition.y - 25 + "px";
      // tooltip.innerHTML ='<p>单击开始，右击结束</p>';
      // cartesian = viewer.scene.pickPosition(movement.endPosition);
      let ray = viewer.camera.getPickRay(movement.endPosition);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      if(positions.length >= 2){
          if (!Cesium.defined(polygon)) {
              polygon = new PolygonPrimitive(positions);
          }else{
              positions.pop();
              // cartesian.y += (1 + Math.random());
              positions.push(cartesian);
          }
          // tooltip.innerHTML='<p>'+distance+'米</p>';
      }
  },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(function(movement){
      // tooltip.style.display = "none";
      // cartesian = viewer.scene.pickPosition(movement.position);
      let ray = viewer.camera.getPickRay(movement.position);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      if(positions.length == 0) {
          positions.push(cartesian.clone());
      }
      //positions.pop();
      positions.push(cartesian);
      //在三维场景中添加点
      var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
      var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
      var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
      var heightString = cartographic.height;
      tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});
      floatingPoint = viewer.entities.add({
          name : '多边形面积',
          position : positions[positions.length - 1],
          point : {
              pixelSize : 10,
              color : Cesium.Color.RED,
              outlineColor : Cesium.Color.WHITE,
              outlineWidth : 3,
              heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
          }
      });
  },Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction(function(movement){
      handler.destroy();
      positions.pop();
      var textArea = getArea(tempPoints) + "平方公里";
      //面积标签
      viewer.entities.add({
          name : '多边形面积',
          position : positions[positions.length - 1],
          label : {
              text : textArea,
              font : '18px sans-serif',
              fillColor : Cesium.Color.GOLD,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth : 2,
              verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
              pixelOffset : new Cesium.Cartesian2(20, -40),
              heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
          }
      });
      //二秒后开始进入淹没分析
      setTimeout(function () {
          if(waterEntity){
              viewer.scene.globe.depthTestAgainstTerrain = true;
              waterEntity.polygon.heightReference="CLAMP_TO_GROUND";
              waterEntity.polygon.material="../images/water.png";
              // var h=0;
              // waterEntity.polygon.extrudedHeight=new Cesium.CallbackProperty(function () {  //或water.polygon.extrudedHeight来进行 定时设置
              //     h+=speed;
              //     if(h>maxH){
              //         h=maxH;//给个最大值
              //     }
              //     return h
              // });

              var h=0;
              waterEntity.polygon.extrudedHeight=0;//需要提前设置 不然会全部出现
              var st=setInterval(function () {
                  h=h+speed;
                  if(h>=maxH){
                      h=maxH;//给个最大值
                      alert("达到最高值");
                      clearTimeout(st);
                  }
                  waterEntity.polygon.extrudedHeight=h;
              },interval);
          }
      },2000);
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK );

  var radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad)
  var degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度

  //计算多边形面积
  function getArea(points) {

      var res = 0;
      //拆分三角曲面

      for (var i = 0; i < points.length - 2; i++) {
          var j = (i + 1) % points.length;
          var k = (i + 2) % points.length;
          var totalAngle = Angle(points[i], points[j], points[k]);


          var dis_temp1 = distance(positions[i], positions[j]);
          var dis_temp2 = distance(positions[j], positions[k]);
          res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle)) ;
          console.log(res);
      }


      return (res/1000000.0).toFixed(4);
  }

  /*角度*/
  function Angle(p1, p2, p3) {
      var bearing21 = Bearing(p2, p1);
      var bearing23 = Bearing(p2, p3);
      var angle = bearing21 - bearing23;
      if (angle < 0) {
          angle += 360;
      }
      return angle;
  }
  /*方向*/
  function Bearing(from, to) {
      var lat1 = from.lat * radiansPerDegree;
      var lon1 = from.lon * radiansPerDegree;
      var lat2 = to.lat * radiansPerDegree;
      var lon2 = to.lon * radiansPerDegree;
      var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
      if (angle < 0) {
          angle += Math.PI * 2.0;
      }
      angle = angle * degreesPerRadian;//角度
      return angle;
  }

  /* 多边形*/
  var PolygonPrimitive = (function(){
      function _(positions){
          this.options = {
              name:'多边形',
              polygon : {
                  hierarchy : [],
                  material:Cesium.Color.WHITE.withAlpha(0)
              }
          };

          this.hierarchy = positions;
          this._init();
      }
      _.prototype._init = function(){
          var _self = this;
          var _update = function(){
              return _self.hierarchy;
          };
          //实时更新polygon.hierarchy
          this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update,false);
          waterEntity= viewer.entities.add(this.options);
      };

      return _;
  })();


  //计算距离
  function distance(point1,point2){
      var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
      var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      var s = geodesic.surfaceDistance;
      //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
      //返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
      return s;
  }
}

//运行
// measureAreaSpace(viewer,2000,10,1); //maxH 设置为2000;最大淹没海拔 每10毫秒前进1海拔;



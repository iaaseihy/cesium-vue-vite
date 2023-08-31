/*
 * @Author: 王建博 wangjianbo@automic.com.cn
 * @Date: 2022-07-26 14:19:14
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-08-30 14:15:23
 * @FilePath: \demo\src\js\mapjs\entityOperation.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import waternormolsIMG from '../../assets/images/waterNormals.jpg'


export function createGroudRegon(positions, color, Cesium) {
  var primitive = new Cesium.GroundPrimitive({
    //贴地的primitive
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        //支持CircleGeometry，CorridorGeometry，EllipseGeometry，RectangleGeometry
        polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),

      }),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
      }
    }),
    appearance: new Cesium.PerInstanceColorAppearance()
  });
  return primitive;
}

export function createDynamincWater(positions, height, Cesium) {
  //河道关键点数组
  //河道1多边形
  console.log("createDynamincWater");
  var polygon = new Cesium.PolygonGeometry({
    polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),
    extrudedHeight: height,
    // height: 0,
    perPositionHeight: true,
    // vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
  });
  var River1 = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: polygon
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: false
    }),
    show: true
  });

  var River1_Material = new Cesium.Material({
    fabric: {
      type: 'Water',
      uniforms: {
        normalMap: waternormolsIMG,
        frequency: 3000.0,
        animationSpeed: 0.01,
        amplitude: 100.0
      }
    }
  });
  River1.appearance.material = River1_Material;
  return River1;
}

export function createGLTFModel(modelURL, position, scalexyz, Cesium) {
  const center = Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.alt)
  const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center)
  var model =
    Cesium.Model.fromGltf({
      url: modelURL,
      modelMatrix: matrix
    })
  const scale = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(scalexyz.x, scalexyz.y, scalexyz.z), new Cesium.Matrix4)
  model.modelMatrix = Cesium.Matrix4.multiply(model.modelMatrix, scale, model.modelMatrix)
  //沿X轴旋转90度，其它轴同理
  const angel = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(position.heading))
  const rotation = Cesium.Matrix4.fromRotationTranslation(angel)
  Cesium.Matrix4.multiply(model.modelMatrix, rotation, model.modelMatrix)

  return model;
}

export function creatGateNumNote(param, Cesium) {
  var entity = new Cesium.Entity({
    name: param.text,
    position: Cesium.Cartesian3.fromDegrees(param.position[0], param.position[1], param.position[2]),
    point: {
      //点
      pixelSize: 2,
      HeightReference: 2
    },
    label: {
      //文字标签
      text: param.text,
      font: '500 30px Helvetica', // 15pt monospace
      scale: 0.5,
      style: Cesium.LabelStyle.FILL,
      fillColor: Cesium.Color.WHITE,
      lineColor: Cesium.Color.BLACK,
      pixelOffset: new Cesium.Cartesian2(0, -3), //偏移量
      showBackground: true,
      backgroundColor: new Cesium.Color(0.0, 0.0, 0.0, 0.6),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        3000
      ),
    },
  });

  return entity;
}

export function addLineGround(param, Cesium) {
  var entity = new Cesium.Entity({
    name: param.name,
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArray(param.positions),
      maximumHeights: new Array(param.positions.length / 2).fill(param.height),
      minimumHeights: new Array(param.positions.length / 2).fill(0),
      material: param.color
    }
  })
  return entity;
}

export function createUpDownNote(param, Cesium) {
  var entity = new Cesium.Entity({
    name: param.text,
    position: Cesium.Cartesian3.fromDegrees(param.position[0], param.position[1], param.position[2]),

    point: {
      //点
      pixelSize: 3,
      HeightReference: 3,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        8000
      ),
    },
    billboard: {
      image: param.url,
      scale:0.8,
   
      // horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        8000
      ),
    },
    label: {
      //文字标签
      text: param.text,
      scale: 0.5,
      //  width: 40,
      //  height: 10,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WIHTE,
      pixelOffset: new Cesium.Cartesian2(0, -13),   //偏移量
      showBackground: false,
      outlineWidth: 2,
      outlineColor: Cesium.Color.fromCssColorString('#000000FF'),
      backgroundColor: Cesium.Color.fromCssColorString('#000000FF'),
      eyeOffset:new Cesium.Cartesian3(0,0,-5),
      // backgroundPadding : new Cesium.Cartesian2(3, 3),
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        8000
      ),
    },
  });

  return entity;
}

export function createDuanMianNote(param, viewer, Cesium) {
  /**
 * 用于添加poi的icon和label的函数
 * @param {*} lon ：经度
 * @param {*} lat ：纬度
 * @param {*} name ：标签内容
 * @param {*} color ：底部圆和横线的颜色
 * @param {*} url ：icon地址
 */
  var label = viewer.entities.add({
    name: param.name,
    position: Cesium.Cartesian3.fromDegrees(param.position[0], param.position[1], param.position[2] + 10),
    // 图标
    billboard: {
      image: param.url,
     // scale:0.6,
      width: 135,
      height: 90,
      // horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        3000
      ),
    },
    label: {
      //文字标签
      text: param.text,
      font: '20px sans-serif',
     // width: 100,
      //height: 90,
       scale: 0.65,
      eyeOffset:new Cesium.Cartesian3(0,0,-5),
      fillColor :Cesium.Color.fromCssColorString("#FFFFFF"),
      style :Cesium.LabelStyle.FILL,
      outlineColor:Cesium.Color.fromCssColorString("#FFFFFF"),
      // 对齐方式(水平和竖直)
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -22),
      showBackground: false,
      //backgroundPadding:new Cesium.Cartesian2(2,2),
      backgroundColor: new Cesium.Color.fromCssColorString("#323f3a"),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        3000
      ),
    },
  });

  // 先画线后画点，防止线压盖点
  let linePositions = [];
  linePositions.push(new Cesium.Cartesian3.fromDegrees(param.position[0], param.position[1], 5));
  linePositions.push(new Cesium.Cartesian3.fromDegrees(param.position[0], param.position[1], param.position[2] + 10));
  viewer.entities.add({
    polyline: {
      positions: linePositions,
      width: 1.5,
      material: Cesium.Color.fromCssColorString("#6FCF97"),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        3000
      ),
    }
  })

  return label;
}


export function createBillboardEntity(param,viewer, Cesium) {
  var entity = viewer.entities.add({
    name: param.name,
    position: Cesium.Cartesian3.fromDegrees(param.pos.lon, param.pos.lat, param.pos.alt),
    // 图标
    billboard: {
      image: param.url,
      width: param.width,
      height: param.height,
      // horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        2000
      ),
    },  
     label: {
      //文字标签
      text: param.text,
      font: '500 30px Helvetica', // 15pt monospace
      scale: 0.5,
      style: Cesium.LabelStyle.FILL,
      fillColor: Cesium.Color.WHITE,
      lineColor: Cesium.Color.BLACK,
      pixelOffset: new Cesium.Cartesian2(0, -50), //偏移量
      showBackground: false,
      backgroundColor: new Cesium.Color(0.0, 0.0, 0.0, 0.8),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
        200,
        3000
      ),
    },
    
  });

  return entity
}
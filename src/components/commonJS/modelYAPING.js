/*
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-03-16 13:48:46
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 14:42:11
 */
import * as Cesium from 'cesium'
import { DAYANTA3DTILES } from '../commonJS/config'
// import gltfModel from '../../../public/static/gltf/Cesium_Man.glb'
export default class modelClipPlan {
  constructor(t, url) {
    this.viewer = t,
    // this.url = url ? url : null,
    this.url = '../../../public/static/gltf/Cesium_Man.glb',
    this.coordiatesArr = [],
    // this.options = i || {},
    // this._positions = i.positions,
    // this._height = this.options.height || 0,
    // this.bottomImg = i.bottomImg,
    // this.wallImg = i.wallImg,
    // this.splitNum = Cesium.defaultValue(i.splitNum, 50),
    // this._positions && this._positions.length > 0 && this.updateData(this._positions),
    // this._show = null
    
    this.modelArr = []
    this.tilesetModel = null
    // this.addGlbCollection(this.viewer)
    this.modelClipPlan(this.viewer)
  }

  /* 批量处理gltf或glb格式模型 */
  getModelPostInstances(data) {
    var modelPosts = []

    for (var y = 0; y < data.length; ++y) {
      var longitude = data[y].longitude
      var latitude = data[y].latitude
      var height = data[y].height

      var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)

      var heading = Math.random()
      var pitch = Math.random()
      var roll = Math.random()
      // var scale = ((Math.random() + 1.0) / 4.0) * 100
      var scale = 10000
      var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, new Cesium.HeadingPitchRoll(heading, pitch, roll))

      Cesium.Matrix4.multiplyByUniformScale(modelMatrix, scale, modelMatrix)

      modelPosts.push({
        modelMatrix: modelMatrix
      })
    }

    return modelPosts
  };

  /* 加载gltf或glb格式模型 */
  addGlbCollection(viewer) {
    for (let i = 0; i < 1; i++) {
      var longitude = 113.05914487576968 // [124.25,150)
      var latitude = 22.67106595138396
      var height = 5000
      var ccord = { longitude, latitude, height }
      this.coordiatesArr.push(ccord)
    }
    console.log(this.coordiatesArr)
    var modelInstances = this.getModelPostInstances(this.coordiatesArr)

    var instanceCollection = viewer.scene.primitives.add(
      new Cesium.ModelInstanceCollection({
        url: this.url,

        instances: modelInstances
      })
    )
    console.log(instanceCollection)
  };

  modelClipPlan(viewer) {
    // 加载地形
    // var terrainProvider = new Cesium.CesiumTerrainProvider({
    //   url: 'https://assets.agi.com/stk-terrain/world'
    // })
    // viewer.terrainProvider = terrainProvider

    // 加载模型
    // const translation = Cesium.Cartesian3.fromArray([0, 0, 0])
    // const m = Cesium.Matrix4.fromTranslation(translation)
    // const tilesetJson = {
    //   url: DAYANTA3DTILES,
    //   modelMatrix: m,
    //   // show: true, // 是否显示图块集(默认true)
    //   skipLevelOfDetail: true, // --- 优化选项。确定是否应在遍历期间应用详细级别跳过(默认false)
    //   baseScreenSpaceError: 1024, // --- When skipLevelOfDetailis true，在跳过详细级别之前必须达到的屏幕空间错误(默认1024)
    //   maximumScreenSpaceError: 32, // 数值加大，能让最终成像变模糊---用于驱动细节细化级别的最大屏幕空间误差(默认16)原128
    //   skipScreenSpaceErrorFactor: 16, // --- 何时skipLevelOfDetail是true，定义要跳过的最小屏幕空间错误的乘数。与 一起使用skipLevels来确定要加载哪些图块(默认16)
    //   skipLevels: 1, // --- WhenskipLevelOfDetail是true一个常量，定义了加载图块时要跳过的最小级别数。为 0 时，不跳过任何级别。与 一起使用skipScreenSpaceErrorFactor来确定要加载哪些图块。(默认1)
    //   immediatelyLoadDesiredLevelOfDetail: false, // --- 当skipLevelOfDetail是时true，只会下载满足最大屏幕空间错误的图块。忽略跳过因素，只加载所需的图块(默认false)
    //   loadSiblings: false, // 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋 --- 何时确定在遍历期间skipLevelOfDetail是否true始终下载可见瓦片的兄弟姐妹(默认false)
    //   cullWithChildrenBounds: false, // ---优化选项。是否使用子边界体积的并集来剔除瓦片（默认true）
    //   cullRequestsWhileMoving: false, // ---优化选项。不要请求由于相机移动而在返回时可能未使用的图块。这种优化只适用于静止的瓦片集(默认true)
    //   cullRequestsWhileMovingMultiplier: 10, // 值越小能够更快的剔除 ---优化选项。移动时用于剔除请求的乘数。较大的是更积极的剔除，较小的较不积极的剔除(默认60)原10
    //   preloadWhenHidden: true, // ---tileset.show时 预加载瓷砖false。加载图块，就好像图块集可见但不渲染它们(默认false)
    //   preloadFlightDestinations: true, // ---优化选项。在相机飞行时在相机的飞行目的地预加载图块(默认true)
    //   preferLeaves: true, // ---优化选项。最好先装载叶子(默认false)
    //   maximumMemoryUsage: 2048, // 内存分配变小有利于倾斜摄影数据回收，提升性能体验---瓦片集可以使用的最大内存量（以 MB 为单位）(默认512)原512 4096
    //   progressiveResolutionHeightFraction: 0.5, // 数值偏于0能够让初始加载变得模糊 --- 这有助于在继续加载全分辨率图块的同时快速放下图块层(默认0.3)
    //   dynamicScreenSpaceErrorDensity: 10, // 数值加大，能让周边加载变快 --- 用于调整动态屏幕空间误差的密度，类似于雾密度(默认0.00278)
    //   dynamicScreenSpaceErrorFactor: 1, // 不知道起了什么作用没，反正放着吧先 --- 用于增加计算的动态屏幕空间误差的因素(默认4.0)
    //   dynamicScreenSpaceErrorHeightFalloff: 0.25, // --- 密度开始下降的瓦片集高度的比率(默认0.25)
    //   foveatedScreenSpaceError: true, // --- 优化选项。通过暂时提高屏幕边缘周围图块的屏幕空间错误，优先加载屏幕中心的图块。一旦Cesium3DTileset#foveatedConeSize加载确定的屏幕中心的所有图块，屏幕空间错误就会恢复正常。(默认true)
    //   foveatedConeSize: 0.1, // --- 优化选项。当Cesium3DTileset#foveatedScreenSpaceError为 true 时使用来控制决定延迟哪些图块的锥体大小。立即加载此圆锥内的瓷砖。圆锥外的瓷砖可能会根据它们在圆锥外的距离及其屏幕空间误差而延迟。这是由Cesium3DTileset#foveatedInterpolationCallback和控制的Cesium3DTileset#foveatedMinimumScreenSpaceErrorRelaxation。将此设置为 0.0 意味着圆锥将是由相机位置及其视图方向形成的线。将此设置为 1.0 意味着锥体包含相机的整个视野,禁用效果(默认0.1)
    //   foveatedMinimumScreenSpaceErrorRelaxation: 0.0, // --- 优化选项。当Cesium3DTileset#foveatedScreenSpaceError为 true 时使用以控制中央凹锥之外的图块的起始屏幕空间误差松弛。屏幕空间错误将从 tileset 值开始Cesium3DTileset#maximumScreenSpaceError根据提供的Cesium3DTileset#foveatedInterpolationCallback.(默认0.0)
    //   // foveatedTimeDelay: 0.2, // ---优化选项。使用 whenCesium3DTileset#foveatedScreenSpaceError为 true 来控制在相机停止移动后延迟瓷砖开始加载之前等待的时间（以秒为单位）。此时间延迟可防止在相机移动时请求屏幕边缘周围的瓷砖。将此设置为 0.0 将立即请求任何给定视图中的所有图块。(默认0.2)
    //   luminanceAtZenith: 0.2, // --- 用于此模型的程序环境贴图的天顶处的太阳亮度（以千坎德拉每平方米为单位）(默认0.2)
    //   backFaceCulling: true, // --- 是否剔除背面几何体。当为 true 时，背面剔除由 glTF 材质的 doubleSided 属性确定；如果为 false，则禁用背面剔除(默认true)
    //   debugFreezeFrame: false, // --- 仅用于调试。确定是否应仅使用最后一帧的图块进行渲染(默认false)
    //   debugColorizeTiles: false, // --- 仅用于调试。如果为 true，则为每个图块分配随机颜色(默认false)
    //   debugWireframe: false, // --- 仅用于调试。如果为 true，则将每个图块的内容渲染为线框(默认false)
    //   debugShowBoundingVolume: false, // --- 仅用于调试。如果为 true，则为每个图块渲染边界体积(默认false)
    //   debugShowContentBoundingVolume: false, // --- 仅用于调试。如果为 true，则为每个图块的内容渲染边界体积(默认false)
    //   debugShowViewerRequestVolume: false, // --- 仅用于调试。如果为 true，则呈现每个图块的查看器请求量(默认false)
    //   debugShowGeometricError: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的几何误差(默认false)
    //   debugShowRenderingStatistics: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的命令、点、三角形和特征的数量(默认false)
    //   debugShowMemoryUsage: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块使用的纹理和几何内存（以兆字节为单位）(默认false)
    //   debugShowUrl: false, // --- 仅用于调试。如果为 true，则绘制标签以指示每个图块的 url(默认false)
    //   dynamicScreenSpaceError: true // 根据测试，有了这个后，会在真正的全屏加载完之后才清晰化房屋 --- 优化选项。减少距离相机较远的图块的屏幕空间错误(默认false)
    // }
    // var model = new Cesium.Cesium3DTileset(tilesetJson)

    viewer.scene.globe.depthTestAgainstTerrain = true
    const n = 'modelPos.z'
    const o = '#define CUSTOM_MVP'
    this.tilesetModel = new Cesium.Cesium3DTileset({
      url: DAYANTA3DTILES,
      minimumPixelSize: 128,
      customShader: new Cesium.CustomShader({
        vertexShaderText: o + `
  
                  uniform sampler2D u_polygonFlatTexture;
                  uniform sampler2D u_matrixTexture;
                  uniform bool u_flat;
                  uniform vec4 u_rectBound;
                  uniform float u_singleGridSize;
                  uniform float u_rowWidth;
                  uniform float u_rowLen;
                  #ifdef CUSTOM_MVP
                      uniform mat4 u_woldMat;
                      uniform mat4 u_mvMat;
                      uniform float u_height;
                  #endif
                  
                  bool isPointInPolygon( vec2 start ,vec2 end, vec2 test){
                      if ( ((start.y > test.y) != (end.y > test.y)) &&
                          (test.x < ((end.x-start.x) * (test.y-start.y) / (end.y-start.y) + start.x)) )
                          return true;
                      return  false;
                  }
                  
                  bool isInRect(vec2 minval,vec2 maxval,vec2 test){
                  
                      return test.x > minval.x && test.x < maxval.x && test.y > minval.y && test.y <maxval.y;
                  }
                  
                  mat4 getInvWordMatrix(vec2 matUV , float matUVY){
                      vec4 row1 = texture2D(u_matrixTexture, vec2(matUV.x * 1.0, matUVY));
                      vec4 row2 = texture2D(u_matrixTexture, vec2(matUV.x * 2.0, matUVY));
                      vec4 row3 = texture2D(u_matrixTexture, vec2(matUV.x * 3.0, matUVY));
                      vec4 row4 = texture2D(u_matrixTexture, vec2(matUV.x * 4.0, matUVY));
                  
                      return mat4(row1,row2,row3,row4);
                  }
                  
                  // \u81EA\u5B9A\u4E49\u7684\u9876\u70B9\u7740\u8272 \u9700\u8981\u5728geometry\u7740\u8272\u4E4B\u540E\u4FEE\u6539glPosition
                  void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
                      vec4 modelPos = vec4(vsInput.attributes.positionMC.xyz, 1.0);
                      vec2 matUV = vec2(0.25, u_rowWidth);
                      for(int i = 0 ; i < 100; i++){
                          if(int(u_rowLen) === i)break;
                          bool flatStatus = false;
                          float matUVY = matUV.y * float(i);
                          vec4 row0 = texture2D(u_matrixTexture, vec2(0.0, matUVY ));
                          if(row0.w < 0.0)continue;
                          if(!u_flat&&modelPos.z < row0.z)continue;
                          mat4 invWordMatrix = getInvWordMatrix(matUV , matUVY);
                          vec4 localpos;
                          #ifdef CUSTOM_MVP
                              row0.z = row0.z + u_height;
                              localpos = u_mvMat * modelPos;
                              localpos = czm_inverseView * localpos;
                              localpos = invWordMatrix * localpos;
                              if(!u_flat&&localpos.z < row0.z)continue;
                          #else
                              localpos = invWordMatrix * czm_model * modelPos;
                              if(!u_flat&&modelPos.z < row0.z)continue;
                          #endif
                          if(!isInRect( vec2(u_rectBound.xy), vec2(u_rectBound.zw) , localpos.xy ))break;
                          int len = int(row0.y);
                          int jj = len - 1;
                          for(int ii = 0 ; ii < 100; ii++){
                              if(ii >= len )break;
                              vec2 start = texture2D (u_polygonFlatTexture, vec2(float(ii) * u_singleGridSize, matUVY)).st;
                              vec2 end = texture2D( u_polygonFlatTexture, vec2(float(jj) * u_singleGridSize, matUVY)).st;
                              if(isPointInPolygon(start, end, localpos.xy)){
                                  flatStatus = !flatStatus;
                              }
                              jj = ii;
                          }
                          if(flatStatus){
                              vec4 position;
                              #ifdef CUSTOM_MVP
                                  localpos.z = row0.z + localpos.z / 10000.0;
                                  localpos = u_woldMat * localpos;
                                  position = czm_view * localpos;
                              #else
                                  ` + n + ` = row0.z + localpos.z / 5000.0;  // modelPos.y / z
                                  position = czm_modelView * modelPos;
                              #endif
                              // gl_Position = czm_projection * position;
                              // break;
                              vsOutput.positionMC = modelPos.xyz;
                          }
                      }
                  }`
      }),
      enableModelExperimental: true

    })
    viewer.scene.primitives.add(this.tilesetModel)
    // this.tilesetModel.readyPromise.then(function (argument) {
    //   const heightOffset = 0 // 调整倾斜摄影高度，防止飘和进入地下
    //   const boundingSphere = this.tilesetModel.boundingSphere
    //   const cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center)
    //   const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0)
    //   const offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset)
    //   const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3())
    //   this.tilesetModel.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
    //   viewer.scene.primitives.add(this.tilesetModel)
    //   this.modelArr.push(this.tilesetModel)
    // })

    // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    //   Cesium.Cartesian3.fromDegrees(113.05914487576968, 22.67106595138396, 100.0))
    // var model = this.viewer.scene.primitives.add(Cesium.Model.fromGltf({
    //   url: this.url,
    //   modelMatrix: modelMatrix,
    //   scale: 200.0
    // }))

    // // 获取模型包围盒
    // var boundingSphere = model.boundingSphere
    // var center = boundingSphere.center
    // var radius = boundingSphere.radius

    // // 计算模型包围盒的四个角点坐标
    // var positions = []
    // positions.push(center.x - radius, center.y - radius, center.z)
    // positions.push(center.x + radius, center.y - radius, center.z)
    // positions.push(center.x + radius, center.y + radius, center.z)
    // positions.push(center.x - radius, center.y + radius, center.z)

    // // 将四个角点坐标转换为经纬度高程坐标
    // var cartographicPositions = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions)

    // // 采样地形高程数据
    // Cesium.when(Cesium.sampleTerrainMostDetailed(this.viewer.scene.terrainProvider, cartographicPositions), function (updatedPositions) {
    // // 更新模型矩阵，使其贴合地形
    //   var height = updatedPositions[0].height
    //   var translation = Cesium.Cartesian3.fromRadians(updatedPositions[0].longitude,
    //     updatedPositions[0].latitude, height)
    //   var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(90)))
    //   var rotationY = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(-90)))
    //   var m = Cesium.Matrix4.multiply(rotationX, rotationY, new Cesium.Matrix4())
    //   model.modelMatrix = Cesium.Matrix4.multiplyByTranslation(m, translation, new Cesium.Matrix4())
    // })
  }
}

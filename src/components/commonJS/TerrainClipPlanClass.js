/*
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-03-11 15:57:45
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-11 14:43:03
 */
import * as Cesium from 'cesium'
export default class TerrainClipPlan {
  constructor(t, i) {
    this.viewer = t,
    this.options = i || {},
    this._positions = i.positions,
    this._height = this.options.height || 0,
    this.bottomImg = i.bottomImg,
    this.wallImg = i.wallImg,
    this.splitNum = Cesium.defaultValue(i.splitNum, 50),
    this._positions && this._positions.length > 0 && this.updateData(this._positions),
    this._show = null
  }

  get show() {
    return this._show
  }

  set show(e) {
    this._show = e,
    this.viewer.scene.globe.clippingPlanes && (this.viewer.scene.globe.clippingPlanes.enabled = e), this._switchExcavate(e)
  }

  get height() {
    return this._height
  }

  set height(e) {
    this._height = e, this._updateExcavateDepth(e)
  }

  updateData(e) {
    this.clear()
    var t = []
    var i = e.length
    var a = new Cesium.Cartesian3()
    var n = Cesium.Cartesian3.subtract(e[0], e[1], a)
    n = n.x > 0, this.excavateMinHeight = 9999
    for (var r = 0; r < i - 1; ++r) {
      var s = (r + 1) % i
      var u = Cesium.Cartographic.fromCartesian(e[r])
      var c = this.viewer.scene.globe.getHeight(u) || u.height
      c < this.excavateMinHeight && (this.excavateMinHeight = c)

      var midpoint = Cesium.Cartesian3.add(e[r], e[s], new Cesium.Cartesian3())
      midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint)

      var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3())
      var right = Cesium.Cartesian3.subtract(e[s], midpoint, new Cesium.Cartesian3())
      right = Cesium.Cartesian3.normalize(right, right)

      var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3())
      normal = Cesium.Cartesian3.normalize(normal, normal)

      var originCenteredPlane = new Cesium.Plane(normal, 0.0)
      var distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint)

      t.push(new Cesium.ClippingPlane(normal, distance))
    }
    this.viewer.scene.globe.depthTestAgainstTerrain = false
    this.viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: t,
      edgeWidth: 1,
      edgeColor: Cesium.Color.WHITE,
      enabled: !0
    }), this._prepareWell(e), this._createWell(this.wellData)
  }

  clear() {
    // 先还原depthTestAgainstTerrain
    // this.viewer.scene.globe.depthTestAgainstTerrain = true
    this.viewer.scene.globe.clippingPlanes && (this.viewer.scene.globe.clippingPlanes.enabled = !1, this.viewer.scene.globe.clippingPlanes.removeAll(), this.viewer.scene.globe.clippingPlanes.isDestroyed() || this.viewer.scene.globe.clippingPlanes.destroy()), this.viewer.scene.globe.clippingPlanes = void 0, this.bottomSurface && this.viewer.scene.primitives.remove(this.bottomSurface), this.wellWall && this.viewer.scene.primitives.remove(this.wellWall), delete this.bottomSurface, delete this.wellWall, this.viewer.scene.render()
  }

  _prepareWell(e) {
    var t = this.splitNum
    var i = e.length
    if (i != 0) {
      for (var a = this.excavateMinHeight - this.height, n = [], r = [], s = [], l = 0; l < i; l++) {
        var u = l === i - 1 ? 0 : l + 1
        var c = Cesium.Cartographic.fromCartesian(e[l])
        var d = Cesium.Cartographic.fromCartesian(e[u])
        var h = [c.longitude, c.latitude]
        var f = [d.longitude, d.latitude]

        l === 0 && (
          s.push(new Cesium.Cartographic(h[0], h[1])),
          r.push(Cesium.Cartesian3.fromRadians(h[0], h[1], a)),
          n.push(Cesium.Cartesian3.fromRadians(h[0], h[1], 0)))

        for (var p = 1; p <= t; p++) {
          var m = Cesium.Math.lerp(h[0], f[0], p / t)
          var g = Cesium.Math.lerp(h[1], f[1], p / t)
          l === i - 1 && p === t || (
            s.push(new Cesium.Cartographic(m, g)),
            r.push(Cesium.Cartesian3.fromRadians(m, g, a)),
            n.push(Cesium.Cartesian3.fromRadians(m, g, 0)))
        }
      }
      this.wellData = {
        lerp_pos: s,
        bottom_pos: r,
        no_height_top: n
      }
    }
  }

  // _createWell(e) {
  //   if (this.viewer.terrainProvider._layers) {
  //     var t = this
  //     this._createBottomSurface(e.bottom_pos)
  //     var i = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, e.lerp_pos)
  //     Cesium.when(i, function (i) {
  //       for (var a = i.length, n = [], r = 0; r < a; r++) {
  //         var s = Cesium.Cartesian3.fromRadians(i[r].longitude, i[r].latitude, i[r].height)
  //         n.push(s)
  //       }
  //       t._createWellWall(e.bottom_pos, n)
  //     })
  //   } else {
  //     this._createBottomSurface(e.bottom_pos)
  //     this._createWellWall(e.bottom_pos, e.no_height_top)
  //   }
  // }

  _createWell(e) {
    const deferred = Cesium.defer()
    if (this.viewer.terrainProvider._layers) {
      var t = this
      this._createBottomSurface(e.bottom_pos)
      var i = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, e.lerp_pos)
      // Cesium.when(i, function (i) {
      //   for (var a = i.length, n = [], r = 0; r < a; r++) {
      //     var s = Cesium.Cartesian3.fromRadians(i[r].longitude, i[r].latitude, i[r].height)
      //     n.push(s)
      //   }
      //   t._createWellWall(e.bottom_pos, n)
      // })
      Promise.resolve(i).then(function (i) {
        for (var a = i.length, n = [], r = 0; r < a; r++) {
          var s = Cesium.Cartesian3.fromRadians(i[r].longitude, i[r].latitude, i[r].height)
          n.push(s)
        }
        t._createWellWall(e.bottom_pos, n)
      })
    } else {
      this._createBottomSurface(e.bottom_pos)
      this._createWellWall(e.bottom_pos, e.no_height_top)
    }
  }

  _getMinHeight(e) {
    let minHeight = 5000000
    let minPoint = null
    for (let i = 0; i < e.length; i++) {
      const height = e[i].z
      if (height < minHeight) {
        minHeight = height
        minPoint = this._ellipsoidToLonLat(e[i])
      }
    }
    return minPoint.altitude
  }

  _ellipsoidToLonLat(c) {
    const ellipsoid = this.viewer.scene.globe.ellipsoid
    const cartesian3 = new Cesium.Cartesian3(c.x, c.y, c.z)
    const cartographic = ellipsoid.cartesianToCartographic(cartesian3)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)
    const lng = Cesium.Math.toDegrees(cartographic.longitude)
    const alt = cartographic.height
    return {
      longitude: lng,
      latitude: lat,
      altitude: alt
    }
  }

  _createBottomSurface(e) {
    if (e.length) {
      const minHeight = this._getMinHeight(e)
      const positions = []
      for (let i = 0; i < e.length; i++) {
        const p = this._ellipsoidToLonLat(e[i])
        positions.push(p.longitude)
        positions.push(p.latitude)
        positions.push(minHeight)
      }

      const polygon = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArrayHeights(positions)
        ),
        perPositionHeight: true,
        closeBottom: false
      })
      const geometry = Cesium.PolygonGeometry.createGeometry(polygon)

      var i = new Cesium.Material({
        fabric: {
          type: 'Image',
          uniforms: {
            image: this.bottomImg
          }
        }
      })
      var a = new Cesium.MaterialAppearance({
        translucent: !1,
        flat: !0,
        material: i
      })
      this.bottomSurface = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: geometry
        }),
        appearance: a,
        asynchronous: !1
      }), this.viewer.scene.primitives.add(this.bottomSurface)
    }
  }

  _createWellWall(e, t) {
    const minHeight = this._getMinHeight(e)
    const maxHeights = []
    const minHeights = []
    for (let i = 0; i < t.length; i++) {
      maxHeights.push(this._ellipsoidToLonLat(t[i]).altitude)
      minHeights.push(minHeight)
    }
    const wall = new Cesium.WallGeometry({
      positions: t,
      maximumHeights: maxHeights,
      minimumHeights: minHeights
    })
    const geometry = Cesium.WallGeometry.createGeometry(wall)
    var a = new Cesium.Material({
      fabric: {
        type: 'Image',
        uniforms: {
          image: this.wallImg
        }
      }
    //   fabric: {
    //     type: 'Color',
    //     uniforms: {
    //       color: new Cesium.Color(1.0, 0.0, 0.0, 1.0)
    //     }
    //   }
    })
    var n = new Cesium.MaterialAppearance({
      translucent: !1,
      flat: !0,
      material: a
    })
    this.wellWall = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREY)
        },
        id: 'PitWall'
      }),
      appearance: n,
      asynchronous: !1
    }), this.viewer.scene.primitives.add(this.wellWall)
  }

  _switchExcavate(e) {
    e ? (this.viewer.scene.globe.material = Cesium.Material.fromType('WaJue'), this.wellWall.show = !0, this.bottomSurface.show = !0) : (this.viewer.scene.globe.material = null, this.wellWall.show = !1, this.bottomSurface.show = !1)
  }

  _updateExcavateDepth(e) {
    this.bottomSurface && this.viewer.scene.primitives.remove(this.bottomSurface), this.wellWall && this.viewer.scene.primitives.remove(this.wellWall)
    for (var t = this.wellData.lerp_pos, i = [], a = t.length, n = 0; n < a; n++) i.push(Cesium.Cartesian3.fromRadians(t[n].longitude, t[n].latitude, this.excavateMinHeight - e))
    this.wellData.bottom_pos = i, this._createWell(this.wellData), this.viewer.scene.primitives.add(this.bottomSurface), this.viewer.scene.primitives.add(this.wellWall)
  }

  aJ(e = !1, t = !1) {
    let n = 'modelPos.z'
    let o = ''
    return e && (n = 'modelPos.y'),
    t && (o = '#define CUSTOM_MVP'),
    new Cesium.CustomShader({
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
    })
  }
}

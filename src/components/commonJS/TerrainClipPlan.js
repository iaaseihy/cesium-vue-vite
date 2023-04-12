import * as Cesium from 'cesium'

function TerrainClipPlan(t, i) {
  this.viewer = t,
  this.options = i || {},
  this._positions = i.positions,
  this._height = this.options.height || 0,
  this.bottomImg = i.bottomImg,
  this.wallImg = i.wallImg,
  this.splitNum = Cesium.defaultValue(i.splitNum, 50),
  this._positions && this._positions.length > 0 && this.updateData(this._positions)
}

Object.defineProperties(TerrainClipPlan.prototype, {
  show: {
    get: function () {
      return this._show
    },
    set: function (e) {
      this._show = e, this.viewer.scene.globe.clippingPlanes && (this.viewer.scene.globe.clippingPlanes.enabled = e), this._switchExcavate(e)
    }
  },

  height: {
    get: function () {
      return this._height
    },
    set: function (e) {
      this._height = e, this._updateExcavateDepth(e)
    }
  }
})

TerrainClipPlan.prototype.updateData = function (e) {
  this.clear()
  var t = []// 存储ClippingPlane集合
  var i = e.length
  var a = new Cesium.Cartesian3()
  var n = Cesium.Cartesian3.subtract(e[0], e[1], a)
  n = n.x > 0, this.excavateMinHeight = 9999
  for (var r = 0; r < i; ++r) {
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
  this.viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
    planes: t,
    edgeWidth: 1,
    edgeColor: Cesium.Color.WHITE,
    enabled: !0
  }), this._prepareWell(e), this._createWell(this.wellData)
}

TerrainClipPlan.prototype.clear = function () {
  // 先还原depthTestAgainstTerrain
  // this.viewer.scene.globe.depthTestAgainstTerrain = true
  this.viewer.scene.globe.clippingPlanes && (this.viewer.scene.globe.clippingPlanes.enabled = !1, this.viewer.scene.globe.clippingPlanes.removeAll(), this.viewer.scene.globe.clippingPlanes.isDestroyed() || this.viewer.scene.globe.clippingPlanes.destroy()), this.viewer.scene.globe.clippingPlanes = void 0, this.bottomSurface && this.viewer.scene.primitives.remove(this.bottomSurface), this.wellWall && this.viewer.scene.primitives.remove(this.wellWall), delete this.bottomSurface, delete this.wellWall, this.viewer.scene.render()
}

TerrainClipPlan.prototype._prepareWell = function (e) {
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

TerrainClipPlan.prototype._createWell = function (e) {
  if (this.viewer.terrainProvider._layers) {
    var t = this
    this._createBottomSurface(e.bottom_pos)
    var i = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, e.lerp_pos)
    Cesium.when(i, function (i) {
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

TerrainClipPlan.prototype._getMinHeight = function (e) {
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

TerrainClipPlan.prototype._ellipsoidToLonLat = function (c) {
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
TerrainClipPlan.prototype._createBottomSurface = function (e) {
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

TerrainClipPlan.prototype._createWellWall = function (e, t) {
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
TerrainClipPlan.prototype._switchExcavate = function (e) {
  e ? (this.viewer.scene.globe.material = Cesium.Material.fromType('WaJue'), this.wellWall.show = !0, this.bottomSurface.show = !0) : (this.viewer.scene.globe.material = null, this.wellWall.show = !1, this.bottomSurface.show = !1)
}

TerrainClipPlan.prototype._updateExcavateDepth = function (e) {
  this.bottomSurface && this.viewer.scene.primitives.remove(this.bottomSurface), this.wellWall && this.viewer.scene.primitives.remove(this.wellWall)
  for (var t = this.wellData.lerp_pos, i = [], a = t.length, n = 0; n < a; n++) i.push(Cesium.Cartesian3.fromRadians(t[n].longitude, t[n].latitude, this.excavateMinHeight - e))
  this.wellData.bottom_pos = i, this._createWell(this.wellData), this.viewer.scene.primitives.add(this.bottomSurface), this.viewer.scene.primitives.add(this.wellWall)
}

export default TerrainClipPlan

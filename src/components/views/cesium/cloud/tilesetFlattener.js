/**
 * @Description: 倾斜模型压平工具类（移植自 history-and-cultural-protection 项目）
 * 使用 CustomShader 在顶点着色器中对指定区域内的顶点进行压平处理
 * @Author: 笙痞
 */

import * as Cesium from "cesium";

class TilesetFlattener {
  constructor(viewer, tileset) {
    this.viewer = viewer;
    this.tileset = tileset;
    this.originalCustomShader = null;
    this.flattenPolygon = null;
    this.flattenHeight = 0;
    this.isFlattened = false;
  }

  /**
   * 拾取屏幕坐标对应的三维坐标
   */
  pickPosition(screenPosition) {
    if (!this.viewer) return null;
    let position = null;
    try {
      const picks = this.viewer.scene.drillPick(screenPosition, 10);
      let isOn3DTiles = false;
      for (let i in picks) {
        let pick = picks[i];
        if (
          (pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) ||
          (pick && pick.primitive instanceof Cesium.Cesium3DTileset) ||
          (pick && pick.primitive instanceof Cesium.Model)
        ) {
          isOn3DTiles = true;
          break;
        }
      }
      if (isOn3DTiles) {
        this.viewer.scene.pick(screenPosition);
        position = this.viewer.scene.pickPosition(screenPosition);
        if (position) {
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          if (cartographic.height < 0) cartographic.height = 0;
          return position;
        }
      }
      const isEllipsoidTerrain =
        this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider;
      if (!isEllipsoidTerrain) {
        const ray = this.viewer.camera.getPickRay(screenPosition);
        if (ray) {
          position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        }
      } else {
        position = this.viewer.scene.camera.pickEllipsoid(
          screenPosition,
          this.viewer.scene.globe.ellipsoid
        );
      }
      if (position) {
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        if (cartographic.height < -1000) cartographic.height = 10;
        else if (cartographic.height > 10000) cartographic.height = 100;
        else if (cartographic.height < 0) cartographic.height = 0.1;
        position = Cesium.Cartographic.toCartesian(cartographic);
      }
      if (!position) {
        const ray = this.viewer.camera.getPickRay(screenPosition);
        if (ray) {
          position = Cesium.Ray.getPoint(ray, 100);
        } else {
          position = this.viewer.camera.position;
        }
      }
    } catch (error) {
      console.error("坐标拾取过程中发生异常:", error);
      position = this.viewer.camera.position;
    }
    return position;
  }

  /**
   * 设置压平区域
   */
  setFlattenArea(positions) {
    if (!positions || positions.length < 3) return false;
    this.flattenPolygon = positions;
    return true;
  }

  /**
   * 计算局部坐标系参数
   */
  _computeLocalParams(positions) {
    // 1. 计算中心点
    const center = new Cesium.Cartesian3();
    let count = 0;
    positions.forEach((p) => {
      Cesium.Cartesian3.add(center, p, center);
      count++;
    });
    Cesium.Cartesian3.divideByScalar(center, count, center);

    // 2. 计算该中心点的精确对地参数
    const centerCartographic = Cesium.Cartographic.fromCartesian(center);
    const centerRadius = Cesium.Cartesian3.magnitude(center);
    const localEarthRadius = centerRadius - centerCartographic.height;

    // 3. 构建ENU坐标系
    const up = Cesium.Cartesian3.normalize(center, new Cesium.Cartesian3());
    const northPole = new Cesium.Cartesian3(0, 0, 1);
    let east = Cesium.Cartesian3.cross(
      northPole,
      up,
      new Cesium.Cartesian3()
    );
    if (Cesium.Cartesian3.magnitude(east) < 1e-6)
      east = new Cesium.Cartesian3(1, 0, 0);
    Cesium.Cartesian3.normalize(east, east);
    const north = Cesium.Cartesian3.cross(
      up,
      east,
      new Cesium.Cartesian3()
    );
    Cesium.Cartesian3.normalize(north, north);

    // 4. 计算边界
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    positions.forEach((p) => {
      const diff = Cesium.Cartesian3.subtract(
        p,
        center,
        new Cesium.Cartesian3()
      );
      const x = Cesium.Cartesian3.dot(diff, east);
      const y = Cesium.Cartesian3.dot(diff, north);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    return {
      center,
      east,
      north,
      bounds: { minX, maxX, minY, maxY },
      localEarthRadius,
    };
  }

  /**
   * 应用压平
   */
  applyFlatten(height) {
    if (!this.flattenPolygon || this.flattenPolygon.length < 3) {
      console.warn("请先绘制压平区域");
      return false;
    }
    this.flattenHeight = height;

    try {
      // 只有在没有原始 shader 的时候才保存
      if (this.originalCustomShader === null) {
        this.originalCustomShader = this.tileset.customShader || undefined;
      }

      const params = this._computeLocalParams(this.flattenPolygon);
      const { center, east, north, bounds, localEarthRadius } = params;

      const customShader = new Cesium.CustomShader({
        uniforms: {
          u_flattenHeight: {
            type: Cesium.UniformType.FLOAT,
            value: height,
          },
          u_center: { type: Cesium.UniformType.VEC3, value: center },
          u_east: { type: Cesium.UniformType.VEC3, value: east },
          u_north: { type: Cesium.UniformType.VEC3, value: north },
          u_minX: {
            type: Cesium.UniformType.FLOAT,
            value: bounds.minX,
          },
          u_maxX: {
            type: Cesium.UniformType.FLOAT,
            value: bounds.maxX,
          },
          u_minY: {
            type: Cesium.UniformType.FLOAT,
            value: bounds.minY,
          },
          u_maxY: {
            type: Cesium.UniformType.FLOAT,
            value: bounds.maxY,
          },
          u_earthRadius: {
            type: Cesium.UniformType.FLOAT,
            value: localEarthRadius,
          },
        },
        vertexShaderText: `
          void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
              vec4 positionWC = czm_model * vec4(vsInput.attributes.positionMC, 1.0);
              vec3 offset = positionWC.xyz - u_center;

              float x = dot(offset, u_east);
              float y = dot(offset, u_north);

              bool inBounds = x >= u_minX && x <= u_maxX && y >= u_minY && y <= u_maxY;

              if (inBounds) {
                  vec3 ellipsoidNormal = normalize(positionWC.xyz);
                  float targetRadius = u_earthRadius + u_flattenHeight;
                  vec3 newPositionWC = ellipsoidNormal * targetRadius;
                  vsOutput.positionMC = (czm_inverseModel * vec4(newPositionWC, 1.0)).xyz;
              }
          }
        `,
      });

      this.tileset.customShader = customShader;
      this.isFlattened = true;
      return true;
    } catch (error) {
      console.error("[压平] 出错:", error);
      return false;
    }
  }

  /**
   * 恢复原状
   */
  restore() {
    if (this.tileset) {
      this.tileset.customShader = this.originalCustomShader;
      this.isFlattened = false;
      return true;
    }
    return false;
  }

  clearArea() {
    this.flattenPolygon = null;
    this.flattenHeight = 0;
  }

  getModelHeight() {
    if (!this.tileset || !this.tileset.boundingSphere) return 0;
    return Cesium.Cartographic.fromCartesian(
      this.tileset.boundingSphere.center
    ).height;
  }

  destroy() {
    this.restore();
    this.flattenPolygon = null;
    this.originalCustomShader = null;
    this.viewer = null;
    this.tileset = null;
  }
}

export default TilesetFlattener;

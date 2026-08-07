/**
 * @Description: 倾斜模型压平工具类 —— 使用射线法点在多边形内判断（精确压平）
 * 移植自 history-and-cultural-protection 项目的 TilesetPlanish.ts
 * 在顶点着色器中将多边形区域内的顶点Z值设为指定高度
 */
import * as Cesium from "cesium";

class TilesetPlanish {
  constructor(tileset) {
    this._tileset = tileset;

    // 以模型包围盒中心建立 ENU 局部坐标系
    const center = tileset.boundingSphere.center.clone();
    this._matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    this._localMatrix = Cesium.Matrix4.inverse(this._matrix, new Cesium.Matrix4());

    this._polygonEdits = [];
    this._originalShader = tileset.customShader || undefined;

    console.log("[TilesetPlanish] 初始化完成，模型中心:", center);
  }

  /**
   * 添加压平区域数据
   * @param {string} uuid 压平区域唯一标识
   * @param {Array<Cesium.Cartesian3>} area 世界坐标点数组
   * @param {number} height 压平高度（局部坐标系下的Z值，默认0）
   */
  addRegionEditsData(uuid, area, height = 0.0) {
    // 去重
    for (let p = 0; p < this._polygonEdits.length; p++) {
      if (this._polygonEdits[p].uuid === uuid) return;
    }
    if (!area || area.length === 0) return;

    const localPolygon = this.cartesiansToLocal(area);
    console.log("[TilesetPlanish] 添加压平区域, 点数:", area.length, "高度:", height);
    console.log("[TilesetPlanish] 局部坐标范围:", {
      xMin: Math.min(...localPolygon.map(p => p[0])),
      xMax: Math.max(...localPolygon.map(p => p[0])),
      yMin: Math.min(...localPolygon.map(p => p[1])),
      yMax: Math.max(...localPolygon.map(p => p[1])),
    });

    this._polygonEdits.push({
      uuid: uuid,
      show: true,
      polygon: localPolygon,
      height: height,
    });

    this.renderShader();
  }

  /**
   * 批量添加压平区域
   */
  addRegionEditsDataArr(arr) {
    arr.forEach((element) => {
      const uuid = element.uuid;
      const height = element.height;
      const show = element.show;
      let area = [];
      if (element.area) {
        element.area.forEach((item) => {
          if (item instanceof Cesium.Cartesian3) {
            area.push(item);
          } else {
            area.push(new Cesium.Cartesian3(item.x, item.y, item.z));
          }
        });
      }

      for (let p = 0; p < this._polygonEdits.length; p++) {
        if (this._polygonEdits[p].uuid === uuid) return;
      }
      if (area.length === 0) return;

      this._polygonEdits.push({
        uuid: uuid,
        show: show,
        polygon: this.cartesiansToLocal(area),
        height: height,
      });
    });

    this.renderShader();
  }

  /**
   * 世界坐标转模型局部坐标（取 x, y 用于2D多边形判断）
   */
  cartesiansToLocal(positions) {
    let arr = [];
    for (let i = 0; i < positions.length; i++) {
      let localp = Cesium.Matrix4.multiplyByPoint(
        this._localMatrix,
        positions[i].clone(),
        new Cesium.Cartesian3()
      );
      arr.push([localp.x, localp.y]);
    }
    return arr;
  }

  /**
   * 生成着色器代码并应用
   */
  renderShader() {
    const funstr = this._getPointInPolygon(this._polygonEdits);

    let str = ``;
    this._polygonEdits.forEach((item, index) => {
      if (item.show) {
        const name = index;
        item.polygon.forEach((point, i) => {
          str += `points_${name}[${i}] = vec2(${point[0].toFixed(6)}, ${point[1].toFixed(6)});`;
        });

        str += `
          if (isPointInPolygon_${name}(position2D)) {
            float ground_z = float(${item.height.toFixed(6)});
            vec4 tileset_local_position_transformed = vec4(tileset_local_position.x, tileset_local_position.y, ground_z, 1.0);
            vec4 model_local_position_transformed = czm_inverseModel * u_tileset_localToWorldMatrix * tileset_local_position_transformed;
            vsOutput.positionMC.xyz = model_local_position_transformed.xyz;
            return;
          }\n
        `;
      }
    });

    this._updateShader(funstr, str);
  }

  /**
   * 构建判断点是否在面内的 GLSL 函数（射线法）
   */
  _getPointInPolygon(polygons) {
    let str = ``;
    polygons.forEach((item, index) => {
      if (item.show) {
        const length = item.polygon.length;
        const name = index;

        str += `
        vec2 points_${name}[${length}];
        bool isPointInPolygon_${name} (vec2 point) {
          int nCross = 0;
          const int n = ${length};
          for (int i = 0; i < n; i++) {
            vec2 p1 = points_${name}[i];
            vec2 p2 = points_${name}[int(mod(float(i+1), float(n)))];
            if (p1[1] == p2[1]) { continue; }
            if (point[1] < min(p1[1], p2[1])) { continue; }
            if (point[1] >= max(p1[1], p2[1])) { continue; }
            float x = p1[0] + ((point[1] - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]);
            if (x > point[0]) { nCross++; }
          }
          return int(mod(float(nCross), float(2))) == 1;
        }`;
      }
    });
    return str;
  }

  /**
   * 更新自定义着色器
   */
  _updateShader(vtx1, vtx2) {
    // 如果没有压平区域，恢复原始着色器
    if (this._polygonEdits.length === 0) {
      this._tileset.customShader = this._originalShader;
      console.log("[TilesetPlanish] 无压平区域，恢复原始着色器");
      return;
    }

    const fullVertexShader = `
      ${vtx1}
      void vertexMain (VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
        vec3 modelMC = vsInput.attributes.positionMC;
        vec4 model_local_position = vec4(modelMC.x, modelMC.y, modelMC.z, 1.0);
        vec4 tileset_local_position = u_tileset_worldToLocalMatrix * czm_model * model_local_position;
        vec2 position2D = vec2(tileset_local_position.x, tileset_local_position.y);
        ${vtx2}
      }
    `;

    console.log("[TilesetPlanish] 生成着色器，区域数:", this._polygonEdits.length);
    console.log("[TilesetPlanish] vertexShaderText (前200字符):", fullVertexShader.substring(0, 200));

    let flatCustomShader = new Cesium.CustomShader({
      uniforms: {
        u_tileset_localToWorldMatrix: {
          type: Cesium.UniformType.MAT4,
          value: this._matrix,
        },
        u_tileset_worldToLocalMatrix: {
          type: Cesium.UniformType.MAT4,
          value: this._localMatrix,
        },
      },
      vertexShaderText: fullVertexShader,
    });
    this._tileset.customShader = flatCustomShader;
    console.log("[TilesetPlanish] 着色器已应用到 tileset");
  }

  /**
   * 删除压平区域
   */
  removeRegionEditsData(uuid) {
    for (let i = 0; i < this._polygonEdits.length; i++) {
      if (this._polygonEdits[i].uuid === uuid) {
        this._polygonEdits.splice(i, 1);
      }
    }
    this.renderShader();
  }

  /**
   * 清除所有压平区域
   */
  clearAll() {
    this._polygonEdits = [];
    this.renderShader();
  }

  /**
   * 设置压平区域显隐
   */
  setRegionEditsVisible(uuid, visible) {
    for (let i = 0; i < this._polygonEdits.length; i++) {
      if (this._polygonEdits[i].uuid === uuid) {
        this._polygonEdits[i].show = visible;
      }
    }
    this.renderShader();
  }

  /**
   * 设置压平区域高度
   */
  setRegionEditsHeight(uuid, height) {
    for (let i = 0; i < this._polygonEdits.length; i++) {
      if (this._polygonEdits[i].uuid === uuid) {
        this._polygonEdits[i].height = height;
      }
    }
    this.renderShader();
  }

  /**
   * 恢复原始着色器
   */
  restore() {
    this._tileset.customShader = this._originalShader;
    console.log("[TilesetPlanish] 已恢复原始着色器");
  }

  /**
   * 生成 UUID
   */
  static createUUID() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  }

  /**
   * 获取模型中心点在局部坐标系中的高度（ENU 原点 Z=0）
   */
  getModelHeight() {
    if (!this._tileset || !this._tileset.boundingSphere) return 0;
    const center = this._tileset.boundingSphere.center;
    const local = Cesium.Matrix4.multiplyByPoint(
      this._localMatrix,
      center,
      new Cesium.Cartesian3()
    );
    console.log("[TilesetPlanish] 模型中心局部坐标:", local);
    return local.z;
  }
}

export default TilesetPlanish;

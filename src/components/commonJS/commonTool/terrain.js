/*
 * @Descripttion:
 * @version: 1.0
 * @Author: zhangti
 * @Date: 2019-09-19 17:44:53
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-07 16:21:54
 */
/**
 * 生成地形实体类
 */
import * as Cesium from 'cesium'
export default class Terrain {
  constructor(core) {
    /**
         * terrain 实体
         */
    this.TerrainLayer = core.terrainProvider

    this.terrainObj = null
  }
  /**
     * build 构建
     * @param {*} Terrain
     */

  build(node) {
    switch (node.type) { // 拓展接口
      case 'create': this.terrainObj = this.createTerrain(node.child); break
      default: this.terrainObj = this.addTerrainLayer(node.terrain); break
    }

    return this.terrainObj
  }

  /**
     * 创建 Terrain
     * 需要后面拓展
     * 创建接口
     */
  createTerrain(child) {
    for (const c in child) {
      // Terrain = {
      //   url: child[c].url
      // }
    }
  }

  /**
     * 添加Terrain
     */
  addTerrainLayer(terrain) {
    console.log(terrain)
    this.TerrainLayer = terrain
  }

  /**
     * remove Terrain
     */
  remove() {
    this.TerrainLayer = new Cesium.EllipsoidTerrainProvider({})
  }

  /**
     *
     * removeAll Terrain
    */
  removeAll() {
    this.TerrainLayer = new Cesium.EllipsoidTerrainProvider({})
  }
}

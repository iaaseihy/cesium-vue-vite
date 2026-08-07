<!--
 * @Descripttion: 倾斜摄影压平面板 —— 绘制区域/设置高度/导入GeoJSON/应用/恢复
-->
<template>
  <div v-if="visible" class="flatten-panel">
    <div class="panel-header">
      <h3>倾斜摄影压平</h3>
      <span class="close-btn" @click="handleClose">×</span>
    </div>

    <div class="panel-content">
      <!-- 1. 绘制压平区域 -->
      <div class="section">
        <div class="section-title">1. 绘制压平区域</div>
        <el-button
          :type="isDrawing ? 'danger' : 'primary'"
          @click="toggleDraw"
          size="small"
          style="width: 100%"
        >
          {{ isDrawing ? '停止绘制（右键结束）' : '开始绘制区域' }}
        </el-button>
        <p class="tip">左键点击添加点，右键结束绘制。请在倾斜模型表面点击。</p>
      </div>

      <!-- 2. 导入GeoJSON -->
      <div class="section">
        <div class="section-title">2. 导入GeoJSON压平面</div>
        <input
          ref="fileInput"
          type="file"
          accept=".json,.geojson"
          style="display: none"
          @change="handleFileImport"
        />
        <el-button @click="$refs.fileInput.click()" size="small" style="width: 100%">
          选择GeoJSON文件
        </el-button>
        <p class="tip" v-if="importedFileName">已导入: {{ importedFileName }}</p>
      </div>

      <!-- 3. 设置压平高度 -->
      <div class="section">
        <div class="section-title">3. 设置压平高度</div>
        <div class="height-row">
          <span class="label">高度(Z):</span>
          <el-input-number
            v-model="flattenHeight"
            :step="1"
            size="small"
            style="flex: 1"
          />
          <span class="unit">米</span>
        </div>
        <p class="tip">高度0不一定能达到压平效果，请根据实际情况调节（负值下压，正值上移）</p>
      </div>

      <!-- 4. 执行操作 -->
      <div class="section">
        <div class="section-title">4. 执行操作</div>
        <div class="action-buttons">
          <el-button
            type="success"
            @click="handleApply"
            :disabled="!hasArea"
            size="small"
            style="flex: 1"
          >
            应用压平
          </el-button>
          <el-button
            type="warning"
            @click="handleRestore"
            size="small"
            style="flex: 1"
          >
            恢复原状
          </el-button>
        </div>
      </div>

      <!-- 已添加的压平区域列表 -->
      <div class="section" v-if="regionList.length > 0">
        <div class="section-title">压平区域列表</div>
        <div
          v-for="(item, idx) in regionList"
          :key="item.uuid"
          class="region-item"
        >
          <span class="region-name">区域{{ idx + 1 }}</span>
          <span class="region-height">{{ item.height.toFixed(1) }}m</span>
          <span class="region-del" @click="handleRemoveRegion(item.uuid)">删除</span>
        </div>
      </div>

      <!-- 清除全部 -->
      <div class="section" v-if="regionList.length > 0">
        <el-button
          type="danger"
          @click="handleClearAll"
          plain
          size="small"
          style="width: 100%"
        >
          清除全部区域
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import * as Cesium from "cesium";
import TilesetPlanish from "./TilesetPlanish.js";

export default {
  name: "FlattenPanel",
  props: {
    visible: { type: Boolean, default: false },
    viewer: { type: Object, default: null },
    tileset: { type: Object, default: null },
  },
  emits: ["close"],
  setup(props, { emit, expose }) {
    const isDrawing = ref(false);
    const hasArea = ref(false);
    const flattenHeight = ref(0);
    const regionList = ref([]);
    const importedFileName = ref("");
    const fileInput = ref(null);

    let tilesetPlanish = null;
    let drawHandler = null;
    const ENTITY_NAMES = {
      POLYGON: "flatten-polygon",
      LINE: "flatten-line",
      POINT: "flatten-point",
    };

    // 初始化压平工具
    const initPlanish = () => {
      if (!props.tileset) {
        console.warn("[压平] tileset 未加载");
        return false;
      }
      if (!tilesetPlanish) {
        tilesetPlanish = new TilesetPlanish(props.tileset);
        console.log("[压平] 初始化完成, 默认高度: 0 (ENU局部坐标系Z值)");
      }
      return true;
    };

    // 清除绘制实体
    const clearDrawEntities = () => {
      if (!props.viewer) return;
      const toRemove = [];
      const targetNames = Object.values(ENTITY_NAMES);
      const allEntities = props.viewer.entities.values;
      for (let i = 0; i < allEntities.length; i++) {
        const entity = allEntities[i];
        if (entity.name && targetNames.includes(entity.name)) {
          toRemove.push(entity);
        }
      }
      toRemove.forEach((e) => props.viewer.entities.remove(e));
    };

    /**
     * 拾取屏幕坐标对应的三维坐标
     * 简化版：先尝试 scene.pickPosition（对3D Tiles有效），
     * 失败则用 globe.pick（地形），最后用 pickEllipsoid
     */
    const pickPosition = (screenPosition) => {
      const viewer = props.viewer;
      if (!viewer) return null;

      try {
        // 方法1: scene.pickPosition —— 对 3D Tiles 和开启深度的地形有效
        const picked = viewer.scene.pick(screenPosition);
        if (Cesium.defined(picked)) {
          // 确认拾取到的是 3D Tiles
          const is3DTile =
            picked.primitive instanceof Cesium.Cesium3DTileset ||
            (picked.id && picked.id.primitive instanceof Cesium.Cesium3DTileset);
          if (is3DTile) {
            const pos = viewer.scene.pickPosition(screenPosition);
            if (pos) {
              console.log("[压平] 拾取到3D Tiles坐标:", pos);
              return pos;
            }
          }
        }

        // 方法2: globe.pick —— 对地形有效
        const ray = viewer.camera.getPickRay(screenPosition);
        if (ray) {
          const pos = viewer.scene.globe.pick(ray, viewer.scene);
          if (pos) {
            console.log("[压平] 拾取到地形坐标:", pos);
            return pos;
          }
        }

        // 方法3: pickEllipsoid —— 椭球体拾取（最后手段）
        const pos = viewer.scene.camera.pickEllipsoid(
          screenPosition,
          viewer.scene.globe.ellipsoid
        );
        if (pos) {
          console.log("[压平] 拾取到椭球体坐标:", pos);
        }
        return pos;
      } catch (e) {
        console.error("[压平] 拾取坐标失败:", e);
        return null;
      }
    };

    // 临时绘制数据
    let tempPositions = [];
    let tempLineEntity = null;
    let tempPointEntities = [];

    // 开始绘制
    const startDraw = () => {
      if (!props.viewer || !initPlanish()) return;
      clearDrawEntities();
      // 清除所有已有压平区域（不仅是恢复着色器，还要清空内部数据）
      tilesetPlanish.clearAll();
      regionList.value = [];
      tempPositions = [];
      tempPointEntities = [];

      if (drawHandler) drawHandler.destroy();
      drawHandler = new Cesium.ScreenSpaceEventHandler(props.viewer.scene.canvas);

      // 左键添加点
      drawHandler.setInputAction((click) => {
        const position = pickPosition(click.position);
        if (!position) {
          console.warn("[压平] 未能拾取到坐标");
          return;
        }
        tempPositions.push(position);
        console.log("[压平] 添加点 #" + tempPositions.length, position);

        // 更新临时线（实时连接所有已绘制的点）
        if (tempLineEntity) props.viewer.entities.remove(tempLineEntity);
        if (tempPositions.length >= 2) {
          tempLineEntity = props.viewer.entities.add({
            name: ENTITY_NAMES.LINE,
            polyline: {
              positions: new Cesium.CallbackProperty(() => {
                // 闭合线条：连接最后一个点回到第一个点
                if (tempPositions.length >= 3) {
                  return [...tempPositions, tempPositions[0]];
                }
                return tempPositions;
              }, false),
              width: 3,
              material: Cesium.Color.CYAN,
              clampToGround: false,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          });
        }

        // 添加点标记
        const pointEntity = props.viewer.entities.add({
          name: ENTITY_NAMES.POINT,
          position: position,
          point: {
            pixelSize: 10,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        tempPointEntities.push(pointEntity);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 右键结束
      drawHandler.setInputAction(() => {
        if (tempPositions.length < 3) {
          console.warn("[压平] 至少需要3个点，当前:", tempPositions.length);
          return;
        }
        if (tempLineEntity) props.viewer.entities.remove(tempLineEntity);

        // 添加最终多边形 —— 贴在拾取的位置上
        props.viewer.entities.add({
          name: ENTITY_NAMES.POLYGON,
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(tempPositions),
            material: Cesium.Color.CYAN.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.CYAN,
            outlineWidth: 3,
            perPositionHeight: true,
          },
        });

        hasArea.value = true;
        isDrawing.value = false;
        stopDraw();
        console.log("[压平] 绘制完成, 共" + tempPositions.length + "个点");
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };

    // 停止绘制
    const stopDraw = () => {
      if (drawHandler) {
        drawHandler.destroy();
        drawHandler = null;
      }
    };

    // 切换绘制状态
    const toggleDraw = () => {
      if (isDrawing.value) {
        isDrawing.value = false;
        stopDraw();
      } else {
        isDrawing.value = true;
        startDraw();
      }
    };

    // 应用压平
    const handleApply = () => {
      if (!initPlanish()) return;
      if (tempPositions.length < 3) {
        console.warn("[压平] 请先绘制区域或导入数据");
        return;
      }
      // 关键修复：清除已有的压平区域，避免多个区域叠加导致旧高度永远生效
      tilesetPlanish.clearAll();
      regionList.value = [];

      const uuid = TilesetPlanish.createUUID();
      console.log("[压平] 应用压平, UUID:", uuid, "高度:", flattenHeight.value);
      tilesetPlanish.addRegionEditsData(uuid, tempPositions, flattenHeight.value);
      regionList.value.push({ uuid, height: flattenHeight.value });
    };

    // 恢复原状
    const handleRestore = () => {
      if (tilesetPlanish) {
        tilesetPlanish.clearAll();
        regionList.value = [];
        clearDrawEntities();
        hasArea.value = false;
        tempPositions = [];
      }
    };

    // 删除单个区域
    const handleRemoveRegion = (uuid) => {
      if (tilesetPlanish) {
        tilesetPlanish.removeRegionEditsData(uuid);
        regionList.value = regionList.value.filter((r) => r.uuid !== uuid);
      }
    };

    // 清除全部
    const handleClearAll = () => {
      handleRestore();
    };

    // 关闭面板
    const handleClose = () => {
      stopDraw();
      isDrawing.value = false;
      emit("close");
    };

    // 导入 GeoJSON
    const handleFileImport = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      importedFileName.value = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geojson = JSON.parse(e.target.result);
          if (!initPlanish()) return;

          // 清除之前的绘制
          clearDrawEntities();
          tempPositions = [];

          // 解析 GeoJSON 中的多边形
          let coordinates = [];
          if (geojson.type === "FeatureCollection") {
            geojson.features.forEach((feature) => {
              if (feature.geometry && feature.geometry.type === "Polygon") {
                coordinates.push(feature.geometry.coordinates[0]);
              } else if (feature.geometry && feature.geometry.type === "MultiPolygon") {
                feature.geometry.coordinates.forEach((poly) => {
                  coordinates.push(poly[0]);
                });
              }
            });
          } else if (geojson.type === "Polygon") {
            coordinates.push(geojson.coordinates[0]);
          } else if (geojson.type === "MultiPolygon") {
            geojson.coordinates.forEach((poly) => {
              coordinates.push(poly[0]);
            });
          }

          if (coordinates.length === 0) {
            console.warn("[压平] GeoJSON中未找到Polygon数据");
            return;
          }

          // 处理第一个多边形作为压平区域
          const ring = coordinates[0];
          const positions = ring.map((coord) => {
            return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2] || 0);
          });

          tempPositions = positions;

          // 在场景中显示导入的多边形
          props.viewer.entities.add({
            name: ENTITY_NAMES.POLYGON,
            polygon: {
              hierarchy: new Cesium.PolygonHierarchy(positions),
              material: Cesium.Color.CYAN.withAlpha(0.3),
              outline: true,
              outlineColor: Cesium.Color.CYAN,
              outlineWidth: 3,
              perPositionHeight: true,
            },
          });

          hasArea.value = true;
          console.log("[压平] GeoJSON导入成功，共" + positions.length + "个点");
        } catch (err) {
          console.error("[压平] GeoJSON解析失败:", err);
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    };

    // 暴露方法
    expose({
      setDrawingState: (state) => { isDrawing.value = state; },
      setHasDrawnArea: (state) => { hasArea.value = state; },
      getPlanish: () => tilesetPlanish,
    });

    return {
      isDrawing,
      hasArea,
      flattenHeight,
      regionList,
      importedFileName,
      fileInput,
      toggleDraw,
      handleApply,
      handleRestore,
      handleRemoveRegion,
      handleClearAll,
      handleClose,
      handleFileImport,
    };
  },
};
</script>

<style scoped>
.flatten-panel {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 320px;
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(100, 150, 200, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  color: #ddd;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(100, 150, 200, 0.3);
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  color: #6cb4ff;
}

.close-btn {
  font-size: 22px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.panel-content {
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.section {
  margin-bottom: 16px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  color: #6cb4ff;
  margin-bottom: 8px;
  font-weight: 500;
}

.tip {
  margin: 6px 0 0 0;
  font-size: 11px;
  color: #888;
  line-height: 1.4;
}

.height-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.height-row .label {
  font-size: 12px;
  white-space: nowrap;
}

.height-row .unit {
  font-size: 12px;
  color: #6cb4ff;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.region-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: rgba(100, 150, 200, 0.1);
  border-radius: 4px;
  font-size: 12px;
}

.region-name {
  color: #6cb4ff;
}

.region-height {
  color: #aaa;
}

.region-del {
  color: #f56c6c;
  cursor: pointer;
}

.region-del:hover {
  text-decoration: underline;
}

.panel-content::-webkit-scrollbar {
  width: 5px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(100, 150, 200, 0.4);
  border-radius: 3px;
}
</style>

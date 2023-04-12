<!--
 * @Descripttion: 等高线页面
 * @version: v1.0
 * @Author: caochaoqiang
 * @Date: 2023-02-03 11:43:18
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-04-12 17:20:36
-->
<template>
  <el-row>
    <el-col>
      <div class="demo-container">
        <label
          ><input
            type="radio"
            name="shadingMaterials"
            value="none"
            data-bind="checked: selectedShading"
          />无渲染</label
        >
        <label
          ><input
            type="radio"
            name="shadingMaterials"
            value="elevation"
            data-bind="checked: selectedShading"
          />高程渲染</label
        >
      </div>
      <div class="demo-container">
        <div>
          <label
            ><input
              type="checkbox"
              data-bind="checked: enableContour"
            />等高线</label
          >
        </div>
        <div>
          高程
          <input
            style="width: 136px; float: left; width: 100px"
            type="range"
            min="1.0"
            max="500.0"
            step="1.0"
            data-bind="value: contourSpacing, valueUpdate: 'input', enable: enableContour"
            @change="test2()"
          />
          <span data-bind="text: contourSpacing"></span>m
        </div>
        <div class="demo-container">
          <div>
            <el-checkbox v-model="viewModel.enableContour" @change="isContour">
              等高线
            </el-checkbox>
          </div>
          <div class="elevation">
            <el-slider
              v-model="viewModel.contourSpacing"
              @change="setMapPercentage"
              :max="500.0"
              :min="1.0"
              show-input
            />
            <span>{{ viewModel.contourSpacing }}m</span>
            <!-- <el-slider
                v-model="viewModel.contourSpacing"
                :show-tooltip="false"></el-slider> -->
          </div>
          <div class="lineWidth">
            <el-slider
              v-model="viewModel.contourWidth"
              @change="setContourWidth"
              :max="10.0"
              :min="1.0"
              :step="1.0"
              show-input
            />
            <span>{{ viewModel.contourWidth }}m</span>
            <!-- <el-slider
                v-model="viewModel.contourSpacing"
                :show-tooltip="false"></el-slider> -->
          </div>
          <div class="contourColor">
            <el-button @click="changeColor">颜色</el-button>
          </div>
          <div class="visibility">
            <el-button @click="visibilityTwoPoints(viewer)"
              >两点通视分析</el-button
            >
          </div>
          <div class="visibility">
            <el-button @click="visualField(earth)">可视域分析</el-button>
          </div>
          <div class="visibility">
            <el-button @click="viewShed3D(viewer)">超图可视域分析</el-button>
          </div>
          <div class="ClipPlane">
            <el-button @click="createClipPlanAnalysis(viewer)"
              >地形开挖分析</el-button
            >
          </div>
          <div class="offClipPlane">
            <el-button @click="clearClipPlanAnalysis()"
              >关闭地形开挖分析</el-button
            >
          </div>
          <div class="screenShot">
            <el-button @click="add3DTiles(viewer)">模型压平</el-button>
          </div>
        </div>
        <div>
          线宽
          <input
            style="width: 125px; float: left; width: 100px"
            type="range"
            min="1.0"
            max="10.0"
            step="1.0"
            data-bind="value: contourWidth, valueUpdate: 'input', enable: enableContour"
            @click="test2"
          />
          <span data-bind="text: contourWidth"></span>px
        </div>
        <div>
          <button
            type="button"
            data-bind="click: changeColor, enable: enableContour"
          >
            颜色
          </button>
        </div>
        <div class="tileModelTool" style="width: 125px; float: left; width: 100px" v-if="tileModelToolVisiable">
        <p>比例：</p>
        <el-input-number
          v-model="tileModelTool.scale"
          label="描述文字"
          @change="update3dtilesMaxtrix(viewer, 'scale', tileModelTool.scale)"
          :step="0.1"
        ></el-input-number>
        <p>位置：</p>
        <p>经度：</p>
        <el-input-number
          v-model="tileModelTool.longitude"
          label="描述文字"
          @change="update3dtilesMaxtrix(viewer, 'longitude', tileModelTool.longitude)"
          :step="0.00001"
        ></el-input-number>
        <p>纬度：</p>
        <el-input-number
          v-model="tileModelTool.latitude"
          label="描述文字"
          @change="update3dtilesMaxtrix(viewer, 'latitude', tileModelTool.latitude)"
          :step="0.00001"
        ></el-input-number>
        <p>高度：</p>
        <el-slider
          v-model="tileModelTool.height"
          @change="update3dtilesMaxtrix(viewer, 'height', tileModelTool.height)"
          :min="-100"
          :max="1000"
        ></el-slider>
        <!-- <p>以x轴旋转</p>
        <el-slider
          v-model="tileModelTool.rx"
          @input="update3dtilesMaxtrix"
          :min="-100"
          :max="100"
        ></el-slider>
        <p>以y轴旋转</p>
        <el-slider
          v-model="tileModelTool.ry"
          @input="update3dtilesMaxtrix"
          :min="-100"
          :max="100"
        ></el-slider>
        <p>以z轴旋转</p>
        <el-slider
          v-model="tileModelTool.rz"
          @input="update3dtilesMaxtrix"
          :min="-100"
          :max="100"
        ></el-slider>

        <p>透明度</p>
        <el-slider
          v-model="tileModelTool.alpha"
          @input="update3dtilesMaxtrix"
          :min="0"
          :max="1"
          :step="0.1"
        ></el-slider> -->
      </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import * as Cesium from "cesium";
// import Visibility from '../commonJS/viewShedTwoPoints'
// import VisualField from '../commonJS/visualField'
// import ViewShed3D from '../commonJS/ViewShed3D'
// import TerrainClipPlan from '../commonJS/TerrainClipPlan'
import TerrainClipPlan from "../commonJS/TerrainClipPlanClass";
import ModelClipPlan from "../commonJS/modelYAPING";
import { DAYANTA3DTILES } from "../commonJS/config";
export default {
  name: "ContourLine",
  props: ["test", "viewer", "earth", "modelUrl"],
  data() {
    return {
      minHeight: -414.0, // approximate dead sea elevation
      maxHeight: 8777.0, // approximate everest elevation
      contourColor: Cesium.Color.RED.clone(),
      contourUniforms: {},
      shadingUniforms: {},
      viewModel: {
        enableContour: true,
        contourSpacing: 50.0,
        contourWidth: 2.0,
        selectedShading: "none",
        //   changeColor: function () {
        //     contourUniforms.color = Cesium.Color.fromRandom(
        //       { alpha: 1.0 },
        //       contourColor
        //     )
        //   }
      },
      elevationValue: [50.0, 500.0],
      elevationRamp: [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0],
      slopeRamp: [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0],
      aspectRamp: [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0],
      // 判断是否被拖动
      isChange: false,
      handleArr: [],
      config: {
        borderColor: Cesium.Color.BLUE,
        borderWidth: 2,
        material: Cesium.Color.GREEN.withAlpha(0.5),
      },
      terrainClipPlan: null,
      tileModelTool: {
        scale: 1.0,
        longitude: 113.0625945542995,
        latitude: 22.646893660837442,
        height: 419, //修改高度
        rx: 0,
        ry: 0,
        rz: 33.5, //修改旋转
        alpha: 0.5,
      },
      tileModelToolVisiable: true,
    };
  },
  mounted() {},
  methods: {
    getElevationContourMaterial() {
      // Creates a composite material with both elevation shading and contour lines
      return new Cesium.Material({
        fabric: {
          type: "ElevationColorContour",
          materials: {
            contourMaterial: {
              type: "ElevationContour",
            },
            elevationRampMaterial: {
              type: "ElevationRamp",
            },
          },
          components: {
            diffuse:
              "contourMaterial.alpha === 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse",
            alpha: "max(contourMaterial.alpha, elevationRampMaterial.alpha)",
          },
        },
        translucent: false,
      });
    },
    getColorRamp(selectedShading) {
      var ramp = document.createElement("canvas");
      ramp.width = 100;
      ramp.height = 1;
      var ctx = ramp.getContext("2d");

      var values;
      if (selectedShading === "elevation") {
        values = this.elevationRamp;
      } else if (selectedShading === "slope") {
        values = this.slopeRamp;
      } else if (selectedShading === "aspect") {
        values = this.aspectRamp;
      }

      var grd = ctx.createLinearGradient(0, 0, 100, 0);
      grd.addColorStop(values[0], "#000000"); // black
      grd.addColorStop(values[1], "#2747E0"); // blue
      grd.addColorStop(values[2], "#D33B7D"); // pink
      grd.addColorStop(values[3], "#D33038"); // red
      grd.addColorStop(values[4], "#FF9742"); // orange
      grd.addColorStop(values[5], "#ffd700"); // yellow
      grd.addColorStop(values[6], "#ffffff"); // white

      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 100, 1);

      return ramp;
    },
    changeColor: function () {
      this.contourUniforms.color = Cesium.Color.fromRandom(
        { alpha: 1.0 },
        this.contourColor
      );
    },
    updateMaterial(viewer) {
      var hasContour = this.viewModel.enableContour;
      var selectedShading = this.viewModel.selectedShading;
      var globe = viewer.scene.globe;
      var material;
      if (hasContour) {
        if (selectedShading === "elevation") {
          material = this.getElevationContourMaterial();
          this.shadingUniforms =
            material.materials.elevationRampMaterial.uniforms;
          this.shadingUniforms.minimumHeight = this.minHeight;
          this.shadingUniforms.maximumHeight = this.maxHeight;
          this.contourUniforms = material.materials.contourMaterial.uniforms;
        } else {
          material = Cesium.Material.fromType("ElevationContour");
          this.contourUniforms = material.uniforms;
        }
        this.contourUniforms.width = this.viewModel.contourWidth;
        this.contourUniforms.spacing = this.viewModel.contourSpacing;
        this.contourUniforms.color = this.contourColor;
      } else if (selectedShading === "elevation") {
        material = Cesium.Material.fromType("ElevationRamp");
        this.shadingUniforms = material.uniforms;
        this.shadingUniforms.minimumHeight = this.minHeight;
        this.shadingUniforms.maximumHeight = this.maxHeight;
      }
      if (selectedShading !== "none") {
        this.shadingUniforms.image = this.getColorRamp(selectedShading);
      }
      globe.material = material;
    },
    test2(val) {
      console.log(this.viewModel.contourSpacing);
      console.log(val);
    },
    // 鼠标拖拽松开时
    setMapPercentage(val) {
      console.log(val);
      console.log(this.viewModel.contourSpacing);
      this.contourUniforms.spacing = parseFloat(this.viewModel.contourSpacing);
      // this.isChange = false
    },
    setContourWidth() {
      console.log(this.viewModel.contourWidth);
      this.contourUniforms.width = parseFloat(this.viewModel.contourWidth);
    },
    isContour() {
      console.log(this.viewModel.enableContour);
      this.viewModel.enableContour = !this.viewModel.enableContour;
    },
    /**
     * 两点可视域分析
     * @param {viewer} viewer 视图
     */
    visibilityTwoPoints(viewer) {
      const pointVisible = new Visibility(viewer);
    },
    visualField(viewer) {
      const visualFieldAnalys = new VisualField(viewer);
    },
    viewShed3D(viewer) {
      const viewShed3D = new ViewShed3D(viewer);
    },
    /**
     * 清除事件
     */
    removeHandle() {
      if (this.handleArr.length > 0) {
        for (const i in this.handleArr) this.handleArr[i].destroy();
        this.entitys.remove(this._resultTip);
        this._resultTip = null;
        this.handleArr = [];
      }
    },
    // 坐标转换 84转笛卡尔
    transformWGS84ToCartesian: function (viewer, position, alt) {
      if (viewer) {
        return position
          ? Cesium.Cartesian3.fromDegrees(
              position.lng || position.lon,
              position.lat,
              (position.alt = alt || position.alt),
              Cesium.Ellipsoid.WGS84
            )
          : Cesium.Cartesian3.ZERO;
      }
    },
    // 坐标数组转换 84转笛卡尔
    transformCartesianArrayToWGS84Array: function (viewer, cartesianArr) {
      if (viewer) {
        var $this = this;
        return cartesianArr
          ? cartesianArr.map(function (item) {
              return $this.transformCartesianToWGS84(viewer, item);
            })
          : [];
      }
    },
    // 坐标转换 笛卡尔转84
    transformCartesianToWGS84: function (viewer, cartesian) {
      if (viewer && cartesian) {
        var ellipsoid = Cesium.Ellipsoid.WGS84;
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        return {
          lng: Cesium.Math.toDegrees(cartographic.longitude),
          lat: Cesium.Math.toDegrees(cartographic.latitude),
          alt: cartographic.height,
        };
      }
    },
    // 坐标数组转换 Cartesian3转经纬度
    transformCartesian3ArrayToWGS84Array: function (viewer, cartesianArr) {
      if (viewer) {
        var $this = this;
        return cartesianArr
          ? cartesianArr.map(function (item) {
              return $this.transformCartesianToWGS84(viewer, item);
            })
          : [];
      }
    },
    // 坐标转换 Cartesian3转经纬度
    transformCartesian3ToWGS84: function (viewer, cartesian) {
      if (viewer && cartesian) {
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian3 = new Cesium.Cartesian3(
          cartesian.x,
          cartesian.y,
          cartesian.z
        );
        var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        return {
          lng: Cesium.Math.toDegrees(cartographic.longitude),
          lat: Cesium.Math.toDegrees(cartographic.latitude),
          alt: cartographic.height,
        };
      }
    },
    // 坐标数组转换 笛卡尔转84
    transformWGS84ArrayToCartesianArray: function (viewer, WSG84Arr, alt) {
      if (viewer && WSG84Arr) {
        var $this = this;
        return WSG84Arr
          ? WSG84Arr.map(function (item) {
              return $this.transformWGS84ToCartesian(viewer, item, alt);
            })
          : [];
      }
    },
    /**
     *
     * @param {*} position
     * 84坐标转制图坐标
     */
    transformWGS84ToCartographic: function (position) {
      return position
        ? Cesium.Cartographic.fromDegrees(
            position.lng || position.lon,
            position.lat,
            position.alt
          )
        : Cesium.Cartographic.ZERO;
    },
    /**
     * 计算一组坐标组成的面的面积
     * @param {*} positions
     */
    getPositionsArea: function (positions) {
      let result = 0;
      if (positions) {
        let h = 0;
        const ellipsoid = Cesium.Ellipsoid.WGS84;
        positions.push(positions[0]);
        for (let i = 1; i < positions.length; i++) {
          const oel = ellipsoid.cartographicToCartesian(
            this.transformWGS84ToCartographic(positions[i - 1])
          );
          const el = ellipsoid.cartographicToCartesian(
            this.transformWGS84ToCartographic(positions[i])
          );
          h += oel.x * el.y - el.x * oel.y;
        }
        result = Math.abs(h).toFixed(2);
      }
      return result;
    },
    // 拾取位置点
    getCatesian3FromPX: function (px, viewer) {
      if (viewer && px) {
        // var picks = viewer.scene.drillPick(px); // 3dtilset
        // for (var i = 0; i < picks.length; i++) {
        //     if (picks[i] instanceof Cesium.Cesium3DTileFeature) { //模型上拾取
        //         isOn3dtiles = true;
        //     }
        // }
        var picks = viewer.scene.pick(px);
        var cartesian = null;
        var isOn3dtiles = false;
        var isOnTerrain = false;
        if (picks instanceof Cesium.Cesium3DTileFeature) {
          // 模型上拾取
          isOn3dtiles = true;
        }
        // 3dtilset
        if (isOn3dtiles) {
          cartesian = viewer.scene.pickPosition(px);
          if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            if (cartographic.height < 0) cartographic.height = 0;
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const height = cartographic.height; // 模型高度
            cartesian = this.transformWGS84ToCartesian(viewer, {
              lng: lon,
              lat: lat,
              alt: height,
            });
          }
        }
        // 地形
        if (
          !picks &&
          !viewer.terrainProvide instanceof Cesium.EllipsoidTerrainProvider
        ) {
          var ray = viewer.scene.camera.getPickRay(px);
          if (!ray) return null;
          cartesian = viewer.scene.globe.pick(ray, viewer.scene);
          isOnTerrain = true;
        }
        // 地球
        if (!isOn3dtiles && !isOnTerrain) {
          cartesian = viewer.scene.camera.pickEllipsoid(
            px,
            viewer.scene.globe.ellipsoid
          );
        }
        if (cartesian) {
          const position = this.transformCartesianToWGS84(viewer, cartesian);
          if (position.alt < 0) {
            cartesian = this.transformWGS84ToCartesian(viewer, position, 0.1);
          }
          return cartesian;
        }
        return false;
      }
    },
    /**
     * 画面 or 测面积
     * @param {*} options
     */
    drawPolygonGraphics: function (options, viewer) {
      options = options || {};
      options.style = options.style || {
        width: 3,
        material: Cesium.Color.BLUE.withAlpha(0.8),
        clampToGround: true,
      };
      if (viewer && options) {
        var positions = [];
        var polygon = new Cesium.PolygonHierarchy();
        var _polygonEntity = new Cesium.Entity();
        var $this = this;
        var polyObj = null;
        var _label = "";
        var _handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        // left
        _handler.setInputAction(function (movement) {
          var cartesian = $this.getCatesian3FromPX(movement.position, viewer);
          if (cartesian && cartesian.x) {
            if (positions.length == 0) {
              polygon.positions.push(cartesian.clone());
              positions.push(cartesian.clone());
            }
            positions.push(cartesian.clone());
            polygon.positions.push(cartesian.clone());

            if (!polyObj) create();
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // mouse
        _handler.setInputAction(function (movement) {
          var cartesian = $this.getCatesian3FromPX(
            movement.endPosition,
            viewer
          );
          if (positions.length >= 2) {
            if (cartesian && cartesian.x) {
              positions.pop();
              positions.push(cartesian);
              polygon.positions.pop();
              polygon.positions.push(cartesian);
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // right
        _handler.setInputAction(function (movement) {
          _handler.destroy();

          positions.push(positions[0]);
          const positionsgeo = $this.transformCartesian3ArrayToWGS84Array(
            viewer,
            positions
          );
          console.log("positions: ", positions, positionsgeo);
          if (options.height) {
            // 立体
            _polygonEntity.polygon.extrudedHeight = options.height;
            _polygonEntity.polygon.material = Cesium.Color.BLUE.withAlpha(0.5);
          }
          if (options.measure) {
            // 量测
            _addInfoPoint(positions[0]);
          }
          if (typeof options.callback === "function") {
            options.callback(
              $this.transformCartesianArrayToWGS84Array(viewer, positions),
              polyObj
            );
          }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        function create() {
          _polygonEntity.polyline = options.style;

          _polygonEntity.polyline.positions = new Cesium.CallbackProperty(
            function () {
              return positions;
            },
            false
          );

          _polygonEntity.polygon = {
            hierarchy: new Cesium.CallbackProperty(function () {
              return polygon;
            }, false),

            material: Cesium.Color.WHITE.withAlpha(0.1),
            clampToGround: options.clampToGround || false,
          };
          _polygonEntity.clampToS3M = true;

          // polyObj = $this._drawLayer.entities.add(_polygonEntity)
          polyObj = viewer.entities.add(_polygonEntity);
        }

        function _addInfoPoint(position) {
          var _labelEntity = new Cesium.Entity();
          _labelEntity.position = position;
          _labelEntity.point = {
            pixelSize: 10,
            outlineColor: Cesium.Color.BLUE,
            outlineWidth: 5,
          };
          _labelEntity.label = {
            text:
              (
                $this.getPositionsArea(
                  $this.transformCartesianArrayToWGS84Array(viewer, positions)
                ) / 1000000.0
              ).toFixed(4) + "平方公里",
            show: true,
            showBackground: true,
            font: "14px monospace",
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(-20, -50), // left top
          };
          // $this._drawLayer.entities.add(_labelEntity)
          viewer.entities.add(_labelEntity);
        }
      }
    },
    /**
     * 地形开挖分析
     * @param {*} options
     */
    createClipPlanAnalysis: function (viewer) {
      const options = {
        height: 100,
        splitNum: 50,
        // wallImg: '/static/texture/excavate_side_min.png',
        wallImg: "/static/texture/dzmc.jpg",
        bottomImg: "/static/texture/excavate_bottom_min.jpg",
      };
      // options = options || {}
      if (viewer && options) {
        // // 开启地形开挖需要先关闭地形检测
        // viewer.scene.globe.depthTestAgainstTerrain = false
        var $this = this;
        // if ($this.terrainClipPlan) {
        //   $this.terrainClipPlan.clear()
        // }
        var _height = options.height || 30;
        var _splitNum = options.splitNum || 50;
        // var _wallImg = options.wallImg || '/static/texture/excavate_side_min.png'
        var _wallImg = options.wallImg || "/static/texture/dzmc.jpg";
        var _bottomImg =
          options.bottomImg || "/static/texture/excavate_bottom_min.jpg";
        $this.drawPolygonGraphics(
          {
            callback: function (polygon, polygonObj) {
              viewer.entities.remove(polygonObj);

              $this.terrainClipPlan = new TerrainClipPlan(viewer, {
                height: _height,
                splitNum: _splitNum,
                wallImg: _wallImg,
                bottomImg: _bottomImg,
              });
              $this.terrainClipPlan.updateData(
                $this.transformWGS84ArrayToCartesianArray(viewer, polygon)
              );
              // terrainClipPlanObj = new TerrainClipPlan(window.viewer, {
              //             height: this.excavationDepth,
              //             splitNum: earthPositionList.length * 10,
              //             bottomImg: '/static/img/bottomdz.jpg',
              //             wallImg: '/static/img/excavate.png'
              //           })
              //           terrainClipPlanObj.updateData(earthPositionList)

              if (typeof options.callback === "function") {
                options.callback($this.terrainClipPlan);
              }
            },
          },
          viewer
        );
      }
    },
    terrainClipPlanFunction(viewer) {
      // 坐标存储
      // var positions = []
      var poly = undefined;
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      this.handleArr.push(handler);

      // **记录拐点坐标 */
      var positions = [];
      // /**实体的唯一标注 */
      var id = new Date().getTime();
      /** 记录返回结果 */
      var codeInfo = [];
      /** 面的hierarchy属性 */
      var polygon = new Cesium.PolygonHierarchy();
      var _polygonEntity = new Cesium.Entity();
      /** 面对象配置 */
      var polyObj = null;
      // left
      handler.setInputAction((movement) => {
        const cartesian = this.viewer.camera.pickEllipsoid(
          movement.position,
          this.viewer.scene.globe.ellipsoid
        );
        const cartographic = Cesium.Cartographic.fromCartesian(
          cartesian,
          this.viewer.scene.globe.ellipsoid,
          new Cesium.Cartographic()
        );
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);

        if (cartesian && cartesian.x) {
          if (positions.length === 0) {
            positions.push(cartesian.clone());
          }
          codeInfo.push([lng, lat]);
          positions.push(cartesian.clone());
          polygon.positions.push(cartesian.clone());
          if (!polyObj) {
            _polygonEntity.polyline = {
              width: this.config.borderWidth,
              material: this.config.borderColor,
              clampToGround: false,
            };
            _polygonEntity.polyline.positions = new Cesium.CallbackProperty(
              function () {
                return positions;
              },
              false
            );

            _polygonEntity.polygon = {
              hierarchy: new Cesium.CallbackProperty(function () {
                return polygon;
              }, false),

              material: this.config.material,
              clampToGround: false,
            };
            _polygonEntity.name = "planeSelf";

            _polygonEntity._id = id;
            polyObj = this.viewer.entities.add(_polygonEntity);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // move
      handler.setInputAction((movement) => {
        const cartesian = this.viewer.camera.pickEllipsoid(
          movement.endPosition,
          this.viewer.scene.globe.ellipsoid
        );
        const cartographic = Cesium.Cartographic.fromCartesian(
          cartesian,
          this.viewer.scene.globe.ellipsoid,
          new Cesium.Cartographic()
        );
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);

        if (positions.length >= 0) {
          if (cartesian && cartesian.x) {
            positions.pop();
            positions.push(cartesian);
            polygon.positions.pop();
            polygon.positions.push(cartesian);
            codeInfo.pop();
            codeInfo.push([lng, lat]);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // right
      handler.setInputAction((movement) => {
        // this.infoDetail.planeSelf.push({ id: id, positions: codeInfo })

        handler.destroy();
        positions.push(positions[0]);
        const terrainClipPlan = new TerrainClipPlan(viewer, {
          height: 200,
          splitNum: 1000,
          bottomImg: "/static/texture/excavate_bottom_min.jpg",
          wallImg: "/static/texture/excavate_side_min.png",
        });
        if (positions.length > 0) {
          terrainClipPlan.updateData(positions);
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

      // // 鼠标单击画点
      // handler.setInputAction(function (movement) {
      //   var cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid)
      //   if (positions.length === 0) {
      //     positions.push(cartesian.clone())
      //   }
      //   positions.push(cartesian)
      // }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      // // 鼠标移动
      // handler.setInputAction(function (movement) {
      //   var cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid)
      //   if (positions.length >= 2) {
      //     if (!Cesium.defined(poly)) {
      //       poly = new PolygonPrimitive(positions)
      //     } else {
      //       if (cartesian !== undefined) {
      //         positions.pop()
      //         cartesian.y += (1 + Math.random())
      //         positions.push(cartesian)
      //       }
      //       _this.entitys.showTip(_this._resultTip, true, cartesian, '鼠标右键结束,平板长按结束')
      //     }
      //   } else {
      //     _this.entitys.showTip(_this._resultTip, true, cartesian, '点击绘制')
      //   }
      // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      // // 鼠标右键单击结束绘制
      // handler.setInputAction(function (movement) {
      //   this.removeHandle()
      //   callback(positions)
      // }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
      // earthPositionList 绘制的点集合
    },
    clearClipPlanAnalysis() {
      if (this.terrainClipPlan) {
        this.terrainClipPlan.clear();
      }
    },
    /**
     * 截取场景
     */
    cutScene(viewer) {
      const canvas = viewer.scene.canvas;
      const dataUrl = canvas.toDataURL("image/png"); // 生成base64图片数据
      const newImg = document.createElement("img");
      (newImg.src = dataUrl), (newImg.width = 600), (newImg.height = 500);
      const downloadIamge = function () {
        const a = document.createElement("a");
        a.download = "视图" + new Date().getTime(); // 这边是文件名，可以自定义
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      downloadIamge();
    },
    modelClip(viewer, modelUrl) {
      const modelClip = new ModelClipPlan(viewer, modelUrl);
      console.log(modelClip);
    },
    // 添加3dTiles倾斜模型并压平
    add3DTiles(viewer) {
      const modelArr = [];
      let tilesetModel = null;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      tilesetModel = new Cesium.Cesium3DTileset({
        // url: DAYANTA3DTILES,
        url: "http://earthsdk.com/v/last/Apps/assets/dayanta/tileset.json",
        minimumPixelSize: 128,
        customShader: new Cesium.CustomShader({
          uniforms: {
            // 判断是否开启压平
            v_if: {
              type: Cesium.UniformType.BOOL,
              value: false,
            },
            // 压平值
            v_z: {
              type: Cesium.UniformType.FLOAT,
              value: 0.0,
            },
          },
          varyings: {
            // 压平区域
            v_area: Cesium.VaryingType.VEC3,
          },
          // 局部压平通过vsInput.attributes.positionMC.x<10.0 &&vsInput.attributes.positionMC.y<10.0实现（模型内部坐标筛选），可传入varyings使用
          // 这段代码中的 vsInput.attributes.positionMC 是一个 vec3 类型的变量，代表了当前渲染的 3D 模型的位置。这个变量有三个分量：x、y 和 z。vsInput.attributes.positionMC.x < 10.0 && vsInput.attributes.positionMC.y < 10.0 这段代码的意思是，当渲染的 3D 模型的位置在 x 轴和 y 轴上都小于 10 时，就进行压平操作。具体地，在顶点着色器的 vertexMain 函数中，将当前顶点的 positionMC 的 z 分量设置为 v_z 的值。否则，将当前顶点的 positionMC 的 z 分量设置为原始的值，也就是不进行压平操作。
          //       vertexShaderText: `
          // 		 void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
          //  	if(v_if&& vsInput.attributes.positionMC.x<10.0 &&vsInput.attributes.positionMC.y<10.0){
          //  		vsOutput.positionMC = vec3(vsInput.attributes.positionMC.x, vsInput.attributes.positionMC.y, v_z);
          //  	}else{
          //  		vsOutput.positionMC = vec3(vsInput.attributes.positionMC.x, vsInput.attributes.positionMC.y, vsInput.attributes.positionMC.z);
          //  	}
          //  }`,

          // 整个模型压平
          vertexShaderText: `
  void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
    if (v_if) {
      vsOutput.positionMC = vec3(vsInput.attributes.positionMC.xy, v_z);
    } else {
      // vsOutput.positionMC = vec3(vsInput.attributes.positionMC.xy, -10.0);
      vsOutput.positionMC = vec3(vsInput.attributes.positionMC.x, vsInput.attributes.positionMC.y, vsInput.attributes.positionMC.z);
    }
  }
`,

          fragmentShaderText: `
		 void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
			
		  }`,
        }),
        enableModelExperimental: true,
      });
      this.setOpenModelHeight(tilesetModel, true);
      this.setModelHeight(tilesetModel, 50);
      tilesetModel.readyPromise.then(function (argument) {
        const heightOffset = 0; // 调整倾斜摄影高度，防止飘和进入地下
        const boundingSphere = tilesetModel.boundingSphere;
        const cartographic = Cesium.Cartographic.fromCartesian(
          boundingSphere.center
        );
        const surface = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        );
        const offset = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          heightOffset
        );
        const translation = Cesium.Cartesian3.subtract(
          offset,
          surface,
          new Cesium.Cartesian3()
        );
        tilesetModel.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        viewer.scene.primitives.add(tilesetModel);
        modelArr.push(tilesetModel);
      });
      viewer.flyTo(tilesetModel);
      console.log("模型压平：" + tilesetModel);
    },
    setModelHeight(tilesetModel, val) {
      tilesetModel.customShader.setUniform("v_z", val);
    },
    setOpenModelHeight(tilesetModel, val) {
      tilesetModel.customShader.setUniform("v_if", val);
    },
    // 修改3dtiles位置，input，range组件的change事件绑定此函数
    update3dtilesMaxtrix(viewer, type, val) {
      console.log(window.tileModel);
      const currentModel = window.tileModel;
      var boundingSphere = currentModel.boundingSphere;
          var cartographic = Cesium.Cartographic.fromCartesian(
            boundingSphere.center
          );
      // 获取模型中心点经纬度坐标
      let height;
      let longitude;
      let latitude;
      let scale;
      switch (type) {
        case 'height':
          height= val;
          console.log(height);
          break;
          /** @description:开启标尺 */
        case 'longitude':
          longitude= val;
          console.log(longitude);
          break;
        case 'latitude':
          latitude= val;
          console.log(latitude);
          break;
        case 'scale':
          scale = val;
          console.log(scale);
          break;
      }

      var mx = Cesium.Matrix3.fromRotationX(
        Cesium.Math.toRadians(this.tileModelTool.rx)
      );
      var my = Cesium.Matrix3.fromRotationY(
        Cesium.Math.toRadians(this.tileModelTool.ry)
      );
      var mz = Cesium.Matrix3.fromRotationZ(
        Cesium.Math.toRadians(this.tileModelTool.rz)
      );
      var rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
      var rotationY = Cesium.Matrix4.fromRotationTranslation(my);
      var rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
      //平移 修改经纬度
      // var position = Cesium.Cartesian3.fromDegrees(
      //   this.tileModelTool.longitude,
      //   this.tileModelTool.latitude,
      //   this.tileModelTool.height
      // );
      if (longitude === undefined) {
            longitude = (cartographic.longitude / Math.PI) * 180;
      }
      if (latitude === undefined) {
          latitude = (cartographic.latitude / Math.PI) * 180;
      }
      if (height === undefined) {
          height = cartographic.height;
      }
      if (scale === undefined) {
          scale = Cesium.Matrix4.fromUniformScale(this.tileModelTool.scale);
      }
      var position = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
      var m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      //旋转、平移矩阵相乘
      // Cesium.Matrix4.multiply(m, rotationX, m);
      // Cesium.Matrix4.multiply(m, rotationY, m);
      // Cesium.Matrix4.multiply(m, rotationZ, m);
      //缩放 修改缩放比例
      
      // if (type === 'scale') {
      //       scale = val
      // } else {
      //       scale = Cesium.Matrix4.fromUniformScale(this.tileModelTool.scale);
      // }
      Cesium.Matrix4.multiply(m, scale, m);
      //赋值给tileset
      currentModel.root.transform = m;
      // window.tileModel._root.transform = m;
      //调整地下透明度
      // viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue = Cesium.Math.clamp(
      //   this.tileModelTool.alpha,
      //   0.0,
      //   1.0
      // );
    },
  },
};
</script>

<style scoped>
.demo-container {
  margin-left: 400px;
}
.elevation {
  width: auto;
}
</style>

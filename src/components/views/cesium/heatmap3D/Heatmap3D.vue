<!--
 * @Descripttion:
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-02-03 10:20:33
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-09-08 17:05:04
-->
<template>
  <cesium-container ref="cesiumContainer"> </cesium-container>
  <div style="position: absolute; top: 10px; left: 10px; z-index: 9">
    <el-button @click="addHeatmap3d()">添加3d热力图</el-button>
    <el-button @click="addHeatmap3d2()">添加3d热力图2</el-button>
    <el-button @click="add3dGrid()">添加3d网格</el-button>
    <el-button @click="addKrigingRain()">添加雨量插值</el-button>
    <el-button @click="addKrigingRain2()">添加降雨等值面(可用)</el-button>
    <el-button @click="handleClear()">清空</el-button>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import Delaunator from "delaunator";
import { KrigingInstance } from "./KrigingInstance.js";
import { kriging } from './kriging.js'
import riverRegon2 from "./riverRegon2.json";
import {
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
  watch,
} from "vue";
import { useStore } from "vuex";
import CesiumContainer from "@/views/CesiumContainer.vue";
import Heatmap3d from "./heatmap3d.js";

export default defineComponent({
  components: { CesiumContainer },
  setup() {
    const store = useStore();
    let heatMap = ref();
    //！ 网格位置
    let modelMatrixWhereTo = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(113.802689907, 35.373933211, 0.0)
    );

    //！ 网格容器
    let custom_2DMesh = [];
    let instances2DMesh = [];

    //设置值的区间(16个区间)
    var range = [48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104];
    // var range=[0,1152.1424547605388, 1218.128785640212, 1284.1151165198853, 1350.1014473995588, 1416.0877782792318, 1482.0741091589052, 1548.0604400385785, 1814.0467709182517]
    //设置对应颜色信息(16颜色值)
    var colorRange = [
      Cesium.Color.fromBytes(127, 1, 131, 255),
      Cesium.Color.fromBytes(85, 1, 171, 255),
      Cesium.Color.fromBytes(40, 0, 212, 255),
      Cesium.Color.fromBytes(2, 1, 253, 255),
      Cesium.Color.fromBytes(2, 56, 226, 255),
      Cesium.Color.fromBytes(1, 109, 194, 255),
      Cesium.Color.fromBytes(2, 167, 167, 255),
      Cesium.Color.fromBytes(0, 196, 108, 255),
      Cesium.Color.fromBytes(0, 226, 57, 255),
      Cesium.Color.fromBytes(0, 255, 0, 255),
      Cesium.Color.fromBytes(84, 255, 1, 255),
      Cesium.Color.fromBytes(171, 255, 1, 255),
      Cesium.Color.fromBytes(255, 255, 3, 255),
      Cesium.Color.fromBytes(255, 171, 2, 255),
      Cesium.Color.fromBytes(253, 85, 3, 255),
      Cesium.Color.fromBytes(254, 1, 3, 255),
    ];
    var colorRange1 = [
      Cesium.Color.fromBytes(0, 16, 295, 255),
      Cesium.Color.fromBytes(0, 142, 114, 255),
      Cesium.Color.fromBytes(0, 240, 10, 255),
      Cesium.Color.fromBytes(72, 254, 0, 255),
      Cesium.Color.fromBytes(2, 56, 226, 255),
      Cesium.Color.fromBytes(1, 109, 194, 255),
      Cesium.Color.fromBytes(2, 167, 167, 255),
      Cesium.Color.fromBytes(0, 196, 108, 255),
      Cesium.Color.fromBytes(0, 226, 57, 255),
      Cesium.Color.fromBytes(0, 255, 0, 255),
      Cesium.Color.fromBytes(84, 255, 1, 255),
      Cesium.Color.fromBytes(171, 255, 1, 255),
      Cesium.Color.fromBytes(255, 255, 3, 255),
      Cesium.Color.fromBytes(255, 171, 2, 255),
      Cesium.Color.fromBytes(253, 85, 3, 255),
      Cesium.Color.fromBytes(254, 1, 3, 255),
    ];

    // 添加热力图
    const addHeatmap3d = () => {
      const { viewer } = store.state;
      let list = [];
      for (let i = 0; i < 100; i++) {
        list.push({
          lnglat: [
            117.28 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1),
            31.923 + Math.random() * 0.1 * (Math.random() > 0.5 ? 1 : -1),
          ],
          value: 1000 * Math.random(),
        });
      }
      heatMap = new Heatmap3d(viewer, {
        list: list,
        raduis: 15,
        baseHeight: 800,
        primitiveType: "TRNGLE",
        gradient: {
          ".3": "blue",
          ".5": "green",
          ".7": "yellow",
          ".95": "red",
        },
      });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(117.28, 31.923, 20000),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
      console.log("heatmap3d: ", heatMap);
    };
    const add3dGrid = () => {
      const { viewer } = store.state;
      let testdata = {
        position: {
          x: 115.66560745239256,
          y: 34.41760191899927,
        },

        links: [0, 1, 1, 2, 2, 0],
        vertexs: [
          115.66560745239256, 34.41760191899927, 100, 115.67530632019043,
          34.41795594404557, 100, 115.685133934021, 34.4180621512672, 100,
          115.69406032562254, 34.4180621512672, 100, 115.69509029388428,
          34.41700007298082, 100,
        ],
      };
      Draw2DMeshPloygons(testdata, true, 200);
    };
    // 设置相机是否进入地下
    const limitCameraToGround = (isOpen) => {
      //  if (limitCameraHandler) {
      //             limitCameraHandler();
      //             limitCameraHandler = null;
      //         }
      let limitCameraHandler = viewer.camera.changed.addEventListener(
        function () {
          if (
            viewer.camera._suspendTerrainAdjustment &&
            viewer.scene.mode === Cesium.SceneMode.SCENE3D
          ) {
            viewer.camera._suspendTerrainAdjustment = !isOpen;
            viewer.camera._adjustHeightForTerrain();
          }
        }
      );
    };
    //查找所在区间的颜色
    const findRangeColor = (array, val) => {
      //如果值小于range最小的值时，则奖励0
      if (val < Math.min.apply(null, array)) {
        return 0;
      }
      //如果值大于range最大的值时，则奖励最高一档
      if (val > Math.max.apply(null, array)) {
        return array.length - 1;
      }
      var idx = 0,
        i = 0,
        j = array.length;
      for (i; i < j; i++) {
        if (array[i] > val) {
          idx = i;
          break;
        }
      }
      return idx;
    };

    const GenerateMeshColor = (rainValue, alphaDefault) => {
      var curColor = Cesium.Color.fromBytes(255, 255, 255, 120);

      if (alphaDefault == undefined) {
        alphaDefault = 0.2;
      }
      //根据数据查询颜色值
      if (rainValue > 0) {
        curColor = colorRange[findRangeColor(range, rainValue)];
      }

      return curColor;
    };

    //! 绘制维网格
    const Draw2DMeshPloygons = (data, ifFill, value) => {
      const { viewer } = store.state;
      Clear2DMeshPloygons();
      instances2DMesh = [];

      // ！ 根据data
      if (data != undefined) {
        // var vertexs = data.vertexs;
        var links = data.links;
        var curdataArr = data.vertexs;

        var colorArr = [];
        range = [0];
        var arr = [];
        for (var i = 0; i != curdataArr.length / 3; ++i) {
          var zFieldValue = curdataArr[3 * (i + 1) - 1];
          zFieldValue += parseInt(value);
          arr.push(zFieldValue);
        }
        arr.sort(function (a, b) {
          return a - b;
        });
        var min = arr[0];
        var max = arr[arr.length - 1];
        var intvl = max - min;
        for (var i = 0; i < 15; i++) {
          if (i == 14) {
            range.push(max + 1);
          } else {
            range.push(min + (intvl / 15) * (i + 1));
          }
        }
        var legendTitles = [];
        for (var i = 1; i < range.length; i++) {
          if (i == 1) {
            legendTitles.push("低于" + range[i]);
          } else {
            if (i == range.length - 1) {
              legendTitles.push(range[i - 1] + "range[i]" + range[i]);
              legendTitles.push("高于" + range[i]);
            } else {
              legendTitles.push(range[i - 1] + "range[i]" + range[i]);
            }
          }
        }
        localStorage.MeshRange = range;
        for (var i = 0; i != curdataArr.length / 3; ++i) {
          var zFieldValue = curdataArr[3 * (i + 1) - 1];
          zFieldValue += parseInt(value);
          var tempColor = GenerateMeshColor(zFieldValue, 0.6);
          colorArr.push(tempColor.red);
          colorArr.push(tempColor.green);
          colorArr.push(tempColor.blue);
          colorArr.push(tempColor.alpha);
        }
      } else {
        var vertexs = [];
        var lon = 0;
        var lat = 0;

        var curdataArr = [];
        curdataArr[0] = lon;
        curdataArr[1] = lat;
        curdataArr[2] = 100;

        curdataArr[3] = lon + 5000;
        curdataArr[4] = lat;
        curdataArr[5] = 100;

        curdataArr[6] = lon + 5000;
        curdataArr[7] = lat + 5000;
        curdataArr[8] = 100;

        curdataArr[9] = lon + 5000 + 5000;
        curdataArr[10] = lat;
        curdataArr[11] = 100;

        curdataArr[12] = lon + 5000 + 5000;
        curdataArr[13] = lat + 5000;
        curdataArr[14] = 100;

        var links = new Uint32Array(6);
        links[0] = 0;
        links[1] = 1;
        links[2] = 2;
        links[3] = 1;
        links[4] = 3;
        links[5] = 4;
      }
      // ! 创建图元绘制
      var geometryMesh = new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: curdataArr,
          }),
          color: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 4,
            values: colorArr,
          }),
        },
        indices: links,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(curdataArr),
        vertexFormat: Cesium.VertexFormat.POSITION_AND_COLOR,
      });

      //网格放置位置(放置到起点经纬度位置)
      var fillOrMeshGeometry = geometryMesh;
      if (!ifFill) {
        fillOrMeshGeometry = Cesium.GeometryPipeline.toWireframe(geometryMesh);
      }

      //！ 图元放置位置计算
      var modelMatrixWhereTo = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(data.position.x, data.position.y, 0)
      );

      var instanceMesh = new Cesium.GeometryInstance({
        //geometry: geometryMesh,
        geometry: fillOrMeshGeometry,
        modelMatrix: modelMatrixWhereTo,
        // attributes: {
        //     color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUEVIOLET)
        // }
      });

      instances2DMesh.push(instanceMesh);

      custom_2DMesh = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: instances2DMesh,
          // appearance:new Cesium.PerInstanceColorAppearance( {
          //     translucent : true,
          //     closed : true,
          //     material: Cesium.Material.fromType('Grid')
          // } )
          appearance: new Cesium.PolylineColorAppearance({
            translucent: false,
          }),
        })
      );
    };
    //! 绘制维网格
    const UpdateMeshGridColorsByTimeData = (data, ifFill, value, tmMa) => {
      const { viewer } = store.state;
      Clear2DMeshPloygons();
      // ！ 根据data
      if (data != undefined) {
        // var vertexs = data.vertexs;
        var links = data.links;
        var curdataArr = data.vertexs;

        var colorArr = [];
        range = [0];
        var arr = [];
        for (var i = 0; i != curdataArr.length / 3; i++) {
          arr.push(tmMa[i] == undefined ? 1 : tmMa[i].Z);
        }
        arr.sort(function (a, b) {
          return a - b;
        });
        var min = arr[0];
        var max = arr[arr.length - 1];
        var intvl = max - min;
        for (var i = 0; i < 15; i++) {
          if (i == 14) {
            range.push(max + 1);
          } else {
            range.push(min + (intvl / 15) * (i + 1));
          }
        }
        var legendTitles = [];
        for (var i = 1; i < range.length; i++) {
          if (i == 1) {
            legendTitles.push("低于" + range[i]);
          } else {
            if (i == range.length - 1) {
              legendTitles.push(range[i - 1] + "range[i]" + range[i]);
              legendTitles.push("高于" + range[i]);
            } else {
              legendTitles.push(range[i - 1] + "range[i]" + range[i]);
            }
          }
        }
        //updateLegendByMAcesh(legendTitles);
        localStorage.MeshRange = range;
        for (var i = 0; i != curdataArr.length / 3; ++i) {
          // var zFieldValue = curdataArr[3*(i+1) - 1];
          // zFieldValue += parseInt(value);
          var tempColor = GenerateMeshColor(
            tmMa[i] == undefined ? 1 : tmMa[i].Z,
            0.6
          );
          colorArr.push(tempColor.red);
          colorArr.push(tempColor.green);
          colorArr.push(tempColor.blue);
          colorArr.push(tempColor.alpha);
        }
      }

      // ! 创建图元绘制
      if (instances2DMesh.length && instances2DMesh[0] != undefined) {
        if (
          instances2DMesh[0].geometry.attributes.color.values.length ==
          colorArr.length
        ) {
          debugger;
          instances2DMesh[0].geometry.attributes.color.values = colorArr;
        }
      }

      custom_2DMesh = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: instances2DMesh,
          // appearance:new Cesium.PerInstanceColorAppearance( {
          //     translucent : true,
          //     closed : true,
          //     material: Cesium.Material.fromType('Grid')
          // } )
          appearance: new Cesium.PolylineColorAppearance({
            translucent: false,
          }),
        })
      );
    };
    const Clear2DMeshPloygons = () => {
      const { viewer } = store.state;
      //! 关闭网格
      if (custom_2DMesh) {
        custom_2DMesh.show = false;
        viewer.scene.primitives.remove(custom_2DMesh);
      }
    };
    const addHeatmap3d2 = () => {
      const { viewer } = store.state;
      // const points = [
      //   {
      //     name: "工大金川校区",
      //     lng: 111.551,
      //     lat: 40.7872,
      //     co2: "293",
      //     n2o: "218",
      //     hfcs: "236",
      //     pfcs: "259",
      //     sf6: "286",
      //     ch4: "258",
      //     id: 18985,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      //   {
      //     name: "红旗小学",
      //     lng: 111.604,
      //     lat: 40.8192,
      //     co2: "128",
      //     n2o: "165",
      //     hfcs: "114",
      //     pfcs: "247",
      //     sf6: "209",
      //     ch4: "178",
      //     id: 18986,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      //   {
      //     name: "海东办",
      //     lng: 111.665,
      //     lat: 40.8393,
      //     co2: "108",
      //     n2o: "169",
      //     hfcs: "183",
      //     pfcs: "268",
      //     sf6: "235",
      //     ch4: "285",
      //     id: 18987,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      //   {
      //     name: "如意水处理厂",
      //     lng: 111.744,
      //     lat: 40.773,
      //     co2: "459",
      //     n2o: "263",
      //     hfcs: "127",
      //     pfcs: "293",
      //     sf6: "273",
      //     ch4: "252",
      //     id: 18988,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      //   {
      //     name: "二十九中",
      //     lng: 111.736,
      //     lat: 40.8086,
      //     co2: "117",
      //     n2o: "221",
      //     hfcs: "143",
      //     pfcs: "116",
      //     sf6: "274",
      //     ch4: "477",
      //     id: 18989,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      //   {
      //     name: "呼市一监",
      //     lng: 111.752,
      //     lat: 40.8383,
      //     co2: "409",
      //     n2o: "216",
      //     hfcs: "156",
      //     pfcs: "157",
      //     sf6: "150",
      //     ch4: "398",
      //     id: 18990,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      //   {
      //     name: "化肥厂生活区",
      //     lng: 111.723,
      //     lat: 40.7573,
      //     co2: "244",
      //     n2o: "250",
      //     hfcs: "207",
      //     pfcs: "195",
      //     sf6: "115",
      //     ch4: "481",
      //     id: 18991,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      //   {
      //     name: "小召",
      //     lng: 111.654,
      //     lat: 40.7995,
      //     co2: "366",
      //     n2o: "295",
      //     hfcs: "134",
      //     pfcs: "292",
      //     sf6: "146",
      //     ch4: "331",
      //     id: 18992,
      //     time: "2023-04-27T03:00:00.000Z",
      //   },
      // ];
      let quota = 'value';
      //生成turf点对象
      // const pointsTurf = points.map((v) => {
      //   return new turf.point([v.lng, v.lat], v);
      // });

      const options = {
        gridType: "point",
        property: quota.toLowerCase(),
        units: "meters",
      };
      let boundaries = [111.551, 40.7872, 111.8000, 41.0000]
      // var points = turf.randomPoint(30, { bbox: turf.bbox(boundaries) });
      var points = turf.randomPoint(10, { bbox: boundaries });
 
//再生成些随机数做属性
turf.featureEach(points, function (currentFeature, featureIndex) {
  currentFeature.properties = { value: (Math.random() * 100).toFixed(2) };
});
      //生成插值格网
      const grid = turf.interpolate(
        // turf.featureCollection(pointsTurf),
        points,
        1000,
        options
      );
      const lnglat = [];
      let lnglatHeight = [];
      let colors = [];
      //计算最大最小值
      const max = Math.max(
        ...grid.features.map((v) => v.properties[quota.toLowerCase()])
      );
      const min = Math.min(
        ...grid.features.map((v) => v.properties[quota.toLowerCase()])
      );
      //计算positions和colors
      grid.features.forEach((f, index) => {
        const coordinates = f.geometry.coordinates;
        let value = f.properties["co2"];
        lnglat.push(coordinates);
        lnglatHeight.push([...f.geometry.coordinates, value * 5 + 1000]);
        //计算从绿到红的中间颜色
        colors.push(valueToColor3d(value, min, max));

        lnglatHeight[0][2] = 178;
        let positions = Cesium.Cartesian3.fromDegreesArrayHeights(
          // lnglatHeight.flat(Infinity)
          [lnglatHeight[0][0], lnglatHeight[0][1], lnglatHeight[0][2]] 
        );
        positions = positions.map((v) => [v.x, v.y, v.z]).flat(Infinity);
        //根据二维经纬度生成三角网
        const delaunay = Delaunator.from(lnglat);
        //构建索引
        let indices = delaunay.triangles;

        colors = colors.flat(Infinity);
      });
      const instance = new Cesium.GeometryInstance({
        geometry: Cesium.GeometryPipeline.computeNormal(
          generateGeometry(positions, colors, indices)
        ),
      });

      const primitive = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: instance,
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: false, //为true时没有阴影，很难看到三维效果
            translucent: false,
          }),
          asynchronous: false,
        })
      );
    };
    const valueToColor3d = (value, minValue, maxValue) => {
      const percentage = (value - minValue) / (maxValue - minValue);
      const red = Math.round(255 * percentage);
      const green = Math.round(255 * (1 - percentage));
      return [red / 255, green / 255, 0, 1];
    };
    /**
     * @description: 生成几何体
     * @param {*} positions
     * @param {*} colors
     * @param {*} indices
     * @return {*}
     */
    const generateGeometry = (positions, colors, indices) => {
      const attributes = new Cesium.GeometryAttributes({
        position: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: new Float64Array(positions),
        }),
        color: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.FLOAT,
          componentsPerAttribute: 4,
          values: new Float32Array(colors),
        }),
      });
      // 包围球
      const boundingSphere = Cesium.BoundingSphere.fromVertices(
        positions,
        new Cesium.Cartesian3(0.0, 0.0, 0.0),
        3
      );
      console.log(boundingSphere);
      const geometry = new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: boundingSphere,
      });
      return geometry;
    };
    const addKrigingRain = () => {
      const { viewer } = store.state;
      let points = [
        109.00146364571293, 30.92184814168462, 100, 109.07339552200017,
        30.933437520000155, 150, 109.10197060600035, 30.96258908700014, 50,
        109.00139389259749, 30.95328167200654, 520, 109.00146364571293,
        30.92184814168462, 420,
      ];
      var colors = [
        "#00A600",
        "#01A600",
        "#03A700",
        "#04A700",
        "#05A800",
        "#07A800",
        "#08A900",
        "#09A900",
      ];
      let instance = new KrigingInstance(
        viewer,
        points,
        Cesium.Color.ALICEBLUE,
        riverRegon2,
        "RIVER"
      );
      instance.addViewer();
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          109.00146364571293,
          30.92184814168462,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    };
    const drawKriging = (viewer,values,colors) => {
      // let sites = [
      //   109.00146364571293, 30.92184814168462, 100, 109.07339552200017,
      //   30.933437520000155, 150, 109.10197060600035, 30.96258908700014, 50,
      //   109.00139389259749, 30.95328167200654, 520, 109.00146364571293,
      //   30.92184814168462, 420,
      // ];
      
      let sites = [
        {type: '1',id: 0, state: 'normal', label: {text: 'aaa'},_position:{_value: {x:109.00146364571293, y:30.92184814168462, z:500}}},
        {type: '1',id: 1, state: 'normal', label: {text: 'ccc'},_position:{_value: {x:109.07339552200017, y:30.933437520000155, z:550}}},
        {type: '1',id: 2, state: 'normal', label: {text: 'xxx'},_position:{_value: {x:109.10197060600035, y:30.96258908700014, z:450}}},
        {type: '1',id: 3, state: 'normal', label: {text: 'xxx'},_position:{_value: {x:109.00139389259749, y:30.95328167200654, z:480}}},
        {type: '1',id: 4, state: 'normal', label: {text: 'xxx'},_position:{_value: {x:109.00146364571293, y:30.92184814168462, z:490}}},
      ]
      let ShowName = 'drawKriging';
    //如果存在雨量图则删除雨量图
    var KrigingRain = viewer.entities.getById('KrigingRain');
    viewer.entities.remove(KrigingRain);
    var lngs = [];//经度集合
    var lats = [];//纬度集合
    var siteValue = [];//站点数值集合
    var coords = [];//绘制面的所有点
    var ex = [];//绘制面的jeojson
    ex = [riverRegon2.features[0].geometry.coordinates[0]];
    for(var i=0; i < sites.length; i++){
      if(sites[i].type == "1"){
        for(var j=0; j < values.length; j++){
          if(sites[i].id == values[j].code && sites[i].state == "normal"){
            sites[i].label.text = values[j].value+"";
            var ellipsoid=viewer.scene.globe.ellipsoid;
            var cartesian3=new Cesium.Cartesian3(sites[i]._position._value.x,sites[i]._position._value.y,sites[i]._position._value.z);
            var cartographic=ellipsoid.cartesianToCartographic(cartesian3);
            var lat=Cesium.Math.toDegrees(cartographic.latitude);
            var lng=Cesium.Math.toDegrees(cartographic.longitude);
            // var alt=cartographic.height;
            siteValue.push(values[j].value);
            lngs.push(lng);
            lats.push(lat);
          }
        }
      }
    }
    for(let item of riverRegon2.features[0].geometry.coordinates[0]){
      coords.push(...item)
    }
    if (siteValue.length > 2) {
        const polygon = new Cesium.PolygonGeometry ({
            polygonHierarchy: new Cesium.PolygonHierarchy (
                Cesium.Cartesian3.fromDegreesArray ( coords )
            )
        });//构造面，方便计算范围
        let extent = Cesium.PolygonGeometry.computeRectangle ({
            polygonHierarchy: new Cesium.PolygonHierarchy (
                Cesium.Cartesian3.fromDegreesArray ( coords )
            )   
        });//范围（弧度）
        let minx = Cesium.Math.toDegrees ( extent.west );//转换为经纬度
        let miny = Cesium.Math.toDegrees ( extent.south );
        let maxx = Cesium.Math.toDegrees ( extent.east );
        let maxy = Cesium.Math.toDegrees ( extent.north );
        let canvas = null;//画布
        function getCanvas() {
            //1.用克里金训练一个variogram对象
            let variogram = kriging.train ( siteValue, lngs, lats, 'exponential', 0, 100 );
            //2.使用刚才的variogram对象使polygons描述的地理位置内的格网元素具备不一样的预测值；
            let grid = kriging.grid ( ex, variogram, (maxy - miny) / 500 );
            canvas = document.createElement ( 'canvas' );
            canvas.width = 1000;
            canvas.height = 1000;
            canvas.style.display = 'block';
            canvas.getContext ( '2d' ).globalAlpha = 1;//设置透明度
            //3.将得到的格网预测值渲染到canvas画布上
            kriging.plotCustomize ( canvas, grid, [minx, maxx], [miny, maxy], colors );
        }
        getCanvas ();
        if (canvas != null) {
          let KrigingObj = viewer.entities.add ({
            id: "KrigingRain",
            polygon: {
              show: ShowName == "drawKriging"?true:false,
              clampToGround: true,
              hierarchy: {
                  positions: Cesium.Cartesian3.fromDegreesArray ( coords )
              },
              material: new Cesium.ImageMaterialProperty ({
                  image: canvas//使用贴图的方式将结果贴到面上
              })
            }
        });
      }
    }
};
    const addKrigingRain2 = () => {
      const { viewer } = store.state;
      var lngs = [102.12186, 101.97394, 102.0567];//经度集合 结构：[102.12186, 101.97394, 102.0567]
var lats = [22.3089599, 22.34198, 22.1919399];//纬度集合 结构：[22.3089599, 22.34198, 22.1919399]
var siteValue = [12, 15.5];//站点数值集合 结构：[12, 15.5]
var coords = [102.2158, 20.05916, 102.2175, 20.05916, 102.22083, 20.05583];//绘制面的所有点 结构：[102.2158, 20.05916, 102.2175, 20.05916, 102.22083, 20.05583]
var ex = [[[102.2158, 20.05916], [102.2175, 20.05916], [102.22083, 20.05583]]];//绘制面的jeojson 结构：[[[102.2158, 20.05916], [102.2175, 20.05916], [102.22083, 20.05583]]]
let colors = [
        { min: 0, max: 5, color: "#A9F08E" }, 
        { min: 5, max: 10, color: "#72D66B" }, 
        { min: 10, max: 25, color: "#3DB83D" }, 
        { min: 25, max: 50, color: "#61B7FC" }, 
        { min: 50, max: 100, color: "#0001FE" }, 
        { min: 100, max: 250, color: "#FD00FA" }, 
        { min: 250, max: 1000, color: "#7F013E" }, 
];
// let points = [
//         109.00146364571293, 30.92184814168462, 100, 109.07339552200017,
//         30.933437520000155, 150, 109.10197060600035, 30.96258908700014, 50,
//         109.00139389259749, 30.95328167200654, 520, 109.00146364571293,
//         30.92184814168462, 420,
//       ];
      let values = [
        {code: 0, value: 12},
        {code: 1, value: 15.5},
        {code: 2, value: 180.7},
        {code: 3, value: 100.2},
        {code: 4, value: 900.7},
      ]
drawKriging(viewer, values, colors);
viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          109.00146364571293,
          30.92184814168462,
          20000
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    };
    const handleClear = () => {
      if (heatMap) {
        heatMap.destroy();
      }
    };
    onMounted(() => {
      // initViewer();
    });
    return {
      handleClear,
      addHeatmap3d,
      addHeatmap3d2,
      add3dGrid,
      addKrigingRain,
      addKrigingRain2,
      limitCameraToGround,
    };
  },
});
</script>

<style scoped>
/* @bgc:#000; */
#cesiumContainer {
  background: #000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}
.cesiumContainerRight {
  width: 30%;
  height: 69%;
  position: absolute;
  bottom: 0;
  right: 0;
}
:deep(.cesium-viewer-cesium3DTilesInspectorContainer) {
  right: 400px;
  top: 200px;
}
.slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 4px;
  height: 100%;
  z-index: 9999;
}
.slider:hover {
  cursor: ew-resize;
}
#creditContainer {
  display: none;
}
</style>
